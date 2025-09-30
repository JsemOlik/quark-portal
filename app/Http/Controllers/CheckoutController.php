<?php

namespace App\Http\Controllers;

use App\Models\Server;
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
            'billing' => ['required', 'in:monthly,yearly'],
            'game' => ['required', 'string'],
            'server_name' => ['required', 'string', 'max:100'],
            'region' => ['required', 'string'],
            'billing_name' => ['required', 'string', 'max:100'],
            'billing_address' => ['required', 'string', 'max:255'],
            'billing_city' => ['required', 'string', 'max:100'],
            'billing_country' => ['required', 'string', 'size:2'],
            'save_billing_info' => ['nullable', 'in:0,1'],
        ]);

        $user = Auth::user();

        // Save billing info to user account if requested
        if (isset($validated['save_billing_info']) && $validated['save_billing_info'] === '1') {
            $user->update([
                'billing_address' => $validated['billing_address'],
                'billing_city' => $validated['billing_city'],
                'billing_country' => $validated['billing_country'],
            ]);
        }

        // Map plan -> Stripe price id
        $prices = Config::get('plans.prices');
        if (!isset($prices[$validated['plan']])) {
            abort(400, 'Invalid plan.');
        }

        $priceId = $prices[$validated['plan']][$validated['billing']];

        // Create a pending server record
        $server = Server::create([
            'user_id' => $user->id,
            'plan_id' => $validated['plan'],
            'plan_tier' => strtoupper($validated['plan']),
            'game' => $validated['game'],
            'region' => $validated['region'],
            'server_name' => $validated['server_name'],
            'billing_cycle' => $validated['billing'],
            'status' => 'pending',
        ]);

        // Start Stripe Checkout via Cashier using a unique subscription name per server
        $subName = 'server_' . $server->id;
        $checkout = $user->newSubscription($subName, $priceId)
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

            // Give Cashier a moment to process the webhook and create subscription
            sleep(2);

            // Refresh user to get latest subscriptions
            $request->user()->refresh();

            $sub = $request->user()->subscription($subName);

            if ($sub) {
                $server->subscription_id = $sub->stripe_id;
                $server->subscription_name = $subName;
                $server->status = 'active';

                \Log::info('Subscription found via Cashier', [
                    'subscription_id' => $sub->stripe_id,
                    'server_id' => $server->id
                ]);
            } else {
                // Fallback: fetch directly from Stripe
                $stripe = new StripeClient(config('cashier.secret'));
                $session = $stripe->checkout->sessions->retrieve($server->stripe_checkout_id, [
                    'expand' => ['subscription']
                ]);

                if (isset($session->subscription)) {
                    // Extract subscription ID - handle both string and object
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

                    \Log::info('Subscription found via Stripe API', [
                        'subscription_id' => $subscriptionId,
                        'server_id' => $server->id
                    ]);
                } else {
                    \Log::warning('No subscription found after checkout', [
                        'server_id' => $server->id,
                        'checkout_id' => $server->stripe_checkout_id
                    ]);

                    $server->status = 'pending';
                }
            }

            $server->save();
        } catch (\Throwable $e) {
            \Log::error('Checkout success error: ' . $e->getMessage(), [
                'server_id' => $server->id,
                'trace' => $e->getTraceAsString()
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
            $server = Server::where('id', $serverId)->where('user_id', Auth::id())->first();
            if ($server) {
                $server->status = 'cancelled';
                $server->save();
            }
        }

        return redirect()->route('store.configure');
    }
}


