import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { Users, Server, Activity, XCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

type User = {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    servers_count: number;
    created_at: string;
};

type Stats = {
    total_users: number;
    total_servers: number;
    active_servers: number;
    cancelled_servers: number;
};

export default function AdminDashboard({
    users,
    stats,
}: {
    users: User[];
    stats: Stats;
}) {
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="min-h-screen bg-[#FDFDFC] text-[rgb(255,245,235)] dark:bg-background">
                <header className="mx-auto w-full max-w-7xl px-4 pt-4">
                    <Navbar />
                </header>

                <section className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-brand-cream">
                                Admin Dashboard
                            </h1>
                            <p className="text-sm text-brand-cream/70">
                                Manage users and servers
                            </p>
                        </div>
                        <div>
                        <Link href="/admin/servers">
                            <Button size='md' className='text-brand-brown bg-brand text-sm hover:bg-brand/80 transition-colors p-5'>
                                View All Servers
                            </Button>
                        </Link>
                            <a
                                href="https://panel.jsemolik.dev/admin"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button size='md' className='cursor-pointer bg-brand-cream/10 text-brand-cream hover:bg-brand-cream/20 border border-brand-cream/20 transition-colors ml-3 p-5'>
                                    <ExternalLink className="h-4 w-4" />
                                    Open Panel
                                </Button>
                            </a>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-blue-500/10 p-3">
                                    <Users className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-brand-cream">
                                        {stats.total_users}
                                    </div>
                                    <div className="text-xs text-brand-cream/60">
                                        Total Users
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-purple-500/10 p-3">
                                    <Server className="h-5 w-5 text-purple-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-brand-cream">
                                        {stats.total_servers}
                                    </div>
                                    <div className="text-xs text-brand-cream/60">
                                        Total Servers
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-green-500/10 p-3">
                                    <Activity className="h-5 w-5 text-green-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-brand-cream">
                                        {stats.active_servers}
                                    </div>
                                    <div className="text-xs text-brand-cream/60">
                                        Active Servers
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-red-500/10 p-3">
                                    <XCircle className="h-5 w-5 text-red-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-brand-cream">
                                        {stats.cancelled_servers}
                                    </div>
                                    <div className="text-xs text-brand-cream/60">
                                        Cancelled Servers
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-brand-cream">
                                All Users
                            </h2>
                            <input
                                type="text"
                                placeholder="Search users..."
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
                                            User
                                        </th>
                                        <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-brand-cream/60">
                                            Email
                                        </th>
                                        <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-brand-cream/60">
                                            Servers
                                        </th>
                                        <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-brand-cream/60">
                                            Role
                                        </th>
                                        <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-brand-cream/60">
                                            Joined
                                        </th>
                                        <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-brand-cream/60">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-3">
                                                <div className="font-medium text-brand-cream">
                                                    {user.name}
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="text-sm text-brand-cream/70">
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="inline-flex items-center justify-center rounded-full bg-brand/10 px-2 py-1 text-xs font-medium text-brand">
                                                    {user.servers_count}
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                {user.is_admin ? (
                                                    <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-400 border border-purple-500/20">
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-white/5 px-2 py-1 text-xs font-medium text-brand-cream/60 border border-white/10">
                                                        User
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3">
                                                <div className="text-sm text-brand-cream/70">
                                                    {user.created_at}
                                                </div>
                                            </td>
                                            <td className="py-3 text-right">
                                                <Link
                                                    href={`/admin/users/${user.id}`}
                                                    className="inline-flex items-center rounded-lg bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/20 transition-colors border border-brand/20"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredUsers.length === 0 && (
                                <div className="py-12 text-center">
                                    <p className="text-sm text-brand-cream/60">
                                        No users found matching your search.
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
