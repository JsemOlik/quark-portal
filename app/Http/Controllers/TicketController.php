<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Server;
use App\Models\TicketMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $tickets = Ticket::where('user_id', $user->id)
            ->with('server:id,server_name')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'title' => $ticket->title,
                    'message' => $ticket->message,
                    'department' => $ticket->department,
                    'status' => $ticket->status,
                    'server_name' => $ticket->server ? $ticket->server->server_name : null,
                    'created_at' => $ticket->created_at->format('Y-m-d'),
                ];
            });

        $servers = Server::where('user_id', $user->id)
            ->where('status', 'active')
            ->get(['id', 'server_name']);

        return Inertia::render('tickets', [
            'tickets' => $tickets,
            'servers' => $servers,
            'isAdmin' => $user->is_admin,
            'csrf' => csrf_token(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'department' => 'required|string|in:billing,technical,general',
            'server_id' => 'nullable|exists:servers,id',
        ]);

        $validated['user_id'] = Auth::id();

        $ticket = Ticket::create($validated);

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'message' => $validated['message'],
            'is_staff' => false,
        ]);

        return back()->with('success', 'Ticket submitted successfully. We will respond as soon as possible.');
    }

    public function show(Ticket $ticket)
    {
        $user = Auth::user();

        abort_unless($ticket->user_id === $user->id || $user->is_admin, 403);

        $messages = $ticket->messages()
            ->with('user:id,name')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'message' => $message->message,
                    'is_staff' => $message->is_staff,
                    'user_name' => $message->user ? $message->user->name : 'Staff',
                    'attachment_name' => $message->attachment_name,
                    'attachment_path' => $message->attachment_path ? Storage::url($message->attachment_path) : null,
                    'created_at' => $message->created_at->format('Y-m-d H:i'),
                ];
            });

        return Inertia::render('ticket-detail', [
            'ticket' => [
                'id' => $ticket->id,
                'title' => $ticket->title,
                'department' => $ticket->department,
                'status' => $ticket->status,
                'server_name' => $ticket->server ? $ticket->server->server_name : null,
                'created_at' => $ticket->created_at->format('Y-m-d'),
                'user_id' => $ticket->user_id,
            ],
            'messages' => $messages,
            'isAdmin' => $user->is_admin,
            'isOwnTicket' => $ticket->user_id === $user->id,
            'csrf' => csrf_token(),
        ]);
    }

    public function reply(Request $request, Ticket $ticket)
    {
        abort_unless($ticket->user_id === Auth::id(), 403);

        $validated = $request->validate([
            'message' => 'required|string',
            'attachment' => 'nullable|file|max:10240',
        ]);

        $attachmentPath = null;
        $attachmentName = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentName = $file->getClientOriginalName();
            $attachmentPath = $file->store('ticket-attachments', 'public');
        }

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'message' => $validated['message'],
            'attachment_path' => $attachmentPath,
            'attachment_name' => $attachmentName,
            'is_staff' => false,
        ]);

        return back()->with('success', 'Reply sent successfully.');
    }

    public function resolve(Request $request, Ticket $ticket)
    {
        abort_unless($ticket->user_id === Auth::id(), 403);

        try {
            $ticket->status = 'resolved';
            $ticket->save();

            return back()->with('success', 'Ticket marked as resolved.');
        } catch (\Throwable $e) {
            \Log::error('Ticket resolve error: ' . $e->getMessage(), [
                'ticket_id' => $ticket->id,
            ]);
            return back()->withErrors(['resolve' => 'Failed to resolve ticket.']);
        }
    }

    public function destroy(Request $request, Ticket $ticket)
    {
        abort_unless($ticket->user_id === Auth::id(), 403);

        try {
            // Delete attachments from storage
            foreach ($ticket->messages as $msg) {
                if ($msg->attachment_path) {
                    try {
                        Storage::disk('public')->delete($msg->attachment_path);
                    } catch (\Throwable $e) {
                        \Log::warning('Failed to delete attachment: ' . $e->getMessage(), [
                            'ticket_id' => $ticket->id,
                            'message_id' => $msg->id,
                        ]);
                    }
                }
            }

            // Delete ticket messages, then the ticket
            TicketMessage::where('ticket_id', $ticket->id)->delete();
            $ticket->delete();

            return redirect()->route('dashboard.tickets')->with('success', 'Ticket deleted.');
        } catch (\Throwable $e) {
            \Log::error('Ticket delete error: ' . $e->getMessage(), [
                'ticket_id' => $ticket->id,
            ]);
            return back()->withErrors(['delete' => 'Failed to delete ticket.']);
        }
    }

    public function adminIndex()
    {
        $user = Auth::user();

        abort_unless($user->is_admin, 403);

        $tickets = Ticket::with(['user:id,name,email', 'server:id,server_name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'title' => $ticket->title,
                    'message' => $ticket->message,
                    'department' => $ticket->department,
                    'status' => $ticket->status,
                    'user_name' => $ticket->user ? $ticket->user->name : 'Unknown',
                    'user_email' => $ticket->user ? $ticket->user->email : '',
                    'server_name' => $ticket->server ? $ticket->server->server_name : null,
                    'created_at' => $ticket->created_at->format('Y-m-d'),
                ];
            });

        return Inertia::render('admin-tickets', [
            'tickets' => $tickets,
            'csrf' => csrf_token(),
        ]);
    }

    public function adminReply(Request $request, Ticket $ticket)
    {
        $user = Auth::user();

        abort_unless($user->is_admin, 403);

        $validated = $request->validate([
            'message' => 'required|string',
            'attachment' => 'nullable|file|max:10240',
        ]);

        $attachmentPath = null;
        $attachmentName = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentName = $file->getClientOriginalName();
            $attachmentPath = $file->store('ticket-attachments', 'public');
        }

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'message' => $validated['message'],
            'attachment_path' => $attachmentPath,
            'attachment_name' => $attachmentName,
            'is_staff' => true,
        ]);

        return back()->with('success', 'Admin reply sent successfully.');
    }

    public function open(Request $request, Ticket $ticket)
    {
        abort_unless($ticket->user_id === Auth::id(), 403);

        try {
            $ticket->status = 'open';
            $ticket->save();
            return back()->with('success', 'Ticket reopened.');
        } catch (\Throwable $e) {
            \Log::error('Ticket reopen error: ' . $e->getMessage(), [
                'ticket_id' => $ticket->id,
            ]);
            return back()->withErrors(['open' => 'Failed to reopen ticket.']);
        }
    }

    public function adminSetStatus(Request $request, Ticket $ticket)
    {
        $user = Auth::user();
        abort_unless($user->is_admin, 403);

        $validated = $request->validate([
            'status' => 'required|string|in:open,resolved,closed',
        ]);

        // Admin cannot close their own ticket
        if ($validated['status'] === 'closed' && $ticket->user_id === $user->id) {
            return back()->withErrors(['status' => "You can't close your own ticket."]);
        }

        try {
            $ticket->status = $validated['status'];
            $ticket->save();
            return back()->with('success', 'Ticket status updated.');
        } catch (\Throwable $e) {
            \Log::error('Admin ticket status update error: ' . $e->getMessage(), [
                'ticket_id' => $ticket->id,
            ]);
            return back()->withErrors(['status' => 'Failed to update status.']);
        }
    }
}
