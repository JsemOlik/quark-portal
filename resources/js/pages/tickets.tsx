import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Ticket as TicketIcon } from 'lucide-react';
import { toast } from 'sonner';

type Ticket = {
    id: number;
    title: string;
    message: string;
    department: string;
    status: string;
    server_name: string | null;
    created_at: string;
};

type Server = {
    id: number;
    server_name: string;
};

export default function Tickets({ tickets = [], servers = []}: { tickets: Ticket[], servers: Server[], isAdmin?: boolean, csrf: string }) {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [department, setDepartment] = useState('');
    const [serverId, setServerId] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};
        if (!title.trim()) newErrors.title = 'Title is required';
        if (!message.trim()) newErrors.message = 'Message is required';
        if (!department) newErrors.department = 'Department is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        router.post(
            '/dashboard/tickets',
            {
                title,
                message,
                department,
                server_id: serverId || null,
            },
            {
                onSuccess: () => {
                    setTitle('');
                    setMessage('');
                    setDepartment('');
                    setServerId('');
                    toast.success('Ticket submitted successfully!');
                },
                onError: (errors) => {
                    setErrors(errors as Record<string, string>);
                    toast.error('Failed to submit ticket');
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            }
        );
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

    return (
        <>
            <Head title="Support Tickets" />
            <div className="min-h-screen bg-[#FDFDFC] text-[rgb(255,245,235)] dark:bg-background">
                <header className="mx-auto w-full max-w-7xl px-4 pt-4">
                    <Navbar />
                </header>

                <section className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <Link href="/dashboard" className="text-sm text-brand-cream/70 hover:text-brand">
                                ← Back to dashboard
                            </Link>
                            <h1 className="mt-2 text-2xl font-semibold text-brand-cream">Support Tickets</h1>
                        </div>
                    </div>

                    {/* Create Ticket Form */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <TicketIcon className="h-5 w-5 text-brand" />
                            <h2 className="text-xl font-semibold text-brand-cream">Create New Ticket</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-brand-cream/90 mb-2">
                                        Title
                                    </label>
                                    <Input
                                        id="title"
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Brief description of your issue"
                                        className="bg-white/5 border-white/10 text-brand-cream placeholder:text-brand-cream/40"
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
                                </div>

                                <div>
                                    <label htmlFor="department" className="block text-sm font-medium text-brand-cream/90 mb-2">
                                        Department
                                    </label>
                                    <Select value={department} onValueChange={setDepartment}>
                                        <SelectTrigger className="bg-white/5 border-white/10 text-brand-cream">
                                            <SelectValue placeholder="Select a department" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#201c18] border-white/10">
                                            <SelectItem value="general">General Support</SelectItem>
                                            <SelectItem value="technical">Technical Support</SelectItem>
                                            <SelectItem value="billing">Billing</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.department && <p className="mt-1 text-sm text-red-400">{errors.department}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="server" className="block text-sm font-medium text-brand-cream/90 mb-2">
                                    Related Server (Optional)
                                </label>
                                <Select value={serverId || undefined} onValueChange={(val) => setServerId(val === 'none' ? '' : val)}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-brand-cream">
                                        <SelectValue placeholder="Select a server" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#201c18] border-white/10">
                                        <SelectItem value="none">None</SelectItem>
                                        {servers.map((server) => (
                                            <SelectItem key={server.id} value={server.id.toString()}>
                                                {server.server_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-brand-cream/90 mb-2">
                                    Message
                                </label>
                                <Textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Please describe your issue in detail..."
                                    rows={6}
                                    className="bg-white/5 border-white/10 text-brand-cream placeholder:text-brand-cream/40"
                                />
                                {errors.message && <p className="mt-1 text-sm text-red-400">{errors.message}</p>}
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-brand text-brand-brown hover:bg-brand/90 font-semibold"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                            </Button>
                        </form>
                    </div>

                    {/* Tickets List */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <h2 className="text-xl font-semibold text-brand-cream mb-4">Your Tickets</h2>

                        {tickets.length === 0 ? (
                            <div className="text-center py-8 text-brand-cream/70">
                                No tickets yet. Create one above to get help from our support team.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tickets.map((ticket) => (
                                    <Link
                                        key={ticket.id}
                                        href={`/dashboard/tickets/${ticket.id}`}
                                        className="block rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-brand-cream mb-1">{ticket.title}</h3>
                                                <div className="flex flex-wrap items-center gap-2 text-sm text-brand-cream/70">
                                                    <span className="capitalize">{ticket.department}</span>
                                                    {ticket.server_name && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{ticket.server_name}</span>
                                                        </>
                                                    )}
                                                    <span>•</span>
                                                    <span>{ticket.created_at}</span>
                                                </div>
                                            </div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize border ${statusClasses(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <p className="text-brand-cream/80 text-sm whitespace-pre-wrap">{ticket.message}</p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}
