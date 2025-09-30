<?php

return [
    // Map our plan slugs to Stripe Price IDs for monthly/yearly
    'prices' => [
        'core' => [
            'monthly' => env('STRIPE_PRICE_CORE_MONTHLY', ''),
            'yearly' => env('STRIPE_PRICE_CORE_YEARLY', ''),
        ],
        'boost' => [
            'monthly' => env('STRIPE_PRICE_BOOST_MONTHLY', ''),
            'yearly' => env('STRIPE_PRICE_BOOST_YEARLY', ''),
        ],
        'power' => [
            'monthly' => env('STRIPE_PRICE_POWER_MONTHLY', ''),
            'yearly' => env('STRIPE_PRICE_POWER_YEARLY', ''),
        ],
        'extreme' => [
            'monthly' => env('STRIPE_PRICE_EXTREME_MONTHLY', ''),
            'yearly' => env('STRIPE_PRICE_EXTREME_YEARLY', ''),
        ],
    ],
];


