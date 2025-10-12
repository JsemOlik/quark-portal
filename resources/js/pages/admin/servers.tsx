import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { ArrowLeft } from 'lucide-react';

type Server = {
    id: number;
    server_name: string;
    game: string;
    status: string;
    billing_cycle: string;
    user_name: string;
    user_email: string;
    user_id: number;
    plan_name: string;
    subscription_id: string | null;
    created_at: string;
};

export default function AdminServers({ servers }: { servers: Server[] }) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState<string>('all');

    const filteredServers = servers.filter((server) => {
        const matchesSearch =
            server.server_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            server.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            server.user_email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' || server.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <Head title="Admin - All Servers" />
            <div className="min-h-screen bg-[#FDFDFC] text-[rgb(255,245,235)] dark:bg-background">
                <header className="mx-auto w-full max-w-7xl px-4 pt-4">
                    <Navbar />
                </header>

                <section className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-8">
                    <Link
                        href="/admin"
                        className="mb-4 inline-flex items-center gap-2 text-sm text-brand-cream/70 hover:text-brand transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Admin Dashboard
                    </Link>

                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-brand-cream">
                            All Servers
                        </h1>
                        <p className="text-sm text-brand-cream/70">
                            Manage all servers across the platform
                        </p>
                    </div>

                    {/* Servers Table */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-brand-cream focus:outline-none focus:ring-2 focus:ring-brand"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <div className="text-sm text-brand-cream/60">
                                    {filteredServers.length} server{filteredServers.length !== 1 ? 's' : ''}
                                </div>
                            </div>
                            <input
                                type="text"
                                placeholder="Search servers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:ring-2 focus:ring-brand"
                            />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-brand-cream/60">
                                            Server
                                        </th>
                                        <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-brand-cream/60">
                                            User
                                        </th>
                                        <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-brand-cream/60">
                                            Plan
                                        </th>
                                        <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-brand-cream/60">
                                            Billing
                                        </th>
                                        <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-brand-cream/60">
                                            Status
                                        </th>
                                        <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-brand-cream/60">
                                            Created
                                        </th>
                                        <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-brand-cream/60">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredServers.map((server) => (
                                        <tr
                                            key={server.id}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-3">
                                                <div className="font-medium text-brand-cream">
                                                    {server.server_name}
                                                </div>
                                                <div className="text-xs text-brand-cream/50">
                                                    ID: {server.id}
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <Link
                                                    href={`/admin/users/${server.user_id}`}
                                                    className="hover:underline"
                                                >
                                                    <div className="text-sm text-brand-cream">
                                                        {server.user_name}
                                                    </div>
                                                    <div className="text-xs text-brand-cream/50">
                                                        {server.user_email}
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="py-3">
                                                <div className="text-sm text-brand-cream/70">
                                                    {server.plan_name}
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="text-sm capitalize text-brand-cream/70">
                                                    {server.billing_cycle}
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize border ${statusClasses(
                                                        server.status
                                                    )}`}
                                                >
                                                    {server.status}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <div className="text-sm text-brand-cream/70">
                                                    {server.created_at}
                                                </div>
                                            </td>
                                            <td className="py-3 text-right">
                                                <Link
                                                    href={`/dashboard/servers/${server.id}`}
                                                    className="inline-flex items-center rounded-lg bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/20 transition-colors border border-brand/20"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredServers.length === 0 && (
                                <div className="py-12 text-center">
                                    <p className="text-sm text-brand-cream/60">
                                        No servers found matching your filters.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

function statusClasses(status: string) {
    switch (status) {
        case 'cancelled':
            return 'bg-red-500/10 border-red-500/20 text-red-400';
        case 'suspended':
            return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
        case 'active':
            return 'bg-green-500/10 border-green-500/20 text-green-400';
        default:
            return 'bg-white/10 border-white/20 text-brand-cream/80';
    }
}
