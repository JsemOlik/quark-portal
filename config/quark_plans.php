<?php

return [
    // Currency all amounts below are in (minor units)
    'currency' => env('BILLING_CURRENCY', 'czk'),

    // Plans we sell (local source of truth)
    // unit_amounts are integers in minor units (e.g., 19900 => Kč199.00)
    'plans' => [
        [
            'key' => 'core',
            'name' => 'Core',
            'intervals' => [
                'monthly' => 19900,
                'quarterly' => 54900,
                'semi_annual' => 99900,
                'annual' => 179900,
            ],
        ],
        [
            'key' => 'boost',
            'name' => 'Boost',
            'intervals' => [
                'monthly' => 29900,
                'quarterly' => 82900,
                'semi_annual' => 149900,
                'annual' => 269900,
            ],
        ],
        [
            'key' => 'power',
            'name' => 'Power',
            'intervals' => [
                'monthly' => 39900,
                'quarterly' => 110900,
                'semi_annual' => 199900,
                'annual' => 359900,
            ],
        ],
        [
            'key' => 'extreme',
            'name' => 'Extreme',
            'intervals' => [
                'monthly' => 49900,
                'quarterly' => 138900,
                'semi_annual' => 249900,
                'annual' => 449900,
            ],
        ],
    ],
];
