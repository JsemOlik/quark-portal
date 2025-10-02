<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanPrice extends Model
{
    protected $fillable = [
        'plan_id',
        'interval',
        'currency',
        'unit_amount',
        'stripe_price_id',
        'active',
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }
}
