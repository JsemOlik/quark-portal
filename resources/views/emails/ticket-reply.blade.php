<x-mail::message>
# New Reply on Your Support Ticket

Hello,

**{{ $replierName }}** has replied to your support ticket #{{ $ticket->id }}.

## Ticket Details

**Title:** {{ $ticket->title }}
**Department:** {{ ucfirst($ticket->department) }}
**Status:** {{ ucfirst($ticket->status) }}

## Reply Message

{{ $replyMessage }}

<x-mail::button :url="$ticketUrl">
View Ticket
</x-mail::button>

Thank you for contacting our support team!

Best regards,
{{ config('app.name') }}
</x-mail::message>
