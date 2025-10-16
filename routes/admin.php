<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminController;

Route::middleware(['auth', 'verified', 'admin', 'throttle:60,1']) // 60 requests per minute
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        // View routes (higher limits)
        Route::middleware('throttle:120,1')->group(function () {
            Route::get('/', [AdminController::class, 'index'])->name('index');
            Route::get('/servers', [AdminController::class, 'servers'])->name('servers');
            Route::get('/users/{user}', [AdminController::class, 'userDetails'])->name('users.show');
        });

        // Action routes (standard limits)
        Route::post('/users/{user}/send-email', [AdminController::class, 'sendEmail'])->name('users.sendEmail');
        Route::post('/users/{user}/update-role', [AdminController::class, 'updateRole'])->name('users.updateRole');
        Route::post('/users/{user}/send-password-reset', [AdminController::class, 'sendPasswordReset'])->name('users.sendPasswordReset');
        Route::post('/users/{user}/update-email', [AdminController::class, 'updateEmail'])->name('users.updateEmail');
        Route::post('/users/{user}/update-password', [AdminController::class, 'updatePassword'])->name('users.updatePassword');
        Route::post('/users/{user}/suspend-servers', [AdminController::class, 'suspendServers'])->name('users.suspendServers');
        Route::post('/users/{user}/unsuspend-servers', [AdminController::class, 'unsuspendServers'])->name('users.unsuspendServers');
        Route::post('/users/{user}/servers/{server}/cancel', [AdminController::class, 'cancelService'])->name('users.servers.cancel');
        Route::delete('/users/{user}/delete-account', [AdminController::class, 'deleteAccount'])->name('users.deleteAccount');

        // Role management routes (Super Admin only)
        Route::middleware('throttle:30,1')->group(function () {
            Route::get('/roles', [AdminController::class, 'roles'])->name('roles.index');
            Route::get('/roles/{role}', [AdminController::class, 'roleEdit'])->name('roles.edit');
            Route::put('/roles/{role}', [AdminController::class, 'roleUpdate'])->name('roles.update');
            Route::post('/roles/{role}/permissions', [AdminController::class, 'rolePermissionsUpdate'])->name('roles.permissions.update');
        });
    });
