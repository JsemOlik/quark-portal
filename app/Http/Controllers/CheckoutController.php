<?php

namespace App\Http\Controllers;

use App\Jobs\ProvisionServer;
use App\Models\Server;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Inertia\Inertia;
use Stripe\StripeClient;

class CheckoutController extends Controller
{
    public function start(Request $request)
    {
        $validated = $request->validate([
            'plan' => ['required', 'string'],
            'billing' => ['required', 'in:monthly,quarterly,semi_annual,yearly'],
            'game' => ['required', 'string'],
            'game_variant' => ['nullable', 'string'],
            'server_name' => ['required', 'string', 'max:100'],
            'region' => ['required', 'string'],
            'billing_name' => ['required', 'string', 'max:100'],
            'billing_address' => ['required', 'string', 'max:255'],
            'billing_city' => ['required', 'string', 'max:100'],
            'billing_country' => ['required', 'string', 'size:2'],
            'save_billing_info' => ['nullable', 'in:0,1'],
        ]);

        $gamesCfg = Config::get('games');
        $gameId = $validated['game'];
        if (!isset($gamesCfg[$gameId])) {
            abort(400, 'Invalid game.');
        }

        $variantKey = $validated['game_variant'] ?? null;
        $variants = $gamesCfg[$gameId]['variants'] ?? null;
        $requiresVariant = is_array($variants) && count($variants) > 1;

        $request->validate([
            'game_variant' => [
                function ($attr, $value, $fail) use ($requiresVariant, $variants) {
                    if ($requiresVariant) {
                        if (!$value || !is_string($value) || !isset($variants[$value])) {
                            $fail('Please select a valid variant for the chosen game.');
                        }
                    }
                },
            ],
        ]);

        if (is_array($variants) && count($variants) > 0) {
            if (!$requiresVariant) {
                $variantKey = array_key_first($variants);
            }
        } else {
            $variantKey = null;
        }

        $user = Auth::user();

        if (($validated['save_billing_info'] ?? '0') === '1') {
            $user->update([
                'billing_address' => $validated['billing_address'],
                'billing_city' => $validated['billing_city'],
                'billing_country' => $validated['billing_country'],
            ]);
        }

        $plan = Plan::where('key', $validated['plan'])->where('active', true)->first();
        if (!$plan)
            abort(400, 'Invalid plan.');

        // Select a currency (extend if you want per-user settings)
        $currency = config('quark_plans.currency', 'czk');

        $interval = match ($validated['billing']) {
            'yearly' => 'annual',
            default => $validated['billing'],
        };
        // $interval = $validated['billing'] === 'yearly' ? 'annual' : $validated['billing'];

        $planPrice = $plan->priceFor($interval, $currency);
        if (!$planPrice)
            abort(400, 'No price configured for this plan/interval.');

        $priceId = $planPrice->stripe_price_id;

        $server = Server::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'plan_tier' => strtoupper($plan->key),
            'game' => $gameId,
            'game_variant' => $variantKey,
            'region' => $validated['region'],
            'server_name' => $validated['server_name'],
            'billing_cycle' => $validated['billing'],
            'status' => 'pending',
            'provision_status' => 'pending',
        ]);

        $subName = 'server_' . $server->id;

        $checkout = $user->newSubscription($subName, $priceId)
            ->allowPromotionCodes()
            ->checkout([
                'success_url' => route('checkout.success') . '?server=' . $server->id,
                'cancel_url' => route('checkout.cancel') . '?server=' . $server->id,
            ]);

        $server->stripe_checkout_id = $checkout->id;
        $server->save();

        return redirect($checkout->url);
    }

    public function success(Request $request)
    {
        $serverId = (int) $request->query('server');
        $server = Server::where('id', $serverId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        try {
            $subName = 'server_' . $server->id;

            sleep(2);

            $request->user()->refresh();
            $sub = $request->user()->subscription($subName);

            $provisionNow = false;

            if ($sub) {
                $server->subscription_id = $sub->stripe_id;
                $server->subscription_name = $subName;
                $server->status = 'active';
                $server->save();

                \Log::info('Subscription found via Cashier', [
                    'subscription_id' => $sub->stripe_id,
                    'server_id' => $server->id,
                ]);

                $provisionNow = true;
            } else {
                $stripe = new StripeClient(config('cashier.secret'));
                $session = $stripe->checkout->sessions->retrieve($server->stripe_checkout_id, [
                    'expand' => ['subscription'],
                ]);

                if (isset($session->subscription)) {
                    if (is_string($session->subscription)) {
                        $subscriptionId = $session->subscription;
                    } elseif (is_object($session->subscription) && isset($session->subscription->id)) {
                        $subscriptionId = $session->subscription->id;
                    } else {
                        $subscriptionId = (string) $session->subscription;
                    }

                    $server->subscription_id = $subscriptionId;
                    $server->subscription_name = $subName;
                    $server->status = 'active';
                    $server->save();

                    \Log::info('Subscription found via Stripe API', [
                        'subscription_id' => $subscriptionId,
                        'server_id' => $server->id,
                    ]);

                    $provisionNow = true;
                } else {
                    \Log::warning('No subscription found after checkout', [
                        'server_id' => $server->id,
                        'checkout_id' => $server->stripe_checkout_id,
                    ]);

                    $server->status = 'pending';
                    $server->save();
                }
            }

            if ($provisionNow) {
                ProvisionServer::dispatch($server->id);
            }
        } catch (\Throwable $e) {
            \Log::error('Checkout success error: ' . $e->getMessage(), [
                'server_id' => $server->id,
                'trace' => $e->getTraceAsString(),
            ]);

            $server->status = 'pending';
            $server->save();
        }

        return Inertia::render('store/checkout-success', ['serverId' => $server->id]);
    }

    public function cancel(Request $request)
    {
        $serverId = (int) $request->query('server');
        if ($serverId) {
            $server = Server::where('id', $serverId)
                ->where('user_id', Auth::id())
                ->first();
            if ($server) {
                $server->status = 'cancelled';
                $server->save();
            }
        }

        return redirect()->route('store.configure');
    }
}
