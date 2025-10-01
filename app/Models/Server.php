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

        protected $fillable = [
        'user_id',
        'plan_id',
        'plan_tier',
        'game',
        'game_variant',
        'region',
        'server_name',
        'billing_cycle',
        'status',
        'stripe_checkout_id',
        'subscription_id',
        'subscription_name',
        'pterodactyl_server_id',
        'pterodactyl_uuid',
        'pterodactyl_identifier',
        'pterodactyl_internal_id',
        'provision_status',
        'provision_error',
        'external_id',
        'pending_billing_cycle',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}


