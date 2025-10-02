<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\PlanController as AdminPlanController;
// use App\Http\Controllers\Admin\PlanPriceController as AdminPlanPriceController;
// use App\Http\Middleware\EnsureAdmin;

Route::get('/', function () {
    return Inertia::render('store/index');
})->name('store');

Route::get('/configure', function (\Illuminate\Http\Request $request) {
    $billRaw = $request->query('bill');
    $bill = is_string($billRaw) ? strtolower(trim($billRaw)) : 'yearly';
    if (!in_array($bill, ['monthly', 'yearly'], true)) {
        abort(400, 'Invalid billing cycle.');
    }
    return Inertia::render('store/configure', [
        'initialPlan' => (string) $request->query('plan', ''),
        'initialBill' => $bill,
        'csrf' => csrf_token(),
    ]);
})->middleware(['auth'])->name('store.configure');

Route::post('/checkout', [\App\Http\Controllers\CheckoutController::class, 'start'])
    ->middleware(['auth'])
    ->name('checkout.start');

Route::get('/checkout/success', [\App\Http\Controllers\CheckoutController::class, 'success'])
    ->middleware(['auth'])
    ->name('checkout.success');

Route::get('/checkout/cancel', [\App\Http\Controllers\CheckoutController::class, 'cancel'])
    ->middleware(['auth'])
    ->name('checkout.cancel');

Route::get('/game-hosting', function () {
    return Inertia::render('game-hosting');
})->name('game-hosting');

Route::get('/vps', function () {
    return Inertia::render('vps');
})->name('vps');

Route::get('/about-us', function () {
    return Inertia::render('about-us');
})->name('about-us');

// Route::get('/store', function () {
//     return Inertia::render('store/index');
// })->name('store');

Route::middleware(['auth', 'verified'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::get('/', function () {
        $user = auth()->user();
        $serversQuery = \App\Models\Server::where('user_id', $user->id)->orderByDesc('created_at');
        $servers = $serversQuery->limit(4)->get(['id', 'server_name as name', 'game', 'billing_cycle', 'pending_billing_cycle', 'status', 'created_at', 'subscription_id']);
        $serversCount = (clone $serversQuery)->count();

        // Fetch tickets
        $ticketsQuery = \App\Models\Ticket::where('user_id', $user->id)->orderByDesc('created_at');
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

        // Fetch up to 4 invoices via Cashier (best-effort)
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
            \Log::error('Dashboard invoices error: ' . $e->getMessage());
        }

        // Get next billing info from active servers
        $nextBillings = [];
        try {
            $stripe = new \Stripe\StripeClient(config('cashier.secret'));
            foreach ($servers as $server) {
                if ($server->subscription_id && $server->status === 'active') {
                    try {
                        $stripeSubscription = $stripe->subscriptions->retrieve($server->subscription_id);
                        if ($stripeSubscription->status === 'active' && isset($stripeSubscription->current_period_end)) {
                            $upcomingInvoice = $stripe->invoices->retrieveUpcoming([
                                'subscription' => $server->subscription_id,
                            ]);
                            $nextBillings[] = [
                                'server_name' => $server->name,
                                'game' => $server->game,
                                'date' => date('Y-m-d', $stripeSubscription->current_period_end),
                                'amount' => sprintf('%s %.2f', strtoupper($upcomingInvoice->currency), $upcomingInvoice->total / 100),
                            ];
                        }
                    } catch (\Throwable $e) {
                        // Skip if can't fetch
                    }
                }
            }
        } catch (\Throwable $e) {
            \Log::error('Dashboard next billing error: ' . $e->getMessage());
        }

        return Inertia::render('dashboard', [
            'servers' => $servers,
            'serversCount' => $serversCount,
            'invoices' => $invoices,
            'nextBillings' => $nextBillings,
            'tickets' => $tickets,
            'ticketsCount' => $ticketsCount,
            'isAdmin' => $user->is_admin,
        ]);
    })->name('index');

    Route::get('servers', function () {
        $servers = \App\Models\Server::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->get(['id', 'server_name as name', 'game', 'billing_cycle', 'pending_billing_cycle', 'status', 'created_at']);
        return Inertia::render('servers', [
            'servers' => $servers,
        ]);
    })->name('servers');

    Route::get('servers/{server}', [\App\Http\Controllers\ServerController::class, 'show'])
        ->name('servers.show');
    Route::post('servers/{server}/cancel', [\App\Http\Controllers\ServerController::class, 'cancel'])
        ->name('servers.cancel');
    Route::post('servers/{server}/switch-billing', [\App\Http\Controllers\ServerController::class, 'switchBilling'])
        ->name('servers.switchBilling');

    // Remove server (with optional invoice cleanup)
    Route::post('servers/{server}/remove', [\App\Http\Controllers\ServerController::class, 'destroy'])
        ->name('servers.destroy');

    Route::get('invoices', function () {
        return Inertia::render('invoices');
    })->name('invoices');

    Route::get('tickets', [\App\Http\Controllers\TicketController::class, 'index'])
        ->name('tickets');
    Route::post('tickets', [\App\Http\Controllers\TicketController::class, 'store'])
        ->name('tickets.store');
    Route::get('tickets/{ticket}', [\App\Http\Controllers\TicketController::class, 'show'])
        ->name('tickets.show');
    Route::post('tickets/{ticket}/reply', [\App\Http\Controllers\TicketController::class, 'reply'])
        ->name('tickets.reply');

    // Resolve and delete (owner-only)
    Route::post('tickets/{ticket}/resolve', [\App\Http\Controllers\TicketController::class, 'resolve'])
        ->name('tickets.resolve');
    Route::post('tickets/{ticket}/open', [\App\Http\Controllers\TicketController::class, 'open'])
        ->name('tickets.open');
    Route::post('tickets/{ticket}/delete', [\App\Http\Controllers\TicketController::class, 'destroy'])
        ->name('tickets.destroy');

    // Admin ticket routes
    Route::get('admin/tickets', [\App\Http\Controllers\TicketController::class, 'adminIndex'])
        ->name('admin.tickets');
    Route::post('admin/tickets/{ticket}/reply', [\App\Http\Controllers\TicketController::class, 'adminReply'])
        ->name('admin.tickets.reply');
    Route::post('admin/tickets/{ticket}/status', [\App\Http\Controllers\TicketController::class, 'adminSetStatus'])
        ->name('admin.tickets.status');
});

Route::middleware(['auth', \App\Http\Middleware\EnsureAdmin::class])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/plans', [AdminPlanController::class, 'index'])->name('plans.index');
        Route::get('/plans/{plan}', [AdminPlanController::class, 'show'])->name('plans.show');
        Route::post('/plans', [AdminPlanController::class, 'store'])->name('plans.store');
        Route::put('/plans/{plan}', [AdminPlanController::class, 'update'])->name('plans.update');
        Route::delete('/plans/{plan}', [AdminPlanController::class, 'destroy'])->name('plans.destroy');

        Route::post('/plans/sync', [AdminPlanController::class, 'sync'])->name('plans.sync');

        Route::post('/plans/{plan}/prices', [\App\Http\Controllers\Admin\PlanPriceController::class, 'store'])->name('plan_prices.store');
        Route::put('/plans/{plan}/prices/{price}', [\App\Http\Controllers\Admin\PlanPriceController::class, 'update'])->name('plan_prices.update');
        Route::delete('/plans/{plan}/prices/{price}', [\App\Http\Controllers\Admin\PlanPriceController::class, 'destroy'])->name('plan_prices.destroy');
    });

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

// Stripe webhooks (Cashier)
Route::post('/stripe/webhook', [\App\Http\Controllers\WebhookController::class, 'handleWebhook']);
