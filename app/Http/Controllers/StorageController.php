<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class StorageController extends Controller
{
    public function index() {
    $plans = [
        [
            'id' => 's3-100',
            'name' => 'Starter 100',
            'monthlyMinor' => 4900, // 49.00 Kč
            'storageGB' => 100,
            'bandwidthTB' => 1,
            'redundancy' => 'single',
            'class' => 'standard',
            'features' => ['1 TB egress included', 'API keys & policies', 'Email support'],
            'popular' => false,
        ],
        [
            'id' => 's3-500',
            'name' => 'Core 500',
            'monthlyMinor' => 15900, // 159.00 Kč
            'storageGB' => 500,
            'bandwidthTB' => 2,
            'redundancy' => 'erasure',
            'class' => 'standard',
            'features' => ['2 TB egress included', 'Erasure coding', 'Priority support'],
            'popular' => true,
        ],
        [
            'id' => 's3-1000-ia',
            'name' => 'Archive 1TB',
            'monthlyMinor' => 19900,
            'storageGB' => 1024,
            'bandwidthTB' => 1,
            'redundancy' => 'erasure',
            'class' => 'infrequent',
            'features' => ['Cold storage pricing', 'S3-compatible', 'Basic support'],
            'popular' => false,
        ],
    ];

    return Inertia::render('storage/index', [
        'plans' => $plans,
        'currency' => 'CZK',
        'name' => config('app.name', 'Hosting Company'),
    ]);
}
}
