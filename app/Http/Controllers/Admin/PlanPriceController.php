<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\PlanPrice;
use Illuminate\Http\Request;

class PlanPriceController extends Controller
{
    // Create a new price row (usually used if you want to link an existing Stripe price ID manually)
    // If you prefer auto-creation via the sync command, you can leave stripe_price_id empty here
    public function store(Request $request, Plan $plan)
    {
        $data = $request->validate([
            'interval' => ['required', 'in:monthly,quarterly,semi_annual,annual'],
            'currency' => ['required', 'in:czk,eur,usd,gbp'],
            // UI collects major units (e.g., 199.00) and converts to minor (×100) before posting; controller expects minor units here
            'unit_amount' => ['required', 'integer', 'min:1'],
            // Allow manual linking to a pre-existing Stripe price, otherwise keep null and use sync command to create it.
            'stripe_price_id' => ['nullable', 'string'],
            'active' => ['nullable', 'boolean'],
        ]);

        PlanPrice::create([
            'plan_id' => $plan->id,
            'interval' => $data['interval'],
            'currency' => $data['currency'],
            'unit_amount' => (int) $data['unit_amount'],
            'stripe_price_id' => $data['stripe_price_id'] ?? null,
            'active' => (bool) ($data['active'] ?? true),
        ]);

        return back()->with('success', 'Price added.');
    }

    // Update an existing price (amount and active flag)
    public function update(Request $request, Plan $plan, PlanPrice $price)
    {
        abort_unless($price->plan_id === $plan->id, 404);

        $data = $request->validate([
            'unit_amount' => ['nullable', 'integer', 'min:1'],
            'active' => ['nullable', 'boolean'],
        ]);

        if (isset($data['unit_amount'])) {
            $price->unit_amount = (int) $data['unit_amount'];
        }

        if ($request->has('active')) {
            $price->active = (bool) $data['active'];
        }

        $price->save();

        return back()->with('success', 'Price updated.');
    }

    // Remove a price record (DB only). Existing subscriptions on this price are unaffected.
    public function destroy(Plan $plan, PlanPrice $price)
    {
        abort_unless($price->plan_id === $plan->id, 404);

        $price->delete();

        return back()->with('success', 'Price removed.');
    }
}
