<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\ServerController;

Route::middleware(['auth', 'verified'])
    ->prefix('dashboard')
    ->name('dashboard.')
    ->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('index');

        Route::get('servers', [DashboardController::class, 'servers'])->name('servers');

        Route::get('servers/{server}', [ServerController::class, 'show'])
            ->name('servers.show');

        Route::post('servers/{server}/cancel', [ServerController::class, 'cancel'])
            ->name('servers.cancel');

        Route::post('servers/{server}/switch-billing', [ServerController::class, 'switchBilling'])
            ->name('servers.switchBilling');

        Route::post('servers/{server}/remove', [ServerController::class, 'destroy'])
            ->name('servers.destroy');

        Route::get('invoices', fn () => Inertia\Inertia::render('invoices'))
            ->name('invoices');
    });
