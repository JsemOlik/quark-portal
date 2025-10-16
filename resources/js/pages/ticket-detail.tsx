import React, { useState, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    ArrowLeft,
    Send,
    Paperclip,
    Download,
    User,
    UserCog,
    CheckCircle2,
    RotateCcw,
    XCircle,
    // Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

type TicketData = {
    id: number;
    title: string;
    department: string;
    status: string;
    priority: string;
    server_name: string | null;
    created_at: string;
    user_id: number;
    assigned_to: number | null;
    assigned_to_name: string | null;
};

type Message = {
    id: number;
    message: string;
    is_staff: boolean;
    user_name: string;
    attachment_name: string | null;
    attachment_path: string | null;
    created_at: string;
    type?: string;
    metadata?: {
        old_value?: string;
        new_value?: string;
    };
};

export default function TicketDetail({
    ticket,
    messages = [],
    isAdmin = false,
    isOwnTicket = true,
    permissions = [],
    csrf,
}: {
    ticket: TicketData;
    messages: Message[];
    isAdmin?: boolean;
    isOwnTicket?: boolean;
    permissions?: string[];
    csrf: string;
}) {
    const hasPermission = (permission: string) => {
        return permissions.includes('*') || permissions.includes(permission);
    };
    const [replyMessage, setReplyMessage] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [resolveOpen, setResolveOpen] = useState(false);
    const [openOpen, setOpenOpen] = useState(false);
    const [closeOpen, setCloseOpen] = useState(false);
    // const [deleteOpen, setDeleteOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const canUserResolve = !isAdmin && isOwnTicket && ticket.status === 'open';
    // Users CANNOT reopen tickets - only admins can
    const canUserOpen = false;
    // Users cannot close

    const adminCanResolve = isAdmin;
    const adminCanOpen = isAdmin;
    const adminCanClose = isAdmin && !isOwnTicket; // Admins cannot close their own tickets

    const canReply =
        ticket.status !== 'closed' ||
        (isAdmin && !isOwnTicket); // Admin can reply to others even if closed

    const backHref =
        isAdmin && !isOwnTicket
            ? '/dashboard/admin/tickets'
            : '/dashboard/tickets';

    const backLabel =
        isAdmin && !isOwnTicket ? 'Back to all tickets' : 'Back to my tickets';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!replyMessage.trim()) {
            toast.error('Please enter a message');
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('message', replyMessage);
        formData.append('_token', csrf);
        if (attachment) {
            formData.append('attachment', attachment);
        }

        const endpoint =
            isAdmin && !isOwnTicket
                ? `/dashboard/admin/tickets/${ticket.id}/reply`
                : `/dashboard/tickets/${ticket.id}/reply`;

        router.post(endpoint, formData, {
            onSuccess: () => {
                setReplyMessage('');
                setAttachment(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                toast.success('Reply sent successfully!');
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            },
            onError: () => {
                toast.error('Failed to send reply');
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB');
                return;
            }
            setAttachment(file);
        }
    };

    const statusClasses = (status: string) => {
        switch (status) {
            case 'open':
                return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
            case 'closed':
                return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
            case 'resolved':
                return 'bg-green-500/10 border-green-500/20 text-green-400';
            default:
                return 'bg-white/5 border-white/10 text-brand-cream/70';
        }
    };

    const priorityClasses = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-500/10 border-red-500/20 text-red-400';
            case 'high':
                return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
            case 'normal':
                return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
            case 'low':
                return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
            default:
                return 'bg-white/5 border-white/10 text-brand-cream/70';
        }
    };

    // Actions
    const setStatus = (status: 'open' | 'resolved' | 'closed') => {
        const endpoint =
            isAdmin && !isOwnTicket
                ? `/dashboard/admin/tickets/${ticket.id}/status`
                : status === 'closed'
                    ? null
                    : `/dashboard/tickets/${ticket.id}/${status}`; // user endpoints: /open, /resolve

        if (!endpoint) return;

        router.post(
            endpoint,
            isAdmin && !isOwnTicket ? { status, _token: csrf } : { _token: csrf },
            {
                onSuccess: () => {
                    toast.success(
                        status === 'open'
                            ? 'Ticket reopened'
                            : status === 'resolved'
                                ? 'Ticket marked as resolved'
                                : 'Ticket closed'
                    );
                    setResolveOpen(false);
                    setOpenOpen(false);
                    setCloseOpen(false);
                },
                onError: () => toast.error('Failed to update ticket'),
            }
        );
    };


    return (
        <>
            <Head title={`Ticket #${ticket.id} - ${ticket.title}`} />
            <div className="min-h-screen bg-[#FDFDFC] text-[rgb(255,245,235)] dark:bg-background">
                <header className="mx-auto w-full max-w-7xl px-4 pt-4">
                    <Navbar />
                </header>

                <section className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-8">
                    <div className="flex items-center justify-between mb-4">
                        <Link
                            href={backHref}
                            className="inline-flex items-center gap-2 text-sm text-brand-cream/70 hover:text-brand"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {backLabel}
                        </Link>

                        {/* Action bar */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* User actions */}
                            {canUserOpen && (
                                <Dialog open={openOpen} onOpenChange={setOpenOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30 rounded-xl inline-flex items-center gap-2">
                                            <RotateCcw className="h-4 w-4" />
                                            Open
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-[#201c18] border-white/10">
                                        <DialogHeader>
                                            <DialogTitle className="text-brand-cream">
                                                Open this ticket?
                                            </DialogTitle>
                                            <DialogDescription className="text-brand-cream/70">
                                                We’ll set the ticket back to Open so you can continue the
                                                conversation.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="ghost" onClick={() => setOpenOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={() => setStatus('open')} className="bg-blue-600 hover:bg-blue-700">
                                                Confirm
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                            {canUserResolve && (
                                <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-green-500/20 hover:bg-green-500/30 border-green-500/30 rounded-xl inline-flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Mark as Resolved
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-[#201c18] border-white/10">
                                        <DialogHeader>
                                            <DialogTitle className="text-brand-cream">
                                                Mark ticket as resolved?
                                            </DialogTitle>
                                            <DialogDescription className="text-brand-cream/70">
                                                We’ll set this ticket’s status to Resolved.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="ghost" onClick={() => setResolveOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={() => setStatus('resolved')} className="bg-green-600 hover:bg-green-700">
                                                Confirm
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}

                            {/* Admin actions */}
                            {adminCanOpen && (
                                <Dialog open={openOpen} onOpenChange={setOpenOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-blue-500/40 hover:bg-blue-500/60 rounded-xl inline-flex items-center gap-2 border-none">
                                            <RotateCcw className="h-4 w-4" />
                                            Open
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-[#201c18] border-white/10">
                                        <DialogHeader>
                                            <DialogTitle className="text-brand-cream">
                                                Open this ticket?
                                            </DialogTitle>
                                            <DialogDescription className="text-brand-cream/70">
                                                Set the ticket back to Open.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="ghost" onClick={() => setOpenOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={() => setStatus('open')} className="bg-blue-500/40 hover:bg-blue-500/60 border-none rounded-lg">
                                                Confirm
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                            {adminCanResolve && (
                                <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-green-400/30 hover:bg-green-400/50 rounded-xl inline-flex items-center gap-2 border-none">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Mark Resolved
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-[#201c18] border-white/10">
                                        <DialogHeader>
                                            <DialogTitle className="text-brand-cream">
                                                Mark ticket as Resolved?
                                            </DialogTitle>
                                            <DialogDescription className="text-brand-cream/70">
                                                Set the ticket status to Resolved.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="ghost" onClick={() => setResolveOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={() => setStatus('resolved')} className="bg-green-400/30 hover:bg-green-400/50 border-none rounded-lg">
                                                Confirm
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                            {adminCanClose && (
                                <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            className="bg-red-500/30 hover:bg-red-500/50 rounded-xl inline-flex items-center gap-2"
                                        >
                                            <XCircle className="h-4 w-4" />
                                            Close
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-[#201c18] border-white/10">
                                        <DialogHeader>
                                            <DialogTitle className="text-brand-cream">
                                                Close this ticket?
                                            </DialogTitle>
                                            <DialogDescription className="text-brand-cream/70">
                                                This will set the ticket to Closed. Admins can still reply
                                                to closed tickets they don’t own.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="ghost" onClick={() => setCloseOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={() => setStatus('closed')} className="bg-red-500/40 hover:bg-red-500/50 border-none rounded-lg">
                                                Confirm
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}

                            {/* Optional: user delete (kept commented as before)
              {isOwnTicket && (
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="bg-red-500/40 hover:bg-red-500/50 rounded-xl inline-flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Ticket
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#201c18] border-white/10">
                    <DialogHeader>
                      <DialogTitle className="text-brand-cream">
                        Delete this ticket?
                      </DialogTitle>
                      <DialogDescription className="text-brand-cream/70">
                        This will permanently remove the ticket and its messages.
                        This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="ghost"
                        className="text-brand-cream"
                        onClick={() => setDeleteOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        className="bg-red-500/40 hover:bg-red-500/50"
                        onClick={deleteTicket}
                      >
                        Yes, delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )} */}
                        </div>
                    </div>

                    {/* Ticket Header */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-semibold text-brand-cream mb-2">
                                    {ticket.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-brand-cream/70">
                                    <span className="capitalize">{ticket.department}</span>
                                    {ticket.server_name && (
                                        <>
                                            <span>•</span>
                                            <span>{ticket.server_name}</span>
                                        </>
                                    )}
                                    <span>•</span>
                                    <span>Created {ticket.created_at}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                                <span
                                    className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize border ${statusClasses(
                                        ticket.status
                                    )}`}
                                >
                                    {ticket.status}
                                </span>
                                <span
                                    className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize border ${priorityClasses(
                                        ticket.priority
                                    )}`}
                                >
                                    {ticket.priority} Priority
                                </span>
                            </div>
                        </div>
                        {ticket.assigned_to_name && (
                            <div className="pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2 text-sm">
                                    <UserCog className="h-4 w-4 text-brand" />
                                    <span className="text-brand-cream/70">Assigned to:</span>
                                    <span className="text-brand-cream font-medium">{ticket.assigned_to_name}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Messages */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
                        <h2 className="text-lg font-semibold text-brand-cream mb-4">
                            Conversation
                        </h2>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {messages.map((msg) => {
                                // Render event badge for status/priority/assignment changes
                                if (msg.type && msg.type !== 'message') {
                                    const eventColorClasses = {
                                        status_change: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                                        priority_change: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
                                        assignment_change: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
                                    }[msg.type] || 'bg-gray-500/10 border-gray-500/20 text-gray-400';

                                    return (
                                        <div key={msg.id} className="w-full py-2">
                                            <div className={`w-full py-3 px-4 border rounded-lg text-center ${eventColorClasses}`}>
                                                <span className="text-sm font-medium">
                                                    {msg.message}
                                                </span>
                                                <span className="text-xs opacity-70 ml-2">
                                                    {msg.created_at}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }

                                // Render normal message
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.is_staff ? 'justify-start' : 'justify-end'}`}
                                    >
                                        <div
                                            className={`flex gap-3 max-w-[80%] ${msg.is_staff ? 'flex-row' : 'flex-row-reverse'
                                                }`}
                                        >
                                            <div
                                                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${msg.is_staff
                                                    ? 'bg-brand/20 text-brand'
                                                    : 'bg-blue-500/20 text-blue-400'
                                                    }`}
                                            >
                                                {msg.is_staff ? (
                                                    <UserCog className="h-5 w-5" />
                                                ) : (
                                                    <User className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div>
                                                <div
                                                    className={`rounded-2xl px-4 py-3 ${msg.is_staff
                                                        ? 'bg-white/10 border border-white/10'
                                                        : 'bg-brand/10 border border-brand/20'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-semibold text-brand-cream">
                                                            {msg.user_name}
                                                        </span>
                                                        <span className="text-xs text-brand-cream/50">
                                                            {msg.created_at}
                                                        </span>
                                                    </div>
                                                    <p className="text-brand-cream/90 whitespace-pre-wrap">
                                                        {msg.message}
                                                    </p>
                                                    {msg.attachment_name && msg.attachment_path && (
                                                        <a
                                                            href={msg.attachment_path}
                                                            download
                                                            className="mt-2 inline-flex items-center gap-2 text-sm text-brand hover:underline"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                            {msg.attachment_name}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Reply Form visibility per rules */}
                    {canReply ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                            <h2 className="text-lg font-semibold text-brand-cream mb-4">
                                {isAdmin && !isOwnTicket ? 'Send Admin Reply' : 'Send Reply'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Textarea
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="Type your message here..."
                                        rows={4}
                                        className="bg-white/5 border-white/10 text-brand-cream placeholder:text-brand-cream/40"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="attachment"
                                        />
                                        <label
                                            htmlFor="attachment"
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer text-sm text-brand-cream transition-colors"
                                        >
                                            <Paperclip className="h-4 w-4" />
                                            Attach File
                                        </label>
                                        {attachment && (
                                            <span className="text-sm text-brand-cream/70">
                                                {attachment.name} ({(attachment.size / 1024).toFixed(1)} KB)
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || !replyMessage.trim()}
                                        className="bg-brand text-brand-brown hover:bg-brand/90 font-semibold flex items-center gap-2"
                                    >
                                        <Send className="h-4 w-4" />
                                        {isSubmitting ? 'Sending...' : 'Send Reply'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-gray-500/20 bg-gray-500/5 p-6 text-center">
                            <p className="text-brand-cream/70">
                                This ticket is closed. {isAdmin && isOwnTicket ? 'To contact support, please make a new ticket.' : 'To contact support, please make a new ticket.'}
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
