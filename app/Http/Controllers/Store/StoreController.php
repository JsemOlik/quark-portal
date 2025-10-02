<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoreController extends Controller
{
    public function index()
    {
        $currency = config('quark_plans.currency', 'czk');

        $plans = Plan::with(['activePrices' => function ($q) use ($currency) {
            $q->where('currency', $currency);
        }])->where('active', true)->get();

        $specsByKey = collect(config('quark_plans.plans', []))
            ->keyBy('key')
            ->map(function ($p) {
                return [
                    'key' => $p['key'],
                    'name' => $p['name'],
                    'description' => $p['description'] ?? '',
                    'intervals' => $p['intervals'] ?? [],
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
            $intervalMap = collect($plan->activePrices)
                ->mapWithKeys(fn($pp) => [$pp->interval => (int) $pp->unit_amount]);

            return [
                'id' => $plan->key,
                'tier' => $plan->name,
                'intervals' => $intervalMap,
                'currency' => 'czk',
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
    }

    public function configure(Request $request)
    {
        $billRaw = $request->query('bill');
        $bill = is_string($billRaw) ? strtolower(trim($billRaw)) : 'annual';

        abort_unless(in_array($bill, ['monthly', 'quarterly', 'semi_annual', 'annual'], true), 400, 'Invalid billing cycle.');

        $currency = config('quark_plans.currency', 'czk');

        $plans = \App\Models\Plan::with(['activePrices' => function ($q) use ($currency) {
            $q->where('currency', $currency);
        }])->where('active', true)->get();

        $planOptions = $plans->map(fn($plan) => [
            'id' => $plan->key,
            'name' => $plan->name,
        ]);

        $priceMatrix = $plans->mapWithKeys(function ($plan) {
            $map = collect($plan->activePrices)->mapWithKeys(fn($pp) => [
                $pp->interval => (int) $pp->unit_amount,
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
    }
}
