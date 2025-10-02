<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::get('tickets', [\App\Http\Controllers\TicketController::class, 'index'])
        ->name('tickets');
    Route::post('tickets', [\App\Http\Controllers\TicketController::class, 'store'])
        ->name('tickets.store');
    Route::get('tickets/{ticket}', [\App\Http\Controllers\TicketController::class, 'show'])
        ->name('tickets.show');
    Route::post('tickets/{ticket}/reply', [\App\Http\Controllers\TicketController::class, 'reply'])
        ->name('tickets.reply');

    // Resolve and delete (owner-only)
    Route::post('tickets/{ticket}/resolve', [\App\Http\Controllers\TicketController::class, 'resolve'])
        ->name('tickets.resolve');
    Route::post('tickets/{ticket}/open', [\App\Http\Controllers\TicketController::class, 'open'])
        ->name('tickets.open');
    Route::post('tickets/{ticket}/delete', [\App\Http\Controllers\TicketController::class, 'destroy'])
        ->name('tickets.destroy');

    // Admin ticket routes
    Route::get('admin/tickets', [\App\Http\Controllers\TicketController::class, 'adminIndex'])
        ->name('admin.tickets');
    Route::post('admin/tickets/{ticket}/reply', [\App\Http\Controllers\TicketController::class, 'adminReply'])
        ->name('admin.tickets.reply');
    Route::post('admin/tickets/{ticket}/status', [\App\Http\Controllers\TicketController::class, 'adminSetStatus'])
        ->name('admin.tickets.status');
});
