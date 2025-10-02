<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'key',
        'name',
        'stripe_product_id',
        'active',
    ];

    public function prices()
    {
        return $this->hasMany(PlanPrice::class);
    }

    public function activePrices()
    {
        return $this->prices()->where('active', true);
    }

    public function priceFor(string $interval, string $currency = 'czk'): ?PlanPrice
    {
        return $this->activePrices()
            ->where('interval', $interval)
            ->where('currency', $currency)
            ->first();
    }
}
