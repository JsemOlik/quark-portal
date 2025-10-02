<?php

use Illuminate\Support\Facades\Route;

Route::view('/game-hosting', 'game-hosting')->name('game-hosting');
Route::view('/vps', 'vps')->name('vps');
Route::view('/about-us', 'about-us')->name('about-us');

require __DIR__ . '/store.php';
require __DIR__ . '/dashboard.php';
require __DIR__ . '/checkout.php';
require __DIR__ . '/webhooks.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/tickets.php';
