<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketAccessRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_id',
        'requester_id',
        'responder_id',
        'status',
        'response_message',
        'responded_at',
    ];

    protected $casts = [
        'responded_at' => 'datetime',
    ];

    /**
     * Get the ticket this request is for
     */
    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    /**
     * Get the user who requested access
     */
    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    /**
     * Get the user who responded to the request
     */
    public function responder()
    {
        return $this->belongsTo(User::class, 'responder_id');
    }

    /**
     * Approve the access request
     */
    public function approve(User $responder, ?string $message = null)
    {
        $this->status = 'approved';
        $this->responder_id = $responder->id;
        $this->response_message = $message;
        $this->responded_at = now();
        $this->save();

        // Grant access to the ticket
        $this->ticket->grantAccess($this->requester_id);
    }

    /**
     * Deny the access request
     */
    public function deny(User $responder, ?string $message = null)
    {
        $this->status = 'denied';
        $this->responder_id = $responder->id;
        $this->response_message = $message;
        $this->responded_at = now();
        $this->save();
    }

    /**
     * Scope to only pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
