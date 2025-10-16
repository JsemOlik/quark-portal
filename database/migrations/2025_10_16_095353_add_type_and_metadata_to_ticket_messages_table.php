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
        Schema::table('ticket_messages', function (Blueprint $table) {
            // Type: 'message', 'status_change', 'priority_change', 'assignment_change'
            $table->string('type', 50)->default('message')->after('is_staff');

            // Metadata JSON to store event details (old_value, new_value, etc.)
            $table->json('metadata')->nullable()->after('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ticket_messages', function (Blueprint $table) {
            $table->dropColumn(['type', 'metadata']);
        });
    }
};
