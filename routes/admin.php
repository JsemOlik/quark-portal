<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminController;

Route::middleware(['auth', 'verified', 'admin', 'throttle:60,1']) // 60 requests per minute
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        // View routes (higher limits)
        Route::middleware('throttle:120,1')->group(function () {
            Route::get('/', [AdminController::class, 'index'])->middleware('permission:view_users')->name('index');
            Route::get('/servers', [AdminController::class, 'servers'])->middleware('permission:view_servers')->name('servers');
            Route::get('/users/{user}', [AdminController::class, 'userDetails'])->middleware('permission:view_users')->name('users.show');
        });

        // User management action routes
        Route::post('/users/{user}/send-email', [AdminController::class, 'sendEmail'])->middleware('permission:send_emails')->name('users.sendEmail');
        Route::post('/users/{user}/update-role', [AdminController::class, 'updateRole'])->middleware('permission:manage_user_roles')->name('users.updateRole');
        Route::post('/users/{user}/send-password-reset', [AdminController::class, 'sendPasswordReset'])->middleware('permission:edit_users')->name('users.sendPasswordReset');
        Route::post('/users/{user}/update-email', [AdminController::class, 'updateEmail'])->middleware('permission:edit_users')->name('users.updateEmail');
        Route::post('/users/{user}/update-password', [AdminController::class, 'updatePassword'])->middleware('permission:edit_users')->name('users.updatePassword');
        Route::delete('/users/{user}/delete-account', [AdminController::class, 'deleteAccount'])->middleware('permission:delete_users')->name('users.deleteAccount');

        // Server management action routes
        Route::post('/users/{user}/suspend-servers', [AdminController::class, 'suspendServers'])->middleware('permission:suspend_servers')->name('users.suspendServers');
        Route::post('/users/{user}/unsuspend-servers', [AdminController::class, 'unsuspendServers'])->middleware('permission:unsuspend_servers')->name('users.unsuspendServers');
        Route::post('/users/{user}/servers/{server}/cancel', [AdminController::class, 'cancelService'])->middleware('permission:cancel_servers')->name('users.servers.cancel');

        // Ticket management routes (staff with view_tickets permission)
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('/tickets', [\App\Http\Controllers\TicketController::class, 'adminIndex'])->middleware('permission:view_tickets')->name('tickets.index');
            Route::get('/tickets/{ticket}', [\App\Http\Controllers\TicketController::class, 'adminShow'])->middleware('permission:view_tickets')->name('tickets.show');
            Route::post('/tickets/{ticket}/reply', [\App\Http\Controllers\TicketController::class, 'adminReply'])->middleware('permission:reply_tickets')->name('tickets.reply');
            Route::post('/tickets/{ticket}/status', [\App\Http\Controllers\TicketController::class, 'adminSetStatus'])->middleware('permission:close_tickets')->name('tickets.status');
            Route::post('/tickets/{ticket}/assign', [\App\Http\Controllers\TicketController::class, 'adminAssignTicket'])->middleware('permission:assign_tickets')->name('tickets.assign');
            Route::post('/tickets/{ticket}/priority', [\App\Http\Controllers\TicketController::class, 'adminSetPriority'])->middleware('permission:view_tickets')->name('tickets.priority');
            Route::delete('/tickets/{ticket}', [\App\Http\Controllers\TicketController::class, 'adminDelete'])->middleware('permission:delete_tickets')->name('tickets.delete');

            // Access request routes
            Route::post('/tickets/{ticket}/request-access', [\App\Http\Controllers\TicketController::class, 'requestAccess'])->middleware('permission:view_tickets')->name('tickets.requestAccess');
            Route::post('/tickets/access-requests/{accessRequest}/approve', [\App\Http\Controllers\TicketController::class, 'approveAccessRequest'])->middleware('permission:view_tickets')->name('tickets.approveAccess');
            Route::post('/tickets/access-requests/{accessRequest}/deny', [\App\Http\Controllers\TicketController::class, 'denyAccessRequest'])->middleware('permission:view_tickets')->name('tickets.denyAccess');
            Route::post('/tickets/{ticket}/revoke-access', [\App\Http\Controllers\TicketController::class, 'revokeAccess'])->middleware('permission:view_tickets')->name('tickets.revokeAccess');
        });

        // Role management routes (Super Admin only) - No permission middleware needed as these check isSuperAdmin() in the controller
        Route::middleware('throttle:30,1')->group(function () {
            Route::get('/roles', [AdminController::class, 'roles'])->name('roles.index');
            Route::post('/roles', [AdminController::class, 'roleStore'])->name('roles.store');
            Route::get('/roles/{role}', [AdminController::class, 'roleEdit'])->name('roles.edit');
            Route::put('/roles/{role}', [AdminController::class, 'roleUpdate'])->name('roles.update');
            Route::delete('/roles/{role}', [AdminController::class, 'roleDestroy'])->name('roles.destroy');
            Route::post('/roles/{role}/permissions', [AdminController::class, 'rolePermissionsUpdate'])->name('roles.permissions.update');
        });
    });
