<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('servers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('plan_id');
            $table->string('plan_tier');
            $table->string('game');
            $table->string('region');
            $table->string('server_name');
            $table->enum('billing_cycle', ['monthly', 'quarterly', 'semi_annual', 'yearly']);
            $table->string('stripe_checkout_id')->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('cancel_at')->nullable()->after('status');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('servers');
    }
};


