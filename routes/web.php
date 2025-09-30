<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/game-hosting', function () {
    return Inertia::render('game-hosting');
})->name('game-hosting');

Route::get('/vps', function () {
    return Inertia::render('vps');
})->name('vps');

Route::get('/about-us', function () {
    return Inertia::render('about-us');
})->name('about-us');

Route::get('/store', function () {
    return Inertia::render('store/index');
})->name('store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('servers', function () {
        return Inertia::render('servers');
    })->name('servers');

    Route::get('invoices', function () {
        return Inertia::render('invoices');
    })->name('invoices');

    Route::get('tickets', function () {
        return Inertia::render('tickets');
    })->name('tickets');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
