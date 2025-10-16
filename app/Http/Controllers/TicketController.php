<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Server;
use App\Models\TicketMessage;
use App\Models\TicketAccessRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\TicketReply as TicketReplyMail;
use App\Mail\TicketStatusChange;
use Inertia\Inertia;

class TicketController extends Controller
{
    /**
     * Display user's tickets
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Ticket::where('user_id', $user->id)
            ->with('server:id,server_name');

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('message', 'like', '%' . $request->search . '%');
            });
        }

        // Sort by priority (urgent first) and then by last_reply_at or created_at
        $tickets = $query->orderByRaw("
                CASE priority
                    WHEN 'urgent' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'normal' THEN 3
                    WHEN 'low' THEN 4
                    ELSE 5
                END
            ")
            ->orderByDesc('last_reply_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'title' => $ticket->title,
                    'message' => $ticket->message,
                    'department' => $ticket->department,
                    'status' => $ticket->status,
                    'priority' => $ticket->priority,
                    'server_name' => $ticket->server ? $ticket->server->server_name : null,
                    'created_at' => $ticket->created_at->format('Y-m-d'),
                    'last_reply_at' => $ticket->last_reply_at ? $ticket->last_reply_at->format('Y-m-d') : null,
                ];
            });

        $servers = Server::where('user_id', $user->id)
            ->where('status', 'active')
            ->get(['id', 'server_name']);

        return Inertia::render('tickets', [
            'tickets' => $tickets,
            'servers' => $servers,
            'isAdmin' => $user->is_admin || $user->role_id,
            'filters' => [
                'status' => $request->status,
                'department' => $request->department,
                'search' => $request->search,
            ],
            'csrf' => csrf_token(),
        ]);
    }

    /**
     * Create a new ticket
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'department' => 'required|string|in:billing,technical,general',
            'server_id' => 'nullable|exists:servers,id',
        ]);

        $validated['user_id'] = Auth::id();
        $validated['last_reply_at'] = now();

        $ticket = Ticket::create($validated);

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'message' => $validated['message'],
            'is_staff' => false,
        ]);

        Log::info('User created ticket', [
            'user_id' => Auth::id(),
            'ticket_id' => $ticket->id,
            'department' => $ticket->department,
        ]);

        return back()->with('success', 'Ticket submitted successfully. We will respond as soon as possible.');
    }

    /**
     * Show ticket detail with all messages
     */
    public function show(Ticket $ticket)
    {
        $user = Auth::user();

        // Authorization: owner OR staff with view_tickets permission
        $canView = $ticket->user_id === $user->id ||
                   $user->isSuperAdmin() ||
                   ($user->role && $user->role->permissions->contains('name', 'view_tickets'));

        abort_unless($canView, 403);

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
                    'attachment_path' => $message->attachment_path ? route('ticket.attachment', ['message' => $message->id]) : null,
                    'created_at' => $message->created_at->format('Y-m-d H:i'),
                    'type' => $message->type ?? 'message',
                    'metadata' => $message->metadata,
                ];
            });

        // Get user permissions
        $permissions = [];
        if ($user->isSuperAdmin()) {
            $permissions = ['*'];
        } elseif ($user->role) {
            $permissions = $user->role->permissions->pluck('name')->toArray();
        }

        return Inertia::render('ticket-detail', [
            'ticket' => [
                'id' => $ticket->id,
                'title' => $ticket->title,
                'department' => $ticket->department,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'server_name' => $ticket->server ? $ticket->server->server_name : null,
                'created_at' => $ticket->created_at->format('Y-m-d'),
                'user_id' => $ticket->user_id,
                'assigned_to' => $ticket->assigned_to,
                'assigned_to_name' => $ticket->assignedTo ? $ticket->assignedTo->name : null,
            ],
            'messages' => $messages,
            'isAdmin' => $user->is_admin || $user->role_id,
            'isOwnTicket' => $ticket->user_id === $user->id,
            'permissions' => $permissions,
            'csrf' => csrf_token(),
        ]);
    }

    /**
     * Reply to a ticket (user)
     */
    public function reply(Request $request, Ticket $ticket)
    {
        abort_unless($ticket->user_id === Auth::id(), 403);

        // Users cannot reply to closed tickets
        if ($ticket->status === 'closed') {
            return back()->withErrors(['reply' => 'Cannot reply to a closed ticket.']);
        }

        $validated = $request->validate([
            'message' => 'required|string',
            'attachment' => [
                'nullable',
                'file',
                'max:10240', // 10MB max
                'mimes:pdf,doc,docx,txt,png,jpg,jpeg,gif',
                'mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/png,image/jpeg,image/gif'
            ],
        ]);

        $attachmentPath = null;
        $attachmentName = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');

            // Validate file type by actual content, not just extension
            $mimeType = $file->getMimeType();
            $allowedMimes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'image/png',
                'image/jpeg',
                'image/gif'
            ];

            if (!in_array($mimeType, $allowedMimes)) {
                return back()->withErrors(['attachment' => 'Invalid file type. Only PDF, DOC, DOCX, TXT, PNG, JPG, and GIF files are allowed.']);
            }

            // Generate secure filename to prevent directory traversal
            $extension = $file->getClientOriginalExtension();
            $secureFileName = 'ticket_' . uniqid() . '_' . time() . '.' . $extension;
            $attachmentName = $file->getClientOriginalName();
            $attachmentPath = $file->storeAs('ticket-attachments', $secureFileName, 'private');
        }

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'message' => $validated['message'],
            'attachment_path' => $attachmentPath,
            'attachment_name' => $attachmentName,
            'is_staff' => false,
        ]);

        // Update last_reply_at and reopen if resolved
        $ticket->last_reply_at = now();
        if ($ticket->status === 'resolved') {
            $ticket->status = 'open';
        }
        $ticket->save();

        Log::info('User replied to ticket', [
            'user_id' => Auth::id(),
            'ticket_id' => $ticket->id,
            'has_attachment' => $attachmentPath !== null,
        ]);

        // Send email to assigned staff if exists
        if ($ticket->assigned_to) {
            try {
                $assignedStaff = User::find($ticket->assigned_to);
                if ($assignedStaff) {
                    Mail::to($assignedStaff->email)->send(new TicketReplyMail($ticket, $validated['message'], Auth::user()));
                }
            } catch (\Throwable $e) {
                Log::error('Failed to send ticket reply email', [
                    'ticket_id' => $ticket->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return back()->with('success', 'Reply sent successfully.');
    }

    /**
     * Mark ticket as resolved (user)
     */
    public function resolve(Request $request, Ticket $ticket)
    {
        abort_unless($ticket->user_id === Auth::id(), 403);

        try {
            $oldStatus = $ticket->status;
            $ticket->status = 'resolved';
            $ticket->save();

            // Create status change event message
            TicketMessage::create([
                'ticket_id' => $ticket->id,
                'user_id' => Auth::id(),
                'message' => Auth::user()->name . ' marked ticket as resolved',
                'is_staff' => false,
                'type' => 'status_change',
                'metadata' => [
                    'old_value' => $oldStatus,
                    'new_value' => 'resolved',
                ],
            ]);

            Log::info('User resolved ticket', [
                'user_id' => Auth::id(),
                'ticket_id' => $ticket->id,
            ]);

            return back()->with('success', 'Ticket marked as resolved.');
        } catch (\Throwable $e) {
            Log::error('Ticket resolve error', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors(['resolve' => 'Failed to resolve ticket.']);
        }
    }

    /**
     * Reopen ticket (user)
     */
    public function open(Request $request, Ticket $ticket)
    {
        abort_unless($ticket->user_id === Auth::id(), 403);

        try {
            $ticket->status = 'open';
            $ticket->save();

            Log::info('User reopened ticket', [
                'user_id' => Auth::id(),
                'ticket_id' => $ticket->id,
            ]);

            return back()->with('success', 'Ticket reopened.');
        } catch (\Throwable $e) {
            Log::error('Ticket reopen error', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors(['open' => 'Failed to reopen ticket.']);
        }
    }

    /**
     * Delete ticket (user)
     */
    public function destroy(Request $request, Ticket $ticket)
    {
        abort_unless($ticket->user_id === Auth::id(), 403);

        try {
            // Delete attachments from storage
            foreach ($ticket->messages as $msg) {
                if ($msg->attachment_path) {
                    try {
                        Storage::disk('private')->delete($msg->attachment_path);
                    } catch (\Throwable $e) {
                        Log::warning('Failed to delete attachment', [
                            'ticket_id' => $ticket->id,
                            'message_id' => $msg->id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            }

            Log::warning('User deleted ticket', [
                'user_id' => Auth::id(),
                'ticket_id' => $ticket->id,
                'title' => $ticket->title,
            ]);

            // Delete ticket (cascade will handle messages)
            $ticket->delete();

            return redirect()->route('dashboard.tickets')->with('success', 'Ticket deleted.');
        } catch (\Throwable $e) {
            Log::error('Ticket delete error', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors(['delete' => 'Failed to delete ticket.']);
        }
    }

    /**
     * Admin: View all tickets with filters
     */
    public function adminIndex(Request $request)
    {
        $user = Auth::user();

        $query = Ticket::with(['user:id,name,email', 'server:id,server_name', 'assignedTo:id,name']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('assigned_to')) {
            if ($request->assigned_to === 'unassigned') {
                $query->whereNull('assigned_to');
            } else {
                $query->where('assigned_to', $request->assigned_to);
            }
        }

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('message', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', function($userQuery) use ($request) {
                      $userQuery->where('name', 'like', '%' . $request->search . '%')
                                ->orWhere('email', 'like', '%' . $request->search . '%');
                  });
            });
        }

        // Sort by priority, then unassigned tickets first, then by last_reply_at
        $tickets = $query->orderByRaw("
                CASE priority
                    WHEN 'urgent' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'normal' THEN 3
                    WHEN 'low' THEN 4
                    ELSE 5
                END
            ")
            ->orderByRaw('CASE WHEN assigned_to IS NULL THEN 0 ELSE 1 END') // Unassigned tickets first
            ->orderByDesc('last_reply_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'title' => $ticket->title,
                    'message' => $ticket->message,
                    'department' => $ticket->department,
                    'status' => $ticket->status,
                    'priority' => $ticket->priority,
                    'user_name' => $ticket->user ? $ticket->user->name : 'Unknown',
                    'user_email' => $ticket->user ? $ticket->user->email : '',
                    'server_name' => $ticket->server ? $ticket->server->server_name : null,
                    'assigned_to' => $ticket->assigned_to,
                    'assigned_to_name' => $ticket->assignedTo ? $ticket->assignedTo->name : null,
                    'created_at' => $ticket->created_at->format('Y-m-d'),
                    'last_reply_at' => $ticket->last_reply_at ? $ticket->last_reply_at->format('Y-m-d H:i') : null,
                ];
            });

        // Get all staff members for assignment dropdown
        $staffMembers = User::where('is_admin', true)
            ->orWhereNotNull('role_id')
            ->get(['id', 'name'])
            ->map(function ($staff) {
                return [
                    'id' => $staff->id,
                    'name' => $staff->name,
                ];
            });

        // Get current admin's permissions
        $permissions = [];
        if ($user->isSuperAdmin()) {
            $permissions = ['*'];
        } elseif ($user->role) {
            $permissions = $user->role->permissions->pluck('name')->toArray();
        }

        return Inertia::render('admin-tickets', [
            'tickets' => $tickets,
            'staffMembers' => $staffMembers,
            'filters' => [
                'status' => $request->status,
                'department' => $request->department,
                'priority' => $request->priority,
                'assigned_to' => $request->assigned_to,
                'search' => $request->search,
            ],
            'permissions' => $permissions,
            'csrf' => csrf_token(),
        ]);
    }

    /**
     * Admin: Show ticket detail with comprehensive information
     */
    public function adminShow(Ticket $ticket)
    {
        $user = Auth::user();

        // Load all relationships
        $ticket->load(['user', 'server', 'assignedTo', 'messages.user']);

        // Get all messages
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
                    'attachment_path' => $message->attachment_path ? route('ticket.attachment', ['message' => $message->id]) : null,
                    'created_at' => $message->created_at->format('Y-m-d H:i'),
                    'type' => $message->type ?? 'message',
                    'metadata' => $message->metadata,
                ];
            });

        // Get user information with stats
        $ticketUser = $ticket->user;
        $userInfo = [
            'id' => $ticketUser->id,
            'name' => $ticketUser->name,
            'email' => $ticketUser->email,
            'created_at' => $ticketUser->created_at->format('Y-m-d'),
            'servers_count' => $ticketUser->servers()->count(),
            'open_tickets_count' => $ticketUser->tickets()->whereIn('status', ['open', 'resolved'])->count(),
        ];

        // Get server information if applicable
        $serverInfo = null;
        if ($ticket->server) {
            $server = $ticket->server;
            $serverInfo = [
                'id' => $server->id,
                'server_name' => $server->server_name,
                'status' => $server->status,
                'plan' => is_object($server->plan) ? ($server->plan->name ?? 'N/A') : ($server->plan ?? 'N/A'),
                'created_at' => $server->created_at->format('Y-m-d'),
            ];
        }

        // Get all staff members for assignment dropdown
        $staffMembers = User::where('is_admin', true)
            ->orWhereNotNull('role_id')
            ->get(['id', 'name'])
            ->map(function ($staff) {
                return [
                    'id' => $staff->id,
                    'name' => $staff->name,
                ];
            });

        // Get current admin's permissions
        $permissions = [];
        if ($user->isSuperAdmin()) {
            $permissions = ['*'];
        } elseif ($user->role) {
            $permissions = $user->role->permissions->pluck('name')->toArray();
        }

        // Get pending access requests (only for assignee or super admin)
        $canSeeRequests = $user->isSuperAdmin() || $ticket->assigned_to === $user->id;
        $accessRequests = [];
        if ($canSeeRequests) {
            $accessRequests = TicketAccessRequest::where('ticket_id', $ticket->id)
                ->where('status', 'pending')
                ->with('requester:id,name')
                ->get()
                ->map(function ($req) {
                    return [
                        'id' => $req->id,
                        'requester_id' => $req->requester_id,
                        'requester_name' => $req->requester->name,
                        'created_at' => $req->created_at->format('Y-m-d H:i'),
                    ];
                });
        }

        // Check if current user has a pending request
        $userAccessRequest = TicketAccessRequest::where('ticket_id', $ticket->id)
            ->where('requester_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->first();

        $accessRequestStatus = null;
        if ($userAccessRequest) {
            $accessRequestStatus = [
                'status' => $userAccessRequest->status,
                'response_message' => $userAccessRequest->response_message,
                'responded_at' => $userAccessRequest->responded_at ? $userAccessRequest->responded_at->format('Y-m-d H:i') : null,
            ];
        }

        // Get users who have granted access
        $grantedAccessUsers = [];
        if ($ticket->additional_access) {
            $grantedAccessUsers = User::whereIn('id', $ticket->additional_access)
                ->get(['id', 'name'])
                ->map(function ($u) {
                    return [
                        'id' => $u->id,
                        'name' => $u->name,
                    ];
                });
        }

        return Inertia::render('admin/ticket-detail', [
            'ticket' => [
                'id' => $ticket->id,
                'title' => $ticket->title,
                'department' => $ticket->department,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'server_id' => $ticket->server_id,
                'user_id' => $ticket->user_id,
                'assigned_to' => $ticket->assigned_to,
                'assigned_to_name' => $ticket->assignedTo ? $ticket->assignedTo->name : null,
                'created_at' => $ticket->created_at->format('Y-m-d H:i'),
                'last_reply_at' => $ticket->last_reply_at ? $ticket->last_reply_at->format('Y-m-d H:i') : null,
                'closed_at' => $ticket->closed_at ? $ticket->closed_at->format('Y-m-d H:i') : null,
                'can_manage' => $ticket->canManage($user),
            ],
            'messages' => $messages,
            'user' => $userInfo,
            'server' => $serverInfo,
            'staffMembers' => $staffMembers,
            'permissions' => $permissions,
            'accessRequests' => $accessRequests,
            'accessRequestStatus' => $accessRequestStatus,
            'grantedAccessUsers' => $grantedAccessUsers,
            'csrf' => csrf_token(),
        ]);
    }

    /**
     * Admin: Reply to ticket
     */
    public function adminReply(Request $request, Ticket $ticket)
    {
        // Check if admin can manage this ticket
        abort_unless($ticket->canManage(Auth::user()), 403,
            'This ticket is assigned to another staff member. You do not have permission to reply.');

        $validated = $request->validate([
            'message' => 'required|string',
            'attachment' => [
                'nullable',
                'file',
                'max:10240', // 10MB max
                'mimes:pdf,doc,docx,txt,png,jpg,jpeg,gif',
                'mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/png,image/jpeg,image/gif'
            ],
        ]);

        $attachmentPath = null;
        $attachmentName = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');

            // Validate file type by actual content, not just extension
            $mimeType = $file->getMimeType();
            $allowedMimes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'image/png',
                'image/jpeg',
                'image/gif'
            ];

            if (!in_array($mimeType, $allowedMimes)) {
                return back()->withErrors(['attachment' => 'Invalid file type. Only PDF, DOC, DOCX, TXT, PNG, JPG, and GIF files are allowed.']);
            }

            // Generate secure filename to prevent directory traversal
            $extension = $file->getClientOriginalExtension();
            $secureFileName = 'ticket_admin_' . uniqid() . '_' . time() . '.' . $extension;
            $attachmentName = $file->getClientOriginalName();
            $attachmentPath = $file->storeAs('ticket-attachments', $secureFileName, 'private');
        }

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'message' => $validated['message'],
            'attachment_path' => $attachmentPath,
            'attachment_name' => $attachmentName,
            'is_staff' => true,
        ]);

        // Update last_reply_at
        $ticket->last_reply_at = now();
        $ticket->save();

        Log::info('Admin replied to ticket', [
            'admin_id' => Auth::id(),
            'ticket_id' => $ticket->id,
            'has_attachment' => $attachmentPath !== null,
        ]);

        // Send email to ticket owner
        try {
            $ticketOwner = $ticket->user;
            if ($ticketOwner) {
                Mail::to($ticketOwner->email)->send(new TicketReplyMail($ticket, $validated['message'], Auth::user()));
            }
        } catch (\Throwable $e) {
            Log::error('Failed to send ticket reply email to user', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage(),
            ]);
        }

        return back()->with('success', 'Reply sent successfully.');
    }

    /**
     * Admin: Update ticket status
     */
    public function adminSetStatus(Request $request, Ticket $ticket)
    {
        // Check if admin can manage this ticket
        abort_unless($ticket->canManage(Auth::user()), 403,
            'This ticket is assigned to another staff member. You do not have permission to change the status.');

        $validated = $request->validate([
            'status' => 'required|string|in:open,resolved,closed',
        ]);

        $oldStatus = $ticket->status;

        try {
            $ticket->status = $validated['status'];

            // Set closed_at timestamp when closing
            if ($validated['status'] === 'closed' && $oldStatus !== 'closed') {
                $ticket->closed_at = now();
            } elseif ($validated['status'] !== 'closed') {
                $ticket->closed_at = null;
            }

            $ticket->save();

            // Create status change event message
            TicketMessage::create([
                'ticket_id' => $ticket->id,
                'user_id' => Auth::id(),
                'message' => Auth::user()->name . ' marked ticket as ' . $validated['status'],
                'is_staff' => true,
                'type' => 'status_change',
                'metadata' => [
                    'old_value' => $oldStatus,
                    'new_value' => $validated['status'],
                ],
            ]);

            Log::info('Admin updated ticket status', [
                'admin_id' => Auth::id(),
                'ticket_id' => $ticket->id,
                'old_status' => $oldStatus,
                'new_status' => $validated['status'],
            ]);

            // Send email notification to user
            try {
                $ticketOwner = $ticket->user;
                if ($ticketOwner) {
                    Mail::to($ticketOwner->email)->send(new TicketStatusChange($ticket, $oldStatus, $validated['status']));
                }
            } catch (\Throwable $e) {
                Log::error('Failed to send status change email', [
                    'ticket_id' => $ticket->id,
                    'error' => $e->getMessage(),
                ]);
            }

            return back()->with('success', 'Ticket status updated.');
        } catch (\Throwable $e) {
            Log::error('Admin ticket status update error', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors(['status' => 'Failed to update status.']);
        }
    }

    /**
     * Admin: Assign ticket to staff
     */
    public function adminAssignTicket(Request $request, Ticket $ticket)
    {
        // Check if admin can manage this ticket
        abort_unless($ticket->canManage(Auth::user()), 403,
            'This ticket is assigned to another staff member. You do not have permission to reassign it.');

        $validated = $request->validate([
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $oldAssignee = $ticket->assigned_to;

        try {
            $ticket->assigned_to = $validated['assigned_to'];
            $ticket->save();

            // Get assignee names for event message
            $oldAssigneeName = $oldAssignee ? User::find($oldAssignee)->name : 'Unassigned';
            $newAssigneeName = $ticket->assignedTo ? $ticket->assignedTo->name : 'Unassigned';

            // Create assignment change event message
            TicketMessage::create([
                'ticket_id' => $ticket->id,
                'user_id' => Auth::id(),
                'message' => Auth::user()->name . ' assigned ticket to ' . $newAssigneeName,
                'is_staff' => true,
                'type' => 'assignment_change',
                'metadata' => [
                    'old_value' => $oldAssigneeName,
                    'new_value' => $newAssigneeName,
                ],
            ]);

            Log::info('Admin assigned ticket', [
                'admin_id' => Auth::id(),
                'ticket_id' => $ticket->id,
                'old_assignee' => $oldAssignee,
                'new_assignee' => $validated['assigned_to'],
            ]);

            $assigneeName = $ticket->assignedTo ? $ticket->assignedTo->name : 'Unassigned';

            return back()->with('success', "Ticket assigned to: {$assigneeName}");
        } catch (\Throwable $e) {
            Log::error('Admin ticket assignment error', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors(['assign' => 'Failed to assign ticket.']);
        }
    }

    /**
     * Admin: Set ticket priority
     */
    public function adminSetPriority(Request $request, Ticket $ticket)
    {
        // Check if admin can manage this ticket
        abort_unless($ticket->canManage(Auth::user()), 403,
            'This ticket is assigned to another staff member. You do not have permission to change the priority.');

        $validated = $request->validate([
            'priority' => 'required|string|in:low,normal,high,urgent',
        ]);

        $oldPriority = $ticket->priority;

        try {
            $ticket->priority = $validated['priority'];
            $ticket->save();

            // Create priority change event message
            TicketMessage::create([
                'ticket_id' => $ticket->id,
                'user_id' => Auth::id(),
                'message' => Auth::user()->name . ' changed priority from ' . $oldPriority . ' to ' . $validated['priority'],
                'is_staff' => true,
                'type' => 'priority_change',
                'metadata' => [
                    'old_value' => $oldPriority,
                    'new_value' => $validated['priority'],
                ],
            ]);

            Log::info('Admin updated ticket priority', [
                'admin_id' => Auth::id(),
                'ticket_id' => $ticket->id,
                'old_priority' => $oldPriority,
                'new_priority' => $validated['priority'],
            ]);

            return back()->with('success', 'Ticket priority updated.');
        } catch (\Throwable $e) {
            Log::error('Admin ticket priority update error', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors(['priority' => 'Failed to update priority.']);
        }
    }

    /**
     * Admin: Delete ticket
     */
    public function adminDelete(Ticket $ticket)
    {
        // Check if admin can manage this ticket
        abort_unless($ticket->canManage(Auth::user()), 403,
            'This ticket is assigned to another staff member. You do not have permission to delete it.');

        try {
            // Delete attachments from storage
            foreach ($ticket->messages as $msg) {
                if ($msg->attachment_path) {
                    try {
                        Storage::disk('private')->delete($msg->attachment_path);
                    } catch (\Throwable $e) {
                        Log::warning('Failed to delete attachment', [
                            'ticket_id' => $ticket->id,
                            'message_id' => $msg->id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            }

            Log::warning('Admin deleted ticket', [
                'admin_id' => Auth::id(),
                'ticket_id' => $ticket->id,
                'title' => $ticket->title,
                'user_id' => $ticket->user_id,
            ]);

            // Delete ticket (cascade will handle messages)
            $ticket->delete();

            return redirect()->route('admin.tickets.index')->with('success', 'Ticket deleted.');
        } catch (\Throwable $e) {
            Log::error('Admin ticket delete error', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors(['delete' => 'Failed to delete ticket.']);
        }
    }

    /**
     * Download ticket attachment (secure)
     */
    public function downloadAttachment(TicketMessage $message)
    {
        $user = Auth::user();
        $ticket = $message->ticket;

        // Authorization: owner OR staff with view_tickets permission
        $canView = $ticket->user_id === $user->id ||
                   $user->isSuperAdmin() ||
                   ($user->role && $user->role->permissions->contains('name', 'view_tickets'));

        abort_unless($canView, 403);

        if (!$message->attachment_path || !Storage::disk('private')->exists($message->attachment_path)) {
            abort(404, 'Attachment not found.');
        }

        return Storage::disk('private')->download($message->attachment_path, $message->attachment_name);
    }

    /**
     * Admin: Request access to a ticket
     */
    public function requestAccess(Request $request, Ticket $ticket)
    {
        $user = Auth::user();

        // Super admins don't need to request access
        if ($user->isSuperAdmin()) {
            return back()->withErrors(['access' => 'Super admins have access to all tickets.']);
        }

        // Check if user can already manage the ticket
        if ($ticket->canManage($user)) {
            return back()->withErrors(['access' => 'You already have access to this ticket.']);
        }

        // Check if there's already a pending request
        $existingRequest = TicketAccessRequest::where('ticket_id', $ticket->id)
            ->where('requester_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return back()->withErrors(['access' => 'You already have a pending access request for this ticket.']);
        }

        // Create the access request
        TicketAccessRequest::create([
            'ticket_id' => $ticket->id,
            'requester_id' => $user->id,
            'status' => 'pending',
        ]);

        Log::info('Admin requested ticket access', [
            'admin_id' => $user->id,
            'ticket_id' => $ticket->id,
        ]);

        return back()->with('success', 'Access request sent. The assigned staff member will be notified.');
    }

    /**
     * Admin: Approve access request
     */
    public function approveAccessRequest(Request $request, TicketAccessRequest $accessRequest)
    {
        $user = Auth::user();
        $ticket = $accessRequest->ticket;

        // Only assignee or super admin can approve
        $canApprove = $user->isSuperAdmin() || $ticket->assigned_to === $user->id;

        abort_unless($canApprove, 403, 'Only the assigned staff member or super admin can approve access requests.');

        if ($accessRequest->status !== 'pending') {
            return back()->withErrors(['access' => 'This request has already been processed.']);
        }

        $accessRequest->approve($user, $request->input('message'));

        Log::info('Admin approved ticket access request', [
            'approver_id' => $user->id,
            'requester_id' => $accessRequest->requester_id,
            'ticket_id' => $ticket->id,
        ]);

        return back()->with('success', 'Access request approved. ' . $accessRequest->requester->name . ' can now manage this ticket.');
    }

    /**
     * Admin: Deny access request
     */
    public function denyAccessRequest(Request $request, TicketAccessRequest $accessRequest)
    {
        $user = Auth::user();
        $ticket = $accessRequest->ticket;

        // Only assignee or super admin can deny
        $canDeny = $user->isSuperAdmin() || $ticket->assigned_to === $user->id;

        abort_unless($canDeny, 403, 'Only the assigned staff member or super admin can deny access requests.');

        if ($accessRequest->status !== 'pending') {
            return back()->withErrors(['access' => 'This request has already been processed.']);
        }

        $accessRequest->deny($user, $request->input('message'));

        Log::info('Admin denied ticket access request', [
            'denier_id' => $user->id,
            'requester_id' => $accessRequest->requester_id,
            'ticket_id' => $ticket->id,
        ]);

        return back()->with('success', 'Access request denied.');
    }

    /**
     * Admin: Revoke access from a user
     */
    public function revokeAccess(Request $request, Ticket $ticket)
    {
        $user = Auth::user();

        // Only assignee or super admin can revoke access
        $canRevoke = $user->isSuperAdmin() || $ticket->assigned_to === $user->id;

        abort_unless($canRevoke, 403, 'Only the assigned staff member or super admin can revoke access.');

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $ticket->revokeAccess($validated['user_id']);

        Log::info('Admin revoked ticket access', [
            'revoker_id' => $user->id,
            'revoked_user_id' => $validated['user_id'],
            'ticket_id' => $ticket->id,
        ]);

        return back()->with('success', 'Access revoked successfully.');
    }
}
