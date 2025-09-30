<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Server extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan_id',
        'plan_tier',
        'game',
        'region',
        'server_name',
        'billing_cycle',
        'pending_billing_cycle',
        'stripe_checkout_id',
        'subscription_id',
        'subscription_name',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}


