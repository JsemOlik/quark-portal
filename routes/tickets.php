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
    // Users can only mark their own tickets as resolved, they cannot reopen them
    Route::post('tickets/{ticket}/resolve', [\App\Http\Controllers\TicketController::class, 'resolve'])
        ->name('tickets.resolve');
    Route::post('tickets/{ticket}/delete', [\App\Http\Controllers\TicketController::class, 'destroy'])
        ->name('tickets.destroy');

    // Secure file download route
    Route::get('tickets/attachment/{message}', [\App\Http\Controllers\TicketController::class, 'downloadAttachment'])
        ->name('ticket.attachment');
});
