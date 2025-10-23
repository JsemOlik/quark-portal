<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\StorageController;

Route::view('/game-hosting', 'game-hosting')->name('game-hosting');

Route::get('/', function () {
    return Inertia::render('vps');
})->name('vps');

Route::get('/storage', [StorageController::class, 'index'])->name('storage.index');

Route::get('/about-us', function () {
    // return Inertia::render('about-us');
})->name('about-us');

Route::get('/status', function () {
    // return Inertia::render('status');
    return redirect()->away('https://discord.gg/yrn667jjD7');
})->name('status');

Route::get('/discord', function () {
    return redirect()->away('https://discord.gg/yrn667jjD7');
})->name('discord');

require __DIR__ . '/store.php';
require __DIR__ . '/dashboard.php';
require __DIR__ . '/checkout.php';
require __DIR__ . '/webhooks.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/tickets.php';
