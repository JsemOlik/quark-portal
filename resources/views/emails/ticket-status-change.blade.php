<x-mail::message>
# Ticket Status Update

Hello,

The status of your support ticket #{{ $ticket->id }} has been updated.

## Ticket Details

**Title:** {{ $ticket->title }}
**Department:** {{ ucfirst($ticket->department) }}
**Previous Status:** {{ $oldStatus }}
**New Status:** {{ $newStatus }}

@if($newStatus === 'Closed')
Your ticket has been closed. If you have any further questions or concerns, please feel free to open a new ticket or reply to this one to reopen it.
@elseif($newStatus === 'Resolved')
Your ticket has been marked as resolved. If this resolved your issue, no further action is needed. If you still need assistance, you can reopen the ticket by replying to it.
@else
Our support team is actively working on your ticket. We'll get back to you as soon as possible.
@endif

<x-mail::button :url="$ticketUrl">
View Ticket
</x-mail::button>

Thank you for your patience!

Best regards,
{{ config('app.name') }}
</x-mail::message>
