<?php

namespace App\Http\Controllers;

use App\Models\Server;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Inertia\Inertia;
use Stripe\StripeClient;
use App\Services\PterodactylService;

class ServerController extends Controller
{
    public function show(Server $server)
    {
        abort_unless($server->user_id === Auth::id(), 403);

        $invoices = [];
        $nextBilling = null;

        try {
            $user = Auth::user();

            if ($server->subscription_id) {
                $stripe = new StripeClient(config('cashier.secret'));

                // Fetch subscription details for next billing
                try {
                    $stripeSubscription = $stripe->subscriptions->retrieve($server->subscription_id);

                    if ($stripeSubscription->status === 'active' && isset($stripeSubscription->current_period_end)) {
                        $upcomingInvoice = $stripe->invoices->retrieveUpcoming([
                            'subscription' => $server->subscription_id,
                        ]);

                        $nextBilling = [
                            'date' => date('Y-m-d', $stripeSubscription->current_period_end),
                            'amount' => sprintf('%s %.2f', strtoupper($upcomingInvoice->currency), $upcomingInvoice->total / 100),
                        ];
                    }
                } catch (\Throwable $e) {
                    \Log::error('Next billing fetch error: ' . $e->getMessage());
                }

                // Fetch invoices
                $stripeInvoices = $stripe->invoices->all([
                    'subscription' => $server->subscription_id,
                    'limit' => 20,
                ]);

                $invoices = collect($stripeInvoices->data)->map(function ($si) {
                    $total = sprintf('%s %.2f', strtoupper($si->currency), $si->total / 100);
                    return [
                        'id' => $si->id,
                        'number' => $si->number,
                        'total' => $total,
                        'date' => $si->created ? date('Y-m-d', $si->created) : null,
                        'paid' => ($si->status === 'paid' || $si->paid === true),
                        'status' => $si->status,
                        'hosted_invoice_url' => $si->hosted_invoice_url ?? null,
                    ];
                })->all();
            }
        } catch (\Throwable $e) {
            \Log::error('Server invoices error: ' . $e->getMessage(), [
                'server_id' => $server->id,
                'subscription_id' => $server->subscription_id
            ]);
            $invoices = [];
        }

        // Get plan resources
        $resources = null;
        $plan = $server->plan;
        if ($plan) {
            $planResources = Config::get("plans.resources.{$plan->key}");
            if ($planResources) {
                $resources = [
                    'memory_mb' => $planResources['memory_mb'] ?? 0,
                    'disk_mb' => $planResources['disk_mb'] ?? 0,
                    'cpu_percent' => $planResources['cpu_percent'] ?? 0,
                    'databases' => $planResources['databases'] ?? 0,
                    'backups' => $planResources['backups'] ?? 0,
                    'allocations' => $planResources['allocations'] ?? 1,
                ];
            }
        }

        return Inertia::render('server-show', [
            'server' => [
                'id' => $server->id,
                'name' => $server->server_name,
                'game' => $server->game,
                'billing_cycle' => $server->billing_cycle,
                'pending_billing_cycle' => $server->pending_billing_cycle,
                'status' => $server->status,
                'created_at' => $server->created_at,
                'plan_name' => $plan ? ucfirst($plan->key) : null,
            ],
            'resources' => $resources,
            'invoices' => $invoices,
            'nextBilling' => $nextBilling,
            'csrf' => csrf_token(),
        ]);
    }

    public function cancel(Request $request, Server $server)
    {
        abort_unless($server->user_id === Auth::id(), 403);

        try {
            if (!$server->subscription_id) {
                return back()->withErrors(['cancel' => 'No subscription found for this server.']);
            }

            // Try Cashier first
            $cancelled = false;
            if ($server->subscription_name) {
                $sub = $request->user()->subscription($server->subscription_name);
                if ($sub && !$sub->canceled()) {
                    $sub->cancel();
                    $cancelled = true;
                    \Log::info('Subscription cancelled via Cashier', ['subscription_name' => $server->subscription_name]);
                }
            }

            // Fallback to direct Stripe API call
            if (!$cancelled) {
                $stripe = new StripeClient(config('cashier.secret'));
                $stripe->subscriptions->update($server->subscription_id, [
                    'cancel_at_period_end' => true,
                ]);
                \Log::info('Subscription cancelled via Stripe API', ['subscription_id' => $server->subscription_id]);
            }

            $server->status = 'cancelled';
            $server->save();

            try {
                if ($server->pterodactyl_server_id) {
                    app(PterodactylService::class)->suspendServer((int) $server->pterodactyl_server_id);
                    \Log::info('Pterodactyl server suspended after cancel', [
                        'server_id' => $server->id,
                        'pterodactyl_server_id' => $server->pterodactyl_server_id,
                    ]);
                }
            } catch (\Throwable $e) {
                \Log::warning('Failed to suspend Pterodactyl server after cancel: ' . $e->getMessage(), [
                    'server_id' => $server->id,
                    'pterodactyl_server_id' => $server->pterodactyl_server_id,
                ]);
            }

            return back()->with('success', 'Server cancelled successfully. Access will remain until the end of the billing period.');
        } catch (\Throwable $e) {
            \Log::error('Server cancellation error: ' . $e->getMessage(), [
                'server_id' => $server->id,
                'subscription_id' => $server->subscription_id,
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['cancel' => 'Failed to cancel subscription. Please try again or contact support.']);
        }
    }

    public function switchBilling(Request $request, Server $server)
    {
        abort_unless($server->user_id === Auth::id(), 403);

        $validated = $request->validate([
            'billing' => ['required', 'in:monthly,yearly'],
        ]);

        try {
            if (!$server->subscription_id) {
                return back()->withErrors(['billing' => 'No subscription found for this server.']);
            }

            // Validate plan_id exists and is safe
            if (!preg_match('/^[a-zA-Z0-9_-]+$/', $server->plan_id)) {
                \Log::error('Invalid plan_id format detected', ['plan_id' => $server->plan_id]);
                return back()->withErrors(['billing' => 'Invalid server configuration.']);
            }

            $prices = Config::get('plans.prices');

            // Safely check for price configuration
            if (!is_array($prices) ||
                !isset($prices[$server->plan_id]) ||
                !is_array($prices[$server->plan_id]) ||
                !isset($prices[$server->plan_id][$validated['billing']])) {
                \Log::warning('Price configuration not found', [
                    'plan_id' => $server->plan_id,
                    'billing' => $validated['billing']
                ]);
                return back()->withErrors(['billing' => 'No matching price configured for this plan.']);
            }

            $newPriceId = $prices[$server->plan_id][$validated['billing']];

            // Validate the price ID format (Stripe price IDs)
            if (!preg_match('/^price_[a-zA-Z0-9]+$/', $newPriceId)) {
                \Log::error('Invalid price_id format detected', ['price_id' => $newPriceId]);
                return back()->withErrors(['billing' => 'Invalid price configuration.']);
            }

            \Log::info('Attempting billing switch', [
                'server_id' => $server->id,
                'subscription_id' => $server->subscription_id,
                'old_billing' => $server->billing_cycle,
                'new_billing' => $validated['billing'],
                'new_price_id' => $newPriceId
            ]);

            // Try Cashier first
            $swapped = false;
            if ($server->subscription_name) {
                $subscription = $request->user()->subscription($server->subscription_name);
                if ($subscription && $subscription->active()) {
                    $subscription->swap($newPriceId);
                    $swapped = true;
                    \Log::info('Billing switched via Cashier', ['subscription_name' => $server->subscription_name]);
                }
            }

            // Fallback to direct Stripe API call
            if (!$swapped) {
                $stripe = new StripeClient(config('cashier.secret'));
                $stripeSubscription = $stripe->subscriptions->retrieve($server->subscription_id);

                // Get the subscription item ID
                $itemId = $stripeSubscription->items->data[0]->id;

                // Schedule price change at end of current period
                $stripe->subscriptions->update($server->subscription_id, [
                    'items' => [
                        [
                            'id' => $itemId,
                            'price' => $newPriceId,
                        ],
                    ],
                    'proration_behavior' => 'none', // No prorations - switch at period end
                    'billing_cycle_anchor' => 'unchanged', // Keep current billing cycle
                ]);

                \Log::info('Billing switched via Stripe API (at period end)', [
                    'subscription_id' => $server->subscription_id,
                    'item_id' => $itemId,
                    'new_price' => $newPriceId,
                    'current_period_end' => $stripeSubscription->current_period_end
                ]);
            }

            $server->pending_billing_cycle = $validated['billing'];
            $server->save();

            return back()->with('success', 'Billing cycle will change to ' . $validated['billing'] . ' at the end of your current billing period.');
        } catch (\Throwable $e) {
            \Log::error('Billing switch error: ' . $e->getMessage(), [
                'server_id' => $server->id,
                'subscription_id' => $server->subscription_id,
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['billing' => 'Failed to switch billing cycle. Please try again or contact support.']);
        }
    }

    public function destroy(Request $request, Server $server)
    {
        abort_unless($server->user_id === Auth::id(), 403);

        // Only allow removal if cancelled (strict as requested)
        if ($server->status !== 'cancelled') {
            return back()->withErrors(['remove' => 'You can only remove cancelled servers.']);
        }

        $removeInvoices = $request->boolean('remove_invoices', false);

        try {
            // Best-effort cleanup: if a Stripe subscription still exists, cancel immediately
            if ($server->subscription_id) {
                try {
                    $stripe = new StripeClient(config('cashier.secret'));
                    $sub = $stripe->subscriptions->retrieve($server->subscription_id);
                    if ($sub && $sub->status !== 'canceled') {
                        $stripe->subscriptions->cancel($server->subscription_id, []);
                        \Log::info('Subscription hard-cancelled before deletion', [
                            'subscription_id' => $server->subscription_id,
                            'server_id' => $server->id,
                        ]);
                    }

                    // Optionally delete invoices associated with this subscription
                    if ($removeInvoices) {
                        // Note: Stripe generally does not allow deleting finalized invoices;
                        // but we can void or mark uncollectible when possible. We'll try voiding open/unpaid invoices.
                        $invoices = $stripe->invoices->all([
                            'subscription' => $server->subscription_id,
                            'limit' => 100,
                        ]);

                        foreach ($invoices->data as $inv) {
                            try {
                                // Try to void if not paid
                                if ($inv->status !== 'paid') {
                                    $stripe->invoices->voidInvoice($inv->id);
                                }
                                // Stripe won't truly "delete" invoices; voiding is the closest.
                            } catch (\Throwable $e) {
                                \Log::warning('Invoice void error: ' . $e->getMessage(), [
                                    'invoice_id' => $inv->id,
                                    'server_id' => $server->id,
                                ]);
                            }
                        }
                    }
                } catch (\Throwable $e) {
                    \Log::warning('Failed Stripe cleanup on delete: ' . $e->getMessage(), [
                        'server_id' => $server->id,
                        'subscription_id' => $server->subscription_id,
                    ]);
                }
            }

            // If you store local invoice records tied to server, delete them here
            // Example (uncomment/adjust if you have a model):
            // if ($removeInvoices) {
            //     \App\Models\Invoice::where('server_id', $server->id)->delete();
            // }

            try {
                if ($server->pterodactyl_server_id) {
                    app(PterodactylService::class)->forceDeleteServer((int) $server->pterodactyl_server_id);
                    \Log::info('Pterodactyl server force-deleted', [
                        'server_id' => $server->id,
                        'pterodactyl_server_id' => $server->pterodactyl_server_id,
                    ]);
                }
            } catch (\Throwable $e) {
                // We’ll proceed with local delete even if remote delete fails, but log for follow-up.
                \Log::warning('Failed to force-delete Pterodactyl server: ' . $e->getMessage(), [
                    'server_id' => $server->id,
                    'pterodactyl_server_id' => $server->pterodactyl_server_id,
                ]);
            }

            $server->delete();

            return redirect()->route('dashboard.index')->with('success', 'Server removed from your account.');
        } catch (\Throwable $e) {
            \Log::error('Server delete error: ' . $e->getMessage(), [
                'server_id' => $server->id,
                'trace' => $e->getTraceAsString(),
            ]);
            return back()->withErrors(['remove' => 'Failed to remove server. Please try again or contact support.']);
        }
    }

    public function panel(Server $server)
    {
        abort_unless($server->user_id === Auth::id(), 403);

        if ($server->status !== 'active') {
            return redirect()->route('dashboard.servers.show', $server)->withErrors(['panel' => 'Server must be active to access the panel.']);
        }

        if (!$server->pterodactyl_identifier) {
            return redirect()->route('dashboard.servers.show', $server)->withErrors(['panel' => 'Panel access not available for this server.']);
        }

        // Build the Pterodactyl panel URL using PTERO_URL from .env
        $panelBaseUrl = env('PTERO_URL', 'https://panel.example.com');
        $panelUrl = rtrim($panelBaseUrl, '/') . '/server/' . $server->pterodactyl_identifier;

        \Log::info('Redirecting to Pterodactyl panel', [
            'server_id' => $server->id,
            'panel_url' => $panelUrl,
            'identifier' => $server->pterodactyl_identifier,
        ]);

        return redirect()->away($panelUrl);
    }

    public function rename(Request $request, Server $server)
    {
        abort_unless($server->user_id === Auth::id(), 403);

        if ($server->status !== 'active') {
            return back()->withErrors(['server_name' => 'Server must be active to rename.']);
        }

        $validated = $request->validate([
            'server_name' => ['required', 'string', 'max:100'],
        ]);

        try {
            $server->server_name = $validated['server_name'];
            $server->save();

            \Log::info('Server renamed', [
                'server_id' => $server->id,
                'new_name' => $validated['server_name'],
            ]);

            return back()->with('success', 'Server name updated successfully.');
        } catch (\Throwable $e) {
            \Log::error('Server rename error: ' . $e->getMessage(), [
                'server_id' => $server->id,
            ]);
            return back()->withErrors(['server_name' => 'Failed to update server name. Please try again.']);
        }
    }
}
