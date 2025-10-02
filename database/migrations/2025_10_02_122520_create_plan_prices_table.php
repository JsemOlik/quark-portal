<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('plan_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')->constrained('plans')->cascadeOnDelete();
            $table->string('interval'); // monthly, quarterly, semi_annual, annual
            $table->string('currency')->default('czk'); // adapt if multi-currency
            $table->unsignedBigInteger('unit_amount'); // in minor units (e.g., 19900 = 199.00 CZK)
            $table->string('stripe_price_id')->unique();
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->unique(['plan_id', 'interval', 'currency', 'active'], 'unique_active_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_prices');
    }
};
