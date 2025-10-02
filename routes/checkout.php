<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CheckoutController;

Route::post('/checkout', [CheckoutController::class, 'start'])
    ->middleware(['auth'])
    ->name('checkout.start');

Route::get('/checkout/success', [CheckoutController::class, 'success'])
    ->middleware(['auth'])
    ->name('checkout.success');

Route::get('/checkout/cancel', [CheckoutController::class, 'cancel'])
    ->middleware(['auth'])
    ->name('checkout.cancel');
