<?php

namespace App\Http\Controllers;

use App\Models\Server;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Laravel\Cashier\Http\Controllers\WebhookController as CashierController;

class WebhookController extends CashierController
{
    public function __invoke(Request $request)
    {
        // Verify Stripe webhook signature for security
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');
        $endpoint_secret = config('cashier.webhook.secret');

        if (!$endpoint_secret) {
            Log::error('Webhook signature verification failed: No endpoint secret configured');
            return response('Webhook secret not configured', 500);
        }

        try {
            \Stripe\Webhook::constructEvent($payload, $signature, $endpoint_secret);
            Log::info('Webhook signature verified successfully');
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Log::warning('Invalid webhook signature received', [
                'signature' => $signature,
                'error' => $e->getMessage()
            ]);
            return response('Invalid signature', 400);
        } catch (\Exception $e) {
            Log::error('Webhook signature verification error', [
                'error' => $e->getMessage()
            ]);
            return response('Signature verification failed', 400);
        }

        return $this->handleWebhook($request);
    }
    public function handleCheckoutSessionCompleted(array $payload)
    {
        Log::info('Checkout session completed webhook received', ['payload' => $payload]);

        // Create server from checkout session metadata
        $session = $payload['data']['object'];

        if (isset($session['metadata']['server_config']) &&
            isset($session['metadata']['quark_app']) &&
            $session['metadata']['quark_app'] === 'server_creation') {

            try {
                $serverConfig = json_decode($session['metadata']['server_config'], true);

                if ($serverConfig) {
                    // Get subscription ID from session
                    $subscriptionId = $session['subscription'] ?? null;

                    if ($subscriptionId) {
                        Log::info('Creating server from checkout session', [
                            'server_config' => $serverConfig,
                            'subscription_id' => $subscriptionId,
                        ]);

                        // Create server with payment confirmed - manually set user_id since it's guarded
                        $server = new Server();
                        $server->user_id = $serverConfig['user_id'];
                        $server->plan_id = $serverConfig['plan_id'];
                        $server->plan_tier = $serverConfig['plan_tier'];
                        $server->game = $serverConfig['game'];
                        $server->game_variant = $serverConfig['game_variant'] ?? null;
                        $server->region = $serverConfig['region'];
                        $server->server_name = $serverConfig['server_name'];
                        $server->billing_cycle = $serverConfig['billing_cycle'];
                        $server->subscription_id = $subscriptionId;
                        $server->subscription_name = $session['client_reference_id'] ?? 'server_' . time();
                        $server->stripe_checkout_id = $session['id'];
                        $server->status = 'active';
                        $server->provision_status = 'pending';
                        $server->save();

                        Log::info('Server created from confirmed checkout session', [
                            'server_id' => $server->id,
                            'subscription_id' => $subscriptionId,
                            'checkout_session_id' => $session['id'],
                        ]);

                        // Dispatch provisioning job
                        \App\Jobs\ProvisionServer::dispatch($server->id);

                    } else {
                        Log::error('No subscription ID in completed checkout session', [
                            'session_id' => $session['id']
                        ]);
                    }
                }
            } catch (\Throwable $e) {
                Log::error('Failed to create server from checkout session: ' . $e->getMessage(), [
                    'session_id' => $session['id'],
                    'error' => $e->getMessage()
                ]);
            }
        }

        return parent::handleCheckoutSessionCompleted($payload);
    }

    public function handleCustomerSubscriptionCreated(array $payload)
    {
        Log::info('Subscription created webhook received', ['payload' => $payload]);

        $response = parent::handleCustomerSubscriptionCreated($payload);
        $this->updateServerSubscriptionStatus($payload);

        return $response;
    }

    public function handleCustomerSubscriptionUpdated(array $payload)
    {
        $response = parent::handleCustomerSubscriptionUpdated($payload);

        // Update base mapping first (respects pending cancellation)
        $this->updateServerSubscriptionStatus($payload);

        if (isset($payload['data']['object']['id'])) {
            $obj = $payload['data']['object'];
            $subscriptionId = $obj['id'];
            $server = Server::where('subscription_id', $subscriptionId)->first();

            if ($server) {
                $cancelAtPeriodEnd = $obj['cancel_at_period_end'] ?? false;
                $cancelAt = isset($obj['cancel_at']) ? (int) $obj['cancel_at'] : null;
                $stripeStatus = $obj['status'] ?? null;

                // If user canceled in portal -> mark pending + suspend
                if ($cancelAtPeriodEnd && $stripeStatus === 'active') {
                    if (Schema::hasColumn('servers', 'cancel_at')) {
                        $server->cancel_at = $cancelAt ? date('Y-m-d H:i:s', $cancelAt) : null;
                    }

                    if ($server->status !== 'cancelled') {
                        $server->status = 'pending_cancellation';
                        $server->save();
                    }

                    try {
                        if ($server->pterodactyl_server_id) {
                            app(\App\Services\PterodactylService::class)
                                ->suspendServer((int) $server->pterodactyl_server_id);
                            Log::info('Pterodactyl server suspended due to pending cancellation', [
                                'server_id' => $server->id,
                                'pterodactyl_server_id' => $server->pterodactyl_server_id,
                            ]);
                        }
                    } catch (\Throwable $e) {
                        Log::warning('Failed to suspend Pterodactyl on pending cancellation: ' . $e->getMessage(), [
                            'server_id' => $server->id,
                        ]);
                    }
                }

                // If user resumed (cancel_at_period_end false, status active) -> mark active + unsuspend
                if (!$cancelAtPeriodEnd && $stripeStatus === 'active' && $server->status === 'pending_cancellation') {
                    $server->status = 'active';
                    if (Schema::hasColumn('servers', 'cancel_at')) {
                        $server->cancel_at = null;
                    }
                    $server->save();

                    try {
                        if ($server->pterodactyl_server_id) {
                            app(\App\Services\PterodactylService::class)
                                ->unsuspendServer((int) $server->pterodactyl_server_id);
                            Log::info('Pterodactyl server unsuspended after resume', [
                                'server_id' => $server->id,
                                'pterodactyl_server_id' => $server->pterodactyl_server_id,
                            ]);
                        }
                    } catch (\Throwable $e) {
                        Log::warning('Failed to unsuspend Pterodactyl after resume: ' . $e->getMessage(), [
                            'server_id' => $server->id,
                        ]);
                    }
                }

                // If period ended and Stripe canceled, reflect local state
                if ($stripeStatus === 'canceled') {
                    $server->status = 'cancelled';
                    $server->save();
                    // Optionally force delete on Ptero here if desired
                    // app(\App\Services\PterodactylService::class)->forceDeleteServer((int) $server->pterodactyl_server_id);
                }

                // Pending billing cycle took effect
                if ($server->pending_billing_cycle) {
                    $server->billing_cycle = $server->pending_billing_cycle;
                    $server->pending_billing_cycle = null;
                    $server->save();

                    Log::info('Billing cycle updated from pending', [
                        'server_id' => $server->id,
                        'new_billing_cycle' => $server->billing_cycle
                    ]);
                }
            }
        }

        return $response;
    }

    public function handleCustomerSubscriptionDeleted(array $payload)
    {
        Log::info('Subscription deleted webhook received', ['payload' => $payload]);

        $response = parent::handleCustomerSubscriptionDeleted($payload);

        if (isset($payload['data']['object']['id'])) {
            $obj = $payload['data']['object'];
            $subscriptionId = $obj['id'];
            $server = Server::where('subscription_id', $subscriptionId)->first();

            if ($server) {
                Log::info('Processing subscription deletion', [
                    'server_id' => $server->id,
                    'subscription_id' => $subscriptionId,
                    'current_status' => $server->status
                ]);

                // Update server status to cancelled
                $server->status = 'cancelled';
                $server->save();

                // Suspend the server in Pterodactyl
                try {
                    if ($server->pterodactyl_server_id) {
                        app(\App\Services\PterodactylService::class)
                            ->suspendServer((int) $server->pterodactyl_server_id);
                        Log::info('Pterodactyl server suspended due to subscription deletion', [
                            'server_id' => $server->id,
                            'pterodactyl_server_id' => $server->pterodactyl_server_id,
                        ]);
                    }
                } catch (\Throwable $e) {
                    Log::warning('Failed to suspend Pterodactyl server on deletion: ' . $e->getMessage(), [
                        'server_id' => $server->id,
                        'pterodactyl_server_id' => $server->pterodactyl_server_id,
                    ]);
                }
            }
        }

        $this->updateServerSubscriptionStatus($payload);
        return $response;
    }

    public function handleInvoicePaymentSucceeded(array $payload)
    {
        $response = parent::handleInvoicePaymentSucceeded($payload);

        if (isset($payload['data']['object']['subscription'])) {
            $subscriptionId = $payload['data']['object']['subscription'];

            Server::where('subscription_id', $subscriptionId)
                ->where('status', '!=', 'cancelled')
                ->update(['status' => 'active']);
        }

        return $response;
    }

    protected function updateServerSubscriptionStatus(array $payload): void
    {
        if (!isset($payload['data']['object']['id'])) {
            return;
        }

        $obj = $payload['data']['object'];
        $subscriptionId = $obj['id'];
        $status = $obj['status'] ?? null;
        $cancelAtPeriodEnd = $obj['cancel_at_period_end'] ?? false;

        $server = Server::where('subscription_id', $subscriptionId)->first();
        if (!$server) {
            return;
        }

        // Respect pending cancellation state
        if ($cancelAtPeriodEnd && $status === 'active') {
            if ($server->status !== 'cancelled') {
                $server->update(['status' => 'pending_cancellation']);
            }
            return;
        }

        // Otherwise, map normally
        match ($status) {
            'active' => $server->update(['status' => 'active']),
            'canceled', 'incomplete_expired' => $server->update(['status' => 'cancelled']),
            'past_due', 'unpaid' => $server->update(['status' => 'suspended']),
            default => null,
        };

        // Provision if active and not yet provisioned
        if ($status === 'active' && empty($server->pterodactyl_server_id)) {
            \App\Jobs\ProvisionServer::dispatch($server->id);
            Log::info('Provision dispatched from webhook', [
                'server_id' => $server->id,
                'subscription_id' => $subscriptionId,
            ]);
        }
    }

    public function handleInvoicePaymentFailed(array $payload)
    {
        Log::info('Invoice payment failed webhook received', ['payload' => $payload]);

        $invoice = $payload['data']['object'];
        $subscriptionId = $invoice['subscription'] ?? null;

        if ($subscriptionId) {
            $server = Server::where('subscription_id', $subscriptionId)->first();

            if ($server && $server->status !== 'cancelled') {
                Log::info('Suspending server due to payment failure', [
                    'server_id' => $server->id,
                    'subscription_id' => $subscriptionId,
                ]);

                $server->status = 'suspended';
                $server->save();

                // Suspend in Pterodactyl
                try {
                    if ($server->pterodactyl_server_id) {
                        app(\App\Services\PterodactylService::class)
                            ->suspendServer((int) $server->pterodactyl_server_id);
                        Log::info('Pterodactyl server suspended due to payment failure', [
                            'server_id' => $server->id,
                            'pterodactyl_server_id' => $server->pterodactyl_server_id,
                        ]);
                    }
                } catch (\Throwable $e) {
                    Log::warning('Failed to suspend Pterodactyl server after payment failure: ' . $e->getMessage(), [
                        'server_id' => $server->id,
                    ]);
                }
            }
        }

        return parent::handleInvoicePaymentFailed($payload);
    }
}
