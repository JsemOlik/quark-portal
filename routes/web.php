<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Plan;
use App\Http\Controllers\Admin\PlanController as AdminPlanController;
// use App\Http\Controllers\Admin\PlanPriceController as AdminPlanPriceController;
// use App\Http\Middleware\EnsureAdmin;

Route::get('/', function () {
    $currency = config('quark_plans.currency', 'czk');

    $plans = Plan::with(['activePrices' => function ($q) use ($currency) {
        $q->where('currency', $currency);
    }])->where('active', true)->get();

    // Merge spec text from config (cpu/ram/storage/etc) with DB pricing
    $specsByKey = collect(config('quark_plans.plans', []))
        ->keyBy('key')
        ->map(function ($p) {
            return [
                'key' => $p['key'],
                'name' => $p['name'],
                'description' => $p['description'] ?? '',
                'intervals' => $p['intervals'] ?? [],
                // optional: add non-price specs here if you store them in config:
                'cpu' => $p['cpu'] ?? 'AMD EPYC',
                'vcores' => $p['vcores'] ?? '2 vCores',
                'ram' => $p['ram'] ?? '4GB DDR4',
                'storage' => $p['storage'] ?? 'NVMe Storage',
                'backups' => $p['backups'] ?? 'Automatic Backups',
                'ports' => $p['ports'] ?? 'Dedicated Ports',
                'popular' => (bool)($p['popular'] ?? false),
            ];
        });

    $planCards = $plans->map(function ($plan) use ($specsByKey) {
        $spec = $specsByKey->get($plan->key, []);
        // Map activePrices -> intervals map: interval => unit_amount
        $intervalMap = collect($plan->activePrices)
            ->mapWithKeys(fn($pp) => [$pp->interval => (int)$pp->unit_amount]);

        return [
            'id' => $plan->key,           // keep the key for URLs
            'tier' => $plan->name,
            'intervals' => $intervalMap,  // monthly/quarterly/semi_annual/annual => integer amount (minor units)
            'currency' => 'czk',
            // Attach specs (used by PlanCard)
            'cpu' => $spec['cpu'] ?? '',
            'vcores' => $spec['vcores'] ?? '',
            'ram' => $spec['ram'] ?? '',
            'storage' => $spec['storage'] ?? '',
            'backups' => $spec['backups'] ?? '',
            'ports' => $spec['ports'] ?? '',
            'popular' => $spec['popular'] ?? false,
        ];
    })->values();

    return Inertia::render('store/index', [
        'plans' => $planCards,
        'currency' => $currency,
    ]);
})->name('store');

Route::get('/configure', function (\Illuminate\Http\Request $request) {
    $billRaw = $request->query('bill');
    $bill = is_string($billRaw) ? strtolower(trim($billRaw)) : 'annual';
    if (!in_array($bill, ['monthly', 'quarterly', 'semi_annual', 'annual'], true)) {
        abort(400, 'Invalid billing cycle.');
    }

    $currency = config('quark_plans.currency', 'czk');
    $plans = \App\Models\Plan::with(['activePrices' => function ($q) use ($currency) {
        $q->where('currency', $currency);
    }])->where('active', true)->get();

    $planOptions = $plans->map(function ($plan) {
        return [
            'id' => $plan->key,
            'name' => $plan->name,
        ];
    });

    $priceMatrix = $plans->mapWithKeys(function ($plan) {
        $map = collect($plan->activePrices)->mapWithKeys(fn($pp) => [
            $pp->interval => (int)$pp->unit_amount,
        ]);
        return [$plan->key => $map];
    });

    return Inertia::render('store/configure', [
        'initialPlan' => (string) $request->query('plan', ''),
        'initialBill' => $bill,
        'csrf' => csrf_token(),
        'planOptions' => $planOptions,
        'priceMatrix' => $priceMatrix,
        'currency' => $currency,
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
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/tickets.php';

// Stripe webhooks (Cashier)
Route::post('/stripe/webhook', [\App\Http\Controllers\WebhookController::class, 'handleWebhook']);
