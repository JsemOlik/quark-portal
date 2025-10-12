<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminController;

Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [AdminController::class, 'index'])->name('index');
        Route::get('/servers', [AdminController::class, 'servers'])->name('servers');
        Route::get('/users/{user}', [AdminController::class, 'userDetails'])->name('users.show');
        Route::post('/users/{user}/send-email', [AdminController::class, 'sendEmail'])->name('users.sendEmail');
        Route::post('/users/{user}/update-role', [AdminController::class, 'updateRole'])->name('users.updateRole');
    });
