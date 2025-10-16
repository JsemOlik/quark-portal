<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TicketController;

Route::middleware(['auth', 'verified'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::get('tickets', [TicketController::class, 'index'])
        ->name('tickets');
    Route::post('tickets', [TicketController::class, 'store'])
        ->name('tickets.store');
    Route::get('tickets/{ticket}', [TicketController::class, 'show'])
        ->name('tickets.show');
    Route::post('tickets/{ticket}/reply', [TicketController::class, 'reply'])
        ->name('tickets.reply');

    // Resolve and delete (owner-only)
    // Users can only mark their own tickets as resolved, they cannot reopen them
    Route::post('tickets/{ticket}/resolve', [TicketController::class, 'resolve'])
        ->name('tickets.resolve');
    Route::post('tickets/{ticket}/delete', [TicketController::class, 'destroy'])
        ->name('tickets.destroy');

    // Secure file download route
    Route::get('tickets/attachment/{message}', [TicketController::class, 'downloadAttachment'])
        ->name('ticket.attachment');
});
