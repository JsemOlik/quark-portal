<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Store\StoreController;

Route::get('/', [StoreController::class, 'index'])->name('store');
Route::get('/configure', [StoreController::class, 'configure'])
    ->middleware(['auth'])
    ->name('store.configure');
