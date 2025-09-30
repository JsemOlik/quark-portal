import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { ArrowLeft, Mail } from 'lucide-react';

type Ticket = {
    id: number;
    title: string;
    message: string;
    department: string;
    status: string;
    user_name: string;
    user_email: string;
    server_name: string | null;
    created_at: string;
};

export default function AdminTickets({ tickets = [], csrf }: { tickets: Ticket[], csrf: string }) {
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
            <Head title="Admin - All Tickets" />
            <div className="min-h-screen bg-[#FDFDFC] text-[rgb(255,245,235)] dark:bg-background">
                <header className="mx-auto w-full max-w-7xl px-4 pt-4">
                    <Navbar />
                </header>

                <section className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-8">
                    <Link href="/dashboard" className="text-sm text-brand-cream/70 hover:text-brand inline-flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to the dashboard
                    </Link>
                    <h1 className="mt-2 mb-2 text-2xl font-semibold text-brand-cream">Admin - All Support Tickets</h1>
                    <p className="mb-6 text-brand-cream/80">View and respond to all user tickets</p>

                    {/* Tickets List */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        {tickets.length === 0 ? (
                            <div className="text-center py-8 text-brand-cream/70">
                                No tickets have been created yet.
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
                                                <div className="flex flex-wrap items-center gap-2 text-sm text-brand-cream/70 mb-2">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        {ticket.user_name} ({ticket.user_email})
                                                    </span>
                                                    <span>•</span>
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
                                        <p className="text-brand-cream/80 text-sm whitespace-pre-wrap line-clamp-2">{ticket.message}</p>
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
