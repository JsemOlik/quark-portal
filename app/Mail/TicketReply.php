<?php

namespace App\Mail;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TicketReply extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $ticket;
    public $message;
    public $replier;

    /**
     * Create a new message instance.
     */
    public function __construct(Ticket $ticket, string $message, User $replier)
    {
        $this->ticket = $ticket;
        $this->message = $message;
        $this->replier = $replier;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Reply on Your Support Ticket #' . $this->ticket->id,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.ticket-reply',
            with: [
                'ticket' => $this->ticket,
                'replyMessage' => $this->message,
                'replierName' => $this->replier->name,
                'ticketUrl' => url('/dashboard/tickets/' . $this->ticket->id),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
