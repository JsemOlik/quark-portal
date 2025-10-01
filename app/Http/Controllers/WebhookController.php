<?php

namespace App\Http\Controllers;

use App\Models\Server;
use Illuminate\Http\Request;
use Laravel\Cashier\Http\Controllers\WebhookController as CashierController;

class WebhookController extends CashierController
{
    /**
     * Handle checkout session completed.
     *
     * @param  array  $payload
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handleCheckoutSessionCompleted(array $payload)
    {
        \Log::info('Checkout session completed webhook received', ['payload' => $payload]);

        // Let parent handle the default behavior
        $response = parent::handleCheckoutSessionCompleted($payload);

        return $response;
    }

    /**
     * Handle subscription created.
     *
     * @param  array  $payload
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handleCustomerSubscriptionCreated(array $payload)
    {
        \Log::info('Subscription created webhook received', ['payload' => $payload]);

        $response = parent::handleCustomerSubscriptionCreated($payload);

        $this->updateServerSubscriptionStatus($payload);

        return $response;
    }

    /**
     * Handle subscription updated.
     *
     * @param  array  $payload
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handleCustomerSubscriptionUpdated(array $payload)
    {
        $response = parent::handleCustomerSubscriptionUpdated($payload);

        $this->updateServerSubscriptionStatus($payload);

        // Check if billing cycle changed and clear pending_billing_cycle
        if (isset($payload['data']['object']['id'])) {
            $subscriptionId = $payload['data']['object']['id'];
            $server = Server::where('subscription_id', $subscriptionId)->first();

            if ($server && $server->pending_billing_cycle) {
                // If the subscription was updated, the pending billing cycle has now taken effect
                $server->billing_cycle = $server->pending_billing_cycle;
                $server->pending_billing_cycle = null;
                $server->save();

                \Log::info('Billing cycle updated from pending', [
                    'server_id' => $server->id,
                    'new_billing_cycle' => $server->billing_cycle
                ]);
            }
        }

        return $response;
    }

    /**
     * Handle subscription deleted.
     *
     * @param  array  $payload
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handleCustomerSubscriptionDeleted(array $payload)
    {
        $response = parent::handleCustomerSubscriptionDeleted($payload);

        $this->updateServerSubscriptionStatus($payload);

        return $response;
    }

    /**
     * Handle invoice payment succeeded.
     *
     * @param  array  $payload
     * @return \Symfony\Component\HttpFoundation\Response
     */
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

    /**
     * Update server subscription status.
     *
     * @param  array  $payload
     * @return void
     */
    protected function updateServerSubscriptionStatus(array $payload): void
    {
        if (!isset($payload['data']['object']['id'])) {
            return;
        }

        $subscriptionId = $payload['data']['object']['id'];
        $status = $payload['data']['object']['status'] ?? null;

        $server = Server::where('subscription_id', $subscriptionId)->first();

        if (!$server) {
            return;
        }

        // Map Stripe subscription statuses to server statuses
        match ($status) {
            'active' => $server->update(['status' => 'active']),
            'canceled', 'incomplete_expired' => $server->update(['status' => 'cancelled']),
            'past_due', 'unpaid' => $server->update(['status' => 'suspended']),
            default => null,
        };

        // If subscription is active and server not yet provisioned, dispatch
        if ($status === 'active' && empty($server->pterodactyl_server_id)) {
            \App\Jobs\ProvisionServer::dispatch($server->id);
            \Log::info('Provision dispatched from webhook', [
                'server_id' => $server->id,
                'subscription_id' => $subscriptionId,
            ]);
        }
    }
}
