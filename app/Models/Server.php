<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Server extends Model
{
    use HasFactory;

    // protected $fillable = [
    //     'user_id',
    //     'plan_id',
    //     'plan_tier',
    //     'game',
    //     'region',
    //     'server_name',
    //     'billing_cycle',
    //     'pending_billing_cycle',
    //     'stripe_checkout_id',
    //     'subscription_id',
    //     'subscription_name',
    //     'status',
    // ];

    // Only allow user-inputable fields in fillable array
    protected $fillable = [
        'server_name',
        'game',
        'game_variant',
        'region',
        'plan_id',
        'plan_tier',
        'billing_cycle',
    ];

    // Protect sensitive system fields from mass assignment
    protected $guarded = [
        'id',
        'user_id',
        'status',
        'subscription_id',
        'subscription_name',
        'stripe_checkout_id',
        'pterodactyl_server_id',
        'pterodactyl_uuid',
        'pterodactyl_identifier',
        'pterodactyl_internal_id',
        'provision_status',
        'provision_error',
        'external_id',
        'pending_billing_cycle',
        'created_at',
        'updated_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
        return $this->belongsTo(\App\Models\Plan::class);
    }
}


