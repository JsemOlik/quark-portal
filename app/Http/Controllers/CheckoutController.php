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

        // Store server configuration in checkout session metadata instead of creating server immediately
        $serverConfig = [
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'plan_tier' => strtoupper($plan->key),
            'game' => $gameId,
            'game_variant' => $variantKey,
            'region' => $validated['region'],
            'server_name' => $validated['server_name'],
            'billing_cycle' => $validated['billing'],
        ];

        // Generate unique subscription name using timestamp and user ID for uniqueness
        $subName = 'server_' . $user->id . '_' . time();

        $checkout = $user->newSubscription($subName, $priceId)
            ->allowPromotionCodes()
            ->checkout([
                'success_url' => route('checkout.success') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('checkout.cancel') . '?session_id={CHECKOUT_SESSION_ID}',
                'metadata' => [
                    'server_config' => json_encode($serverConfig),
                    'quark_app' => 'server_creation',
                ]
            ]);

        \Log::info('Checkout session created without server record', [
            'checkout_session_id' => $checkout->id,
            'subscription_name' => $subName,
            'user_id' => $user->id,
        ]);

        return redirect($checkout->url);
    }

    public function success(Request $request)
    {
        $sessionId = $request->query('session_id');

        if (!$sessionId) {
            return redirect()->route('dashboard')->with('error', 'Invalid checkout session.');
        }

        try {
            $stripe = new StripeClient(config('cashier.secret'));
            $session = $stripe->checkout->sessions->retrieve($sessionId);

            // Verify session belongs to current user
            if ($session->customer !== Auth::user()->stripe_id) {
                \Log::warning('Checkout session customer mismatch', [
                    'session_id' => $sessionId,
                    'session_customer' => $session->customer,
                    'user_stripe_id' => Auth::user()->stripe_id,
                ]);
                return redirect()->route('dashboard')->with('error', 'Invalid session.');
            }

            \Log::info('Checkout success accessed - server will be created via webhook', [
                'session_id' => $sessionId,
                'user_id' => Auth::id(),
                'payment_status' => $session->payment_status,
            ]);

            // Don't create servers here - let webhooks handle it
            return Inertia::render('store/checkout-success', [
                'sessionId' => $sessionId,
                'paymentStatus' => $session->payment_status,
                'message' => 'Payment successful! Your server is being created and will appear in your dashboard shortly.'
            ]);

        } catch (\Throwable $e) {
            \Log::error('Checkout success page error: ' . $e->getMessage(), [
                'session_id' => $sessionId,
                'user_id' => Auth::id(),
            ]);

            return redirect()->route('dashboard')->with('error', 'There was an issue processing your order. Please contact support.');
        }
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
