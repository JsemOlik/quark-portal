<?php

namespace App\Console\Commands;

use App\Models\Plan;
use App\Models\PlanPrice;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Stripe\StripeClient;

class StripeSyncPlans extends Command
{
    protected $signature = 'stripe:sync-plans {--dry-run}';
    protected $description = 'Sync local plan definitions with Stripe Products and Prices';

    public function handle(): int
    {
        $cfg = config('quark_plans');
        $currency = $cfg['currency'] ?? 'czk';
        $plansCfg = $cfg['plans'] ?? [];

        $dry = (bool) $this->option('dry-run');

        $secret = config('cashier.secret') ?? config('services.stripe.secret') ?? env('STRIPE_SECRET');
        if (!$secret) {
            $this->error('Stripe secret missing. Ensure STRIPE_SECRET or config(cashier.secret) is set.');
            return Command::FAILURE;
        }

        $stripe = new StripeClient($secret);

        DB::beginTransaction();

        try {
            foreach ($plansCfg as $p) {
                $key = $p['key'];
                $name = $p['name'] ?? $key;
                $intervals = $p['intervals'] ?? [];

                $plan = Plan::firstOrCreate(
                    ['key' => $key],
                    ['name' => $name, 'active' => true]
                );

                if ($plan->name !== $name) {
                    $plan->name = $name;
                }

                // Ensure Stripe Product exists
                if (empty($plan->stripe_product_id)) {
                    if ($dry) {
                        $this->info("[dry-run] Would create Stripe Product for plan {$key}");
                        $productId = 'prod_dry_' . $key;
                    } else {
                        $product = $stripe->products->create([
                            'name' => $name,
                            'active' => true,
                        ]);
                        $productId = $product->id;
                        $this->info("Created Product {$productId} for plan {$key}");
                    }
                    $plan->stripe_product_id = $productId;
                    $plan->save();
                } else {
                    if (!$dry) {
                        $stripe->products->update($plan->stripe_product_id, [
                            'name' => $name,
                            'active' => (bool) $plan->active,
                        ]);
                    }
                }

                // Sync Prices per interval (single currency)
                // foreach ($intervals as $interval => $amount) {
                //     [$intervalCount, $intervalUnit] = $this->mapInterval($interval);

                //     $existing = PlanPrice::where('plan_id', $plan->id)
                //         ->where('interval', $interval)
                //         ->where('currency', $currency)
                //         ->where('active', true)
                //         ->first();

                //     $needNewPrice = false;

                //     if ($existing) {
                //         if ((int) $existing->unit_amount !== (int) $amount) {
                //             $needNewPrice = true;
                //             $this->info("Price changed for {$key} {$interval}: {$existing->unit_amount} -> {$amount}");
                //         } else {
                //             $this->line("Up-to-date: {$key} {$interval} ({$existing->stripe_price_id})");
                //         }
                //     } else {
                //         $needNewPrice = true;
                //         $this->info("No active price for {$key} {$interval}, will create.");
                //     }

                    // Sync Prices per interval (single currency)
                    foreach ($intervals as $interval => $amount) {
                        [$intervalCount, $intervalUnit] = $this->mapInterval($interval);

                        $existing = PlanPrice::where('plan_id', $plan->id)
                            ->where('interval', $interval)
                            ->where('currency', $currency)
                            ->where('active', true)
                            ->first();

                        if ($existing) {
                            if ((int) $existing->unit_amount === (int) $amount) {
                                $this->line("Up-to-date: {$key} {$interval} ({$existing->stripe_price_id})");
                                continue; // nothing to do
                            }

                            // Amount changed: must create a new Stripe Price (immutable constraint)
                            if ($dry) {
                                $this->info("[dry-run] Would update {$key} {$interval}: {$existing->unit_amount} -> {$amount} and replace Stripe price.");
                                continue;
                            }

                            // 1) Create a new Stripe Price
                            $newPrice = $stripe->prices->create([
                                'unit_amount' => (int) $amount,
                                'currency' => $currency,
                                'recurring' => [
                                    'interval' => $intervalUnit,
                                    'interval_count' => $intervalCount,
                                ],
                                'product' => $plan->stripe_product_id,
                                'active' => true,
                            ]);

                            // Optional: deactivate old Stripe price for new usage (keeps existing subs intact)
                            try {
                                if (!empty($existing->stripe_price_id)) {
                                    $stripe->prices->update($existing->stripe_price_id, ['active' => false]);
                                }
                            } catch (\Throwable $e) {
                                $this->warn("Could not deactivate old Stripe price {$existing->stripe_price_id}: {$e->getMessage()}");
                            }

                            // 2) Update the existing DB row instead of creating a new one
                            $existing->unit_amount = (int) $amount;
                            $existing->stripe_price_id = $newPrice->id;
                            $existing->active = true; // remains the single active row
                            $existing->save();

                            $this->info("Replaced Price for {$key} {$interval} with {$newPrice->id} ({$amount} {$currency}).");
                            continue;
                        }

                        // No existing price row: create fresh
                        if ($dry) {
                            $this->info("[dry-run] Would create new Price for {$key} {$interval} amount {$amount}.");
                            continue;
                        }

                        $price = $stripe->prices->create([
                            'unit_amount' => (int) $amount,
                            'currency' => $currency,
                            'recurring' => [
                                'interval' => $intervalUnit,
                                'interval_count' => $intervalCount,
                            ],
                            'product' => $plan->stripe_product_id,
                            'active' => true,
                        ]);

                        // Upsert PlanPrice: ensure we have one row per (plan, interval, currency)
                        PlanPrice::updateOrCreate(
                            [
                                'plan_id' => $plan->id,
                                'interval' => $interval,
                                'currency' => $currency,
                            ],
                            [
                                'unit_amount' => (int) $amount,
                                'stripe_price_id' => $price->id,
                                'active' => true,
                            ]
                        );

                        $this->info("Created Price {$price->id} for {$key} {$interval} ({$amount} {$currency}).");
                    }
                // }
            }

            if ($dry) {
                DB::rollBack();
                $this->info('Dry-run complete. No changes persisted.');
            } else {
                DB::commit();
                $this->info('Stripe plan sync complete.');
            }

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('Sync failed: ' . $e->getMessage());
            report($e);
            return Command::FAILURE;
        }
    }

    private function mapInterval(string $interval): array
    {
        return match ($interval) {
            'monthly' => [1, 'month'],
            'quarterly' => [3, 'month'],
            'semi_annual' => [6, 'month'],
            'annual' => [1, 'year'],
            default => throw new \InvalidArgumentException("Unknown interval: {$interval}"),
        };
    }
}
