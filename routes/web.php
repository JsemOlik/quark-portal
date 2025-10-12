<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::view('/game-hosting', 'game-hosting')->name('game-hosting');

Route::get('/', function () {
    return Inertia::render('vps');
})->name('vps');

Route::get('/about-us', function () {
    // return Inertia::render('about-us');
})->name('about-us');

require __DIR__ . '/store.php';
require __DIR__ . '/dashboard.php';
require __DIR__ . '/checkout.php';
require __DIR__ . '/webhooks.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/tickets.php';
