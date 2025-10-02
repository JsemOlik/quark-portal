<?php

namespace App\Http\Controllers\Admin;

use App\Console\Commands\StripeSyncPlans;
use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\PlanPrice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::with(['activePrices'])->orderBy('key')->get();

        // Compute savings per plan and currency (if monthly+annual exist)
        $currencies = ['czk', 'eur', 'usd', 'gbp'];
        $computed = $plans->map(function (Plan $plan) use ($currencies) {
            $byCurrency = [];
            foreach ($currencies as $cur) {
                $monthly = $plan->activePrices->firstWhere('interval', 'monthly')?->where('currency', $cur)->first();
                $annual = $plan->activePrices->firstWhere('interval', 'annual')?->where('currency', $cur)->first();
                // above isn’t correct, so compute properly:
                $monthlyPrice = $plan->activePrices->first(function ($p) use ($cur) {
                    return $p->interval === 'monthly' && $p->currency === $cur;
                });
                $annualPrice = $plan->activePrices->first(function ($p) use ($cur) {
                    return $p->interval === 'annual' && $p->currency === $cur;
                });

                if ($monthlyPrice && $annualPrice) {
                    $monthlyAnnualized = $monthlyPrice->unit_amount * 12;
                    $savings = max(0, $monthlyAnnualized - $annualPrice->unit_amount);
                    $pct = $monthlyAnnualized > 0 ? round(($savings / $monthlyAnnualized) * 100) : 0;
                    $byCurrency[$cur] = [
                        'monthly' => $monthlyPrice->unit_amount,
                        'annual' => $annualPrice->unit_amount,
                        'savings' => $savings,
                        'savings_pct' => $pct,
                    ];
                } else {
                    $byCurrency[$cur] = null;
                }
            }

            return [
                'id' => $plan->id,
                'key' => $plan->key,
                'name' => $plan->name,
                'active' => (bool) $plan->active,
                'stripe_product_id' => $plan->stripe_product_id,
                'savings' => $byCurrency,
            ];
        });

        return Inertia::render('admin/plans/index', [
            'plans' => $computed,
            'currencies' => $currencies,
        ]);
    }

    public function show(Plan $plan)
    {
        $plan->load('prices');

        // Group prices by currency and interval for a grid-like UI
        $currencies = ['czk', 'eur', 'usd', 'gbp'];
        $intervals = ['monthly', 'quarterly', 'semi_annual', 'annual'];

        $grid = [];
        foreach ($currencies as $cur) {
            $grid[$cur] = [];
            foreach ($intervals as $intv) {
                $price = $plan->prices->first(function ($p) use ($cur, $intv) {
                    return $p->currency === $cur && $p->interval === $intv && $p->active;
                });
                $grid[$cur][$intv] = $price ? [
                    'id' => $price->id,
                    'stripe_price_id' => $price->stripe_price_id,
                    'unit_amount' => $price->unit_amount,
                    'active' => (bool) $price->active,
                ] : null;
            }
        }

        // Compute savings per currency
        $savings = [];
        foreach ($currencies as $cur) {
            $monthly = $plan->prices->first(function ($p) use ($cur) {
                return $p->interval === 'monthly' && $p->currency === $cur && $p->active;
            });
            $annual = $plan->prices->first(function ($p) use ($cur) {
                return $p->interval === 'annual' && $p->currency === $cur && $p->active;
            });
            if ($monthly && $annual) {
                $monthlyAnnualized = $monthly->unit_amount * 12;
                $savingsAmt = max(0, $monthlyAnnualized - $annual->unit_amount);
                $pct = $monthlyAnnualized > 0 ? round(($savingsAmt / $monthlyAnnualized) * 100) : 0;
                $savings[$cur] = [
                    'monthly_annualized' => $monthlyAnnualized,
                    'annual' => $annual->unit_amount,
                    'savings' => $savingsAmt,
                    'savings_pct' => $pct,
                ];
            } else {
                $savings[$cur] = null;
            }
        }

        return Inertia::render('admin/plans/Show', [
            'plan' => [
                'id' => $plan->id,
                'key' => $plan->key,
                'name' => $plan->name,
                'active' => (bool) $plan->active,
                'stripe_product_id' => $plan->stripe_product_id,
            ],
            'grid' => $grid,
            'currencies' => $currencies,
            'intervals' => $intervals,
            'savings' => $savings,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'key' => ['required', 'string', 'max:50', 'unique:plans,key'],
            'name' => ['required', 'string', 'max:100'],
        ]);

        Plan::create([
            'key' => $data['key'],
            'name' => $data['name'],
            'active' => true,
        ]);

        return redirect()->route('admin.plans.index')->with('success', 'Plan created.');
    }

    public function update(Request $request, Plan $plan)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'active' => ['nullable', 'boolean'],
        ]);

        $plan->name = $data['name'];
        if ($request->has('active')) {
            $plan->active = (bool) $data['active'];
        }
        $plan->save();

        return back()->with('success', 'Plan updated.');
    }

    public function destroy(Plan $plan)
    {
        $plan->delete();
        return redirect()->route('admin.plans.index')->with('success', 'Plan deleted.');
    }

    public function sync(Request $request)
    {
        // Option A: queue a job or
        // Option B: run sync command directly (simple)
        Artisan::call('stripe:sync-plans');

        return back()->with('success', 'Stripe plan sync triggered.');
    }
}
