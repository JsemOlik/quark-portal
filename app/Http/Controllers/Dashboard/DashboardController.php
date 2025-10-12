<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Server;
use App\Models\Ticket;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Stripe\StripeClient;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $serversQuery = Server::where('user_id', $user->id)
            ->orderByDesc('created_at');

        $servers = $serversQuery->limit(4)->get([
            'id',
            'server_name as name',
            'game',
            'billing_cycle',
            'pending_billing_cycle',
            'status',
            'created_at',
            'subscription_id',
        ]);

        $serversCount = (clone $serversQuery)->count();

        $ticketsQuery = Ticket::where('user_id', $user->id)
            ->orderByDesc('created_at');

        $tickets = $ticketsQuery->limit(3)
            ->with('server:id,server_name')
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'title' => $ticket->title,
                    'department' => $ticket->department,
                    'status' => $ticket->status,
                    'server_name' => $ticket->server ? $ticket->server->server_name : null,
                    'created_at' => $ticket->created_at->format('Y-m-d'),
                ];
            });

        $ticketsCount = (clone $ticketsQuery)->count();

        $invoices = [];
        try {
            foreach (collect($user->invoices())->take(4) as $inv) {
                $stripeInvoice = $inv->asStripeInvoice();
                $invoices[] = [
                    'id' => $inv->id,
                    'number' => $inv->number,
                    'total' => $inv->total(),
                    'date' => $stripeInvoice->created ? date('Y-m-d', $stripeInvoice->created) : null,
                    'paid' => ($stripeInvoice->status === 'paid' || $stripeInvoice->paid === true),
                    'hosted_invoice_url' => $stripeInvoice->hosted_invoice_url ?? null,
                ];
            }
        } catch (\Throwable $e) {
            Log::error('Dashboard invoices error: ' . $e->getMessage());
        }

        $nextBillings = [];
        try {
            $stripe = new StripeClient(config('cashier.secret'));
            foreach ($servers as $server) {
                if ($server->subscription_id && $server->status === 'active') {
                    try {
                        $stripeSub = $stripe->subscriptions->retrieve($server->subscription_id);
                        if ($stripeSub->status === 'active' && isset($stripeSub->current_period_end)) {
                            $upcoming = $stripe->invoices->retrieveUpcoming([
                                'subscription' => $server->subscription_id,
                            ]);
                            $nextBillings[] = [
                                'server_name' => $server->name,
                                'game' => $server->game,
                                'date' => date('Y-m-d', $stripeSub->current_period_end),
                                'amount' => sprintf('%s %.2f', strtoupper($upcoming->currency), $upcoming->total / 100),
                            ];
                        }
                    } catch (\Throwable $e) {
                        // ignore server fetch errors
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::error('Dashboard next billing error: ' . $e->getMessage());
        }

        return Inertia::render('dashboard', [
            'servers' => $servers,
            'serversCount' => $serversCount,
            'invoices' => $invoices,
            'nextBillings' => $nextBillings,
            'tickets' => $tickets,
            'ticketsCount' => $ticketsCount,
            'isAdmin' => $user->is_admin,
            'csrf' => csrf_token(),
        ]);
    }

    public function servers()
    {
        $servers = Server::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->get([
                'id',
                'server_name as name',
                'game',
                'billing_cycle',
                'pending_billing_cycle',
                'status',
                'created_at',
            ]);

        return Inertia::render('servers', ['servers' => $servers]);
    }
}
