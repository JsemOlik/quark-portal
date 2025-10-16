import React, { useState, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    Send,
    Paperclip,
    Download,
    User,
    UserCog,
    Mail,
    Calendar,
    Server,
    Shield,
    Clock,
    AlertCircle,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

type TicketData = {
    id: number;
    title: string;
    department: string;
    status: string;
    priority: string;
    server_name: string | null;
    server_id: number | null;
    created_at: string;
    last_reply_at: string | null;
    closed_at: string | null;
    user_id: number;
    assigned_to: number | null;
    assigned_to_name: string | null;
    can_manage: boolean;
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

type UserInfo = {
    id: number;
    name: string;
    email: string;
    created_at: string;
    servers_count: number;
    open_tickets_count: number;
};

type ServerInfo = {
    id: number;
    server_name: string;
    status: string;
    plan: string;
    created_at: string;
};

type StaffMember = {
    id: number;
    name: string;
};

export default function AdminTicketDetail({
    ticket,
    messages = [],
    user,
    server,
    staffMembers = [],
    permissions = [],
    csrf,
}: {
    ticket: TicketData;
    messages: Message[];
    user: UserInfo;
    server?: ServerInfo;
    staffMembers: StaffMember[];
    permissions: string[];
    csrf: string;
}) {
    const hasPermission = (permission: string) => {
        return permissions.includes('*') || permissions.includes(permission);
    };

    const [replyMessage, setReplyMessage] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

        router.post(`/admin/tickets/${ticket.id}/reply`, formData, {
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

    const handleStatusChange = (newStatus: string) => {
        router.post(
            `/admin/tickets/${ticket.id}/status`,
            { status: newStatus, _token: csrf },
            {
                onSuccess: () => toast.success('Status updated'),
                onError: () => toast.error('Failed to update status'),
            }
        );
    };

    const handlePriorityChange = (newPriority: string) => {
        router.post(
            `/admin/tickets/${ticket.id}/priority`,
            { priority: newPriority, _token: csrf },
            {
                onSuccess: () => toast.success('Priority updated'),
                onError: () => toast.error('Failed to update priority'),
            }
        );
    };

    const handleAssignmentChange = (newAssignee: string) => {
        router.post(
            `/admin/tickets/${ticket.id}/assign`,
            { assigned_to: newAssignee === 'unassigned' ? null : newAssignee, _token: csrf },
            {
                onSuccess: () => toast.success('Assignment updated'),
                onError: () => toast.error('Failed to update assignment'),
            }
        );
    };

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
            return;
        }

        router.delete(`/admin/tickets/${ticket.id}`, {
            onSuccess: () => {
                toast.success('Ticket deleted');
            },
            onError: () => toast.error('Failed to delete ticket'),
        });
    };

    return (
        <>
            <Head title={`Ticket #${ticket.id} - Admin`} />
            <div className="min-h-screen bg-[#FDFDFC] text-[rgb(255,245,235)] dark:bg-background">
                <header className="mx-auto w-full max-w-7xl px-4 pt-4">
                    <Navbar />
                </header>

                <section className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <Link
                            href="/admin/tickets"
                            className="inline-flex items-center gap-2 text-sm text-brand-cream/70 hover:text-brand transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to All Tickets
                        </Link>

                        {hasPermission('delete_tickets') && (
                            <Button
                                onClick={handleDelete}
                                variant="destructive"
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Ticket
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content - Left Side */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Ticket Header */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm text-brand-cream/60">Ticket #{ticket.id}</span>
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize border ${statusClasses(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize border ${priorityClasses(ticket.priority)}`}>
                                                {ticket.priority}
                                            </span>
                                        </div>
                                        <h1 className="text-2xl font-semibold text-brand-cream mb-2">
                                            {ticket.title}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-brand-cream/70">
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Created {ticket.created_at}
                                            </span>
                                            {ticket.last_reply_at && (
                                                <>
                                                    <span>•</span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        Last reply {ticket.last_reply_at}
                                                    </span>
                                                </>
                                            )}
                                            <span>•</span>
                                            <span className="capitalize bg-white/5 px-2 py-0.5 rounded">{ticket.department}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                <h2 className="text-lg font-semibold text-brand-cream mb-4 flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" />
                                    Conversation ({messages.length})
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
                                                <div className={`flex gap-3 max-w-[80%] ${msg.is_staff ? 'flex-row' : 'flex-row-reverse'}`}>
                                                    <div
                                                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                                            msg.is_staff
                                                                ? 'bg-brand/20 text-brand'
                                                                : 'bg-blue-500/20 text-blue-400'
                                                        }`}
                                                    >
                                                        {msg.is_staff ? <UserCog className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                                    </div>
                                                    <div>
                                                        <div
                                                            className={`rounded-2xl px-4 py-3 ${
                                                                msg.is_staff
                                                                    ? 'bg-white/10 border border-white/10'
                                                                    : 'bg-brand/10 border border-brand/20'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm font-semibold text-brand-cream">
                                                                    {msg.user_name}
                                                                </span>
                                                                {msg.is_staff && (
                                                                    <span className="text-xs bg-brand/20 text-brand px-1.5 py-0.5 rounded">Staff</span>
                                                                )}
                                                                <span className="text-xs text-brand-cream/50">{msg.created_at}</span>
                                                            </div>
                                                            <p className="text-brand-cream/90 whitespace-pre-wrap">{msg.message}</p>
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

                            {/* Reply Form */}
                            {hasPermission('reply_tickets') && (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                    <h2 className="text-lg font-semibold text-brand-cream mb-4">Send Reply as Staff</h2>
                                    {!ticket.can_manage && !hasPermission('*') && (
                                        <div className="mb-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm">
                                            ⚠️ This ticket is assigned to {ticket.assigned_to_name || 'another staff member'}. You cannot reply to it.
                                        </div>
                                    )}
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <Textarea
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                placeholder="Type your response here..."
                                                rows={4}
                                                disabled={!ticket.can_manage}
                                                className="bg-white/5 border-white/10 text-brand-cream placeholder:text-brand-cream/40 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                    disabled={!ticket.can_manage}
                                                />
                                                <label
                                                    htmlFor="attachment"
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 ${ticket.can_manage ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} text-sm text-brand-cream transition-colors`}
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
                                                disabled={isSubmitting || !replyMessage.trim() || !ticket.can_manage}
                                                className="bg-brand text-brand-brown hover:bg-brand/90 font-semibold flex items-center gap-2"
                                            >
                                                <Send className="h-4 w-4" />
                                                {isSubmitting ? 'Sending...' : 'Send Reply'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Right Side */}
                        <div className="space-y-6">
                            {/* Ticket Actions */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <h3 className="text-sm font-semibold text-brand-cream mb-4 uppercase tracking-wide">
                                    Ticket Actions
                                </h3>
                                {!ticket.can_manage && !hasPermission('*') && (
                                    <div className="mb-3 p-2 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs">
                                        🔒 Assigned to {ticket.assigned_to_name}
                                    </div>
                                )}
                                <div className="space-y-3">
                                    {hasPermission('close_tickets') && (
                                        <div>
                                            <label className="text-xs text-brand-cream/60 mb-2 block">Status</label>
                                            <Select value={ticket.status} onValueChange={handleStatusChange} disabled={!ticket.can_manage}>
                                                <SelectTrigger className="bg-white/5 border-white/10 text-brand-cream disabled:opacity-50 disabled:cursor-not-allowed">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1a1714] border-white/10">
                                                    <SelectItem value="open">Open</SelectItem>
                                                    <SelectItem value="resolved">Resolved</SelectItem>
                                                    <SelectItem value="closed">Closed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {hasPermission('view_tickets') && (
                                        <div>
                                            <label className="text-xs text-brand-cream/60 mb-2 block">Priority</label>
                                            <Select value={ticket.priority} onValueChange={handlePriorityChange} disabled={!ticket.can_manage}>
                                                <SelectTrigger className="bg-white/5 border-white/10 text-brand-cream disabled:opacity-50 disabled:cursor-not-allowed">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1a1714] border-white/10">
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="normal">Normal</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                    <SelectItem value="urgent">Urgent</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {hasPermission('assign_tickets') && (
                                        <div>
                                            <label className="text-xs text-brand-cream/60 mb-2 block">Assigned To</label>
                                            <Select
                                                value={ticket.assigned_to?.toString() || 'unassigned'}
                                                onValueChange={handleAssignmentChange}
                                                disabled={!ticket.can_manage}
                                            >
                                                <SelectTrigger className="bg-white/5 border-white/10 text-brand-cream disabled:opacity-50 disabled:cursor-not-allowed">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1a1714] border-white/10">
                                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                                    {staffMembers.map((staff) => (
                                                        <SelectItem key={staff.id} value={staff.id.toString()}>
                                                            {staff.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* User Information */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <h3 className="text-sm font-semibold text-brand-cream mb-4 uppercase tracking-wide flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Customer Information
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs text-brand-cream/60 mb-1">Name</div>
                                        <div className="text-sm text-brand-cream font-medium">{user.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-brand-cream/60 mb-1">Email</div>
                                        <a href={`mailto:${user.email}`} className="text-sm text-brand hover:underline flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            {user.email}
                                        </a>
                                    </div>
                                    <div>
                                        <div className="text-xs text-brand-cream/60 mb-1">Member Since</div>
                                        <div className="text-sm text-brand-cream">{user.created_at}</div>
                                    </div>
                                    <div className="pt-3 border-t border-white/10">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <div className="text-xs text-brand-cream/60 mb-1">Total Servers</div>
                                                <div className="text-lg font-semibold text-brand">{user.servers_count}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-brand-cream/60 mb-1">Open Tickets</div>
                                                <div className="text-lg font-semibold text-blue-400">{user.open_tickets_count}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <Link
                                            href={`/admin/users/${user.id}`}
                                            className="text-sm text-brand hover:underline flex items-center gap-1"
                                        >
                                            View Full Profile →
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Server Information */}
                            {server && (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                    <h3 className="text-sm font-semibold text-brand-cream mb-4 uppercase tracking-wide flex items-center gap-2">
                                        <Server className="h-4 w-4" />
                                        Related Server
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-xs text-brand-cream/60 mb-1">Server Name</div>
                                            <div className="text-sm text-brand-cream font-medium">{server.server_name}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-brand-cream/60 mb-1">Plan</div>
                                            <div className="text-sm text-brand-cream">{server.plan}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-brand-cream/60 mb-1">Status</div>
                                            <span
                                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                    server.status === 'active'
                                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                        : server.status === 'suspended'
                                                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                                        : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                                }`}
                                            >
                                                {server.status}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-xs text-brand-cream/60 mb-1">Created</div>
                                            <div className="text-sm text-brand-cream">{server.created_at}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
