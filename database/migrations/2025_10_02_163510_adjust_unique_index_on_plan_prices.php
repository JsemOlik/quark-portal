<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('plan_prices', function (Blueprint $table) {
            // Make sure the old unique exists before dropping (SQLite needs names exact)
            // Then clean data before creating the new unique.
        });

        // Data cleanup BEFORE new unique
        // Use DB facade because Schema builder won't delete rows
        DB::transaction(function () {
            // Find duplicates by (plan_id, interval, currency)
            $dupes = DB::table('plan_prices')
                ->select('plan_id', 'interval', 'currency', DB::raw('COUNT(*) as cnt'))
                ->groupBy('plan_id', 'interval', 'currency')
                ->having('cnt', '>', 1)
                ->get();

            foreach ($dupes as $d) {
                // Get all rows in this group, prefer active=1, then latest
                $rows = DB::table('plan_prices')
                    ->where('plan_id', $d->plan_id)
                    ->where('interval', $d->interval)
                    ->where('currency', $d->currency)
                    ->orderByDesc('active')        // active first
                    ->orderByDesc('created_at')    // newest first
                    ->get();

                // Keep the first, delete the rest
                $keepId = $rows->first()->id;
                DB::table('plan_prices')
                    ->where('plan_id', $d->plan_id)
                    ->where('interval', $d->interval)
                    ->where('currency', $d->currency)
                    ->where('id', '!=', $keepId)
                    ->delete();
            }
        });

        Schema::table('plan_prices', function (Blueprint $table) {
            // Drop the old unique if it exists; wrap in try/catch for sqlite
            try {
                $table->dropUnique('unique_active_price');
            } catch (\Throwable $e) {
                // ignore if not exists
            }
            $table->unique(['plan_id', 'interval', 'currency'], 'unique_plan_interval_currency');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plan_prices', function (Blueprint $table) {
            // Revert: drop the new unique and restore the old one
            $table->dropUnique('unique_plan_interval_currency');

            $table->unique(['plan_id', 'interval', 'currency', 'active'], 'unique_active_price');
        });
    }
};
