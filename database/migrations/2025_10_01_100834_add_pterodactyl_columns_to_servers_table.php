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
        Schema::table('servers', function (Blueprint $table) {
            $table->unsignedBigInteger('pterodactyl_server_id')->nullable()->after('id');
            $table->uuid('pterodactyl_uuid')->nullable()->after('pterodactyl_server_id');
            $table->string('pterodactyl_identifier', 32)->nullable()->after('pterodactyl_uuid');
            $table->string('pterodactyl_internal_id')->nullable()->after('pterodactyl_identifier');
            $table->string('provision_status', 32)->nullable()->default('pending')->after('status'); // pending|provisioning|provisioned|failed
            $table->text('provision_error')->nullable()->after('provision_status');
            $table->string('external_id')->nullable()->unique()->after('pterodactyl_internal_id'); // link to Ptero external_id
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('servers', function (Blueprint $table) {
            $table->dropColumn([
                'pterodactyl_server_id',
                'pterodactyl_uuid',
                'pterodactyl_identifier',
                'pterodactyl_internal_id',
                'provision_status',
                'provision_error',
                'external_id',
            ]);
        });
    }
};
