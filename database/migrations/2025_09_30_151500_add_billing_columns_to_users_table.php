<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'billing_name')) {
                $table->string('billing_name')->nullable()->after('is_admin');
            }
            if (!Schema::hasColumn('users', 'billing_address')) {
                $table->string('billing_address')->nullable()->after('billing_name');
            }
            if (!Schema::hasColumn('users', 'billing_city')) {
                $table->string('billing_city')->nullable()->after('billing_address');
            }
            if (!Schema::hasColumn('users', 'billing_country')) {
                $table->string('billing_country', 2)->nullable()->after('billing_city');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'billing_name')) {
                $table->dropColumn('billing_name');
            }
            if (Schema::hasColumn('users', 'billing_address')) {
                $table->dropColumn('billing_address');
            }
            if (Schema::hasColumn('users', 'billing_city')) {
                $table->dropColumn('billing_city');
            }
            if (Schema::hasColumn('users', 'billing_country')) {
                $table->dropColumn('billing_country');
            }
        });
    }
};


