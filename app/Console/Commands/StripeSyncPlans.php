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

        $stripe = new StripeClient(config('cashier.secret'));

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
                        $this->info("[dry-run] Would create Product for plan {$key}");
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
                    // Optionally update product name/active if needed
                    if (!$dry) {
                        $stripe->products->update($plan->stripe_product_id, [
                            'name' => $name,
                            'active' => (bool) $plan->active,
                        ]);
                    }
                }

                // Sync Prices per interval
                foreach ($intervals as $interval => $amount) {
                    // Map intervals to Stripe recurrence
                    [$intervalCount, $intervalUnit] = $this->mapInterval($interval);

                    // Find active price for this plan/interval/currency
                    $existing = PlanPrice::where('plan_id', $plan->id)
                        ->where('interval', $interval)
                        ->where('currency', $currency)
                        ->where('active', true)
                        ->first();

                    $needNewPrice = false;

                    if ($existing) {
                        // If amount changed, we need a new Stripe price (immutable)
                        if ((int) $existing->unit_amount !== (int) $amount) {
                            $needNewPrice = true;
                            $this->info("Price changed for {$key} {$interval}: {$existing->unit_amount} -> {$amount}");
                        } else {
                            // Keep existing
                            $this->line("Up-to-date: {$key} {$interval} ({$existing->stripe_price_id})");
                        }
                    } else {
                        $needNewPrice = true;
                        $this->info("No active price found for {$key} {$interval}, will create.");
                    }

                    if ($needNewPrice) {
                        if (!$dry) {
                            $price = $stripe->prices->create([
                                'unit_amount' => (int) $amount,
                                'currency' => $currency,
                                'recurring' => [
                                    'interval' => $intervalUnit, // 'month' or 'year'
                                    'interval_count' => $intervalCount, // 1,3,6,1
                                ],
                                'product' => $plan->stripe_product_id,
                                'active' => true,
                            ]);

                            // Deactivate old active price mapping (local, not on Stripe)
                            if ($existing) {
                                $existing->active = false;
                                $existing->save();
                            }

                            PlanPrice::create([
                                'plan_id' => $plan->id,
                                'interval' => $interval,
                                'currency' => $currency,
                                'unit_amount' => (int) $amount,
                                'stripe_price_id' => $price->id,
                                'active' => true,
                            ]);

                            $this->info("Created Price {$price->id} for {$key} {$interval} ({$amount} {$currency}).");
                        } else {
                            $this->info("[dry-run] Would create new Price for {$key} {$interval} amount {$amount}.");
                        }
                    }
                }
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
        // Return [interval_count, interval_unit]
        return match ($interval) {
            'monthly' => [1, 'month'],
            'quarterly' => [3, 'month'],
            'semi_annual' => [6, 'month'],
            'annual' => [1, 'year'],
            default => throw new \InvalidArgumentException("Unknown interval: {$interval}"),
        };
    }
}
