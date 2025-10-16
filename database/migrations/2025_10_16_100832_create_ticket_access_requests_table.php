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
        Schema::create('ticket_access_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained()->onDelete('cascade');
            $table->foreignId('requester_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('responder_id')->nullable()->constrained('users')->onDelete('set null'); // Who approved/denied
            $table->enum('status', ['pending', 'approved', 'denied'])->default('pending');
            $table->text('response_message')->nullable(); // Optional message when approving/denying
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            // Prevent duplicate pending requests
            $table->unique(['ticket_id', 'requester_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_access_requests');
    }
};
