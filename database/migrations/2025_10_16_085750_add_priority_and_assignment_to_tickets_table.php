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
        Schema::table('tickets', function (Blueprint $table) {
            // Add priority field (low, normal, high, urgent)
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal')->after('status');

            // Add assigned_to field (which staff member is handling this ticket)
            $table->foreignId('assigned_to')->nullable()->after('priority')->constrained('users')->nullOnDelete();

            // Add last_reply_at timestamp for better sorting/filtering
            $table->timestamp('last_reply_at')->nullable()->after('assigned_to');

            // Add closed_at timestamp to track when ticket was closed
            $table->timestamp('closed_at')->nullable()->after('last_reply_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn(['priority', 'assigned_to', 'last_reply_at', 'closed_at']);
        });
    }
};
