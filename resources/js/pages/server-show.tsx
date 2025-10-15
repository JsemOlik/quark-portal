import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
// import { formatGameName } from '@/lib/utils/formatGameName';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
import { ExternalLink } from 'lucide-react';

type Server = {
    id: number;
    name: string;
    game: string;
    billing_cycle: 'monthly' | 'yearly';
    pending_billing_cycle?: 'monthly' | 'yearly' | null;
    status: string; // 'active' | 'suspended' | 'cancelled' | 'pending_cancellation'
    created_at: string;
};

type NextBilling = {
    date: string;
    amount: string;
};

type Resources = {
    memory_mb: number;
    disk_mb: number;
    cpu_percent: number;
    databases: number;
    backups: number;
    allocations: number;
};

type FlashMessages = {
    success?: string;
    error?: string;
};

export default function ServerShow({
    server,
    resources,
    invoices = [] as unknown[],
    nextBilling,
    csrf,
    flash,
}: {
    server: Server;
    resources?: Resources | null;
    invoices?: unknown[];
    nextBilling?: NextBilling | null;
    csrf?: string;
    flash?: FlashMessages;
}) {
    const [loading, setLoading] = React.useState<string | null>(null);
    const [showNotification, setShowNotification] = React.useState(false);

    React.useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowNotification(true);
            const timer = setTimeout(() => setShowNotification(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    function handleAction(
        path: string,
        body: Record<string, string>,
        loadingKey: string,
        closeDialog?: () => void
    ) {
        if (loading) return;

        setLoading(loadingKey);
        router.post(path, body, {
            onFinish: () => {
                setLoading(null);
                if (closeDialog) closeDialog();
            },
        });
    }

    return (
        <>
            <Head title={`Server • ${server.name}`} />
            <div className="min-h-screen bg-[#FDFDFC] text-[rgb(255,245,235)] dark:bg-background">
                <header className="mx-auto w-full max-w-7xl px-4 pt-4">
                    <Navbar />
                </header>

                <section className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-8">
                    {showNotification && (flash?.success || flash?.error) && (
                        <div
                            className={`mb-6 rounded-xl border p-4 ${flash?.success
                                ? 'border-green-500/20 bg-green-500/10 text-green-400'
                                : 'border-red-500/20 bg-red-500/10 text-red-400'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <p className="text-sm">{flash?.success || flash?.error}</p>
                                <button
                                    onClick={() => setShowNotification(false)}
                                    className="text-brand-cream/60 hover:text-brand-cream"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}

                    <Link
                        href="/dashboard"
                        className="text-sm text-brand-cream/70 hover:text-brand"
                    >
                        ← Back to dashboard
                    </Link>

                    <h1 className="mt-2 mb-2 text-2xl font-semibold text-brand-cream">
                        {server.name}
                    </h1>

                    <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-brand-cream/80">
                        {/* <span className="rounded-full bg-white/5 px-3 py-1 border border-white/10">
              {formatGameName(server.game)}
            </span> */}
                        <span className="rounded-full bg-white/5 px-3 py-1 border border-white/10 capitalize">
                            {formatBillingCycle(server.billing_cycle)}
                            {server.pending_billing_cycle &&
                                server.pending_billing_cycle !== server.billing_cycle && (
                                    <span className="text-brand ml-1">
                                        ({formatBillingCycle(server.pending_billing_cycle)} Pending)
                                    </span>
                                )}
                        </span>
                        <span
                            className={`rounded-full px-3 py-1 border capitalize ${statusClasses(server.status)
                                }`}
                        >
                            {server.status === 'pending_cancellation'
                                ? 'Pending Cancellation'
                                : server.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <div className="mb-4 text-lg font-semibold text-brand-cream">
                                    Manage Service & Billing
                                </div>
                                <div className="mb-4 text-sm text-brand-cream/70">
                                    To manage your subscription, billing cycle, payment methods, or cancel this service, use the <span className="text-brand font-semibold">Universal Customer Portal</span> which has all of your services in one centralized place.
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <form method="POST" action="/dashboard/billing/portal">
                                        <input type="hidden" name="_token" value={csrf ?? ''} />
                                        <Button
                                            type="submit"
                                            className="bg-brand text-brand-brown hover:bg-brand/80"
                                        >
                                            Open Customer Portal
                                        </Button>
                                    </form>

                                    {server.status === 'active' && (
                                        <a
                                            href={`/dashboard/servers/${server.id}/panel`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button
                                                className="cursor-pointer bg-brand-cream/10 text-brand-cream hover:bg-brand-cream/20 border border-brand-cream/20"
                                            >
                                                <ExternalLink className="size-4" />
                                                Open Panel
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </div>

                            {server.status === 'active' && (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                    <div className="mb-4 text-lg font-semibold text-brand-cream">
                                        Server Settings
                                    </div>
                                    <div className="mb-3 text-sm text-brand-cream/70">
                                        If you wish to rename your server to better identify it, you can do so below.
                                    </div>

                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);
                                            handleAction(
                                                `/dashboard/servers/${server.id}/rename`,
                                                {
                                                    _token: csrf ?? '',
                                                    server_name: formData.get('server_name') as string,
                                                },
                                                'rename'
                                            );
                                        }}
                                        className="space-y-3"
                                    >
                                        <div>
                                            <label htmlFor="server_name" className="block text-sm font-medium text-brand-cream mb-2">
                                                Server Name
                                            </label>
                                            <input
                                                type="text"
                                                id="server_name"
                                                name="server_name"
                                                defaultValue={server.name}
                                                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:ring-2 focus:ring-brand"
                                                placeholder="Enter server name"
                                                required
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={loading === 'rename'}
                                            className="rounded-xl bg-brand text-brand-brown hover:bg-brand/80 disabled:opacity-50"
                                        >
                                            {loading === 'rename' ? 'Updating...' : 'Update Server Name'}
                                        </Button>
                                    </form>
                                </div>
                            )}
                        </div>

                        <aside className="space-y-6">
                            {nextBilling && (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                    <div className="mb-3 text-lg font-semibold text-brand-cream">
                                        Next Payment
                                    </div>
                                    <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
                                        <div className="mb-2 text-xs text-brand-cream/60 uppercase tracking-wide">
                                            Due Date
                                        </div>
                                        <div className="mb-3 text-lg font-semibold text-brand-cream">
                                            {new Date(nextBilling.date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </div>
                                        <div className="mb-2 text-xs text-brand-cream/60 uppercase tracking-wide">
                                            Amount
                                        </div>
                                        <div className="text-2xl font-bold text-brand">
                                            {nextBilling.amount}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {resources && (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                    <div className="mb-3 text-lg font-semibold text-brand-cream">
                                        Server Resources
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-sm text-brand-cream/60">RAM</span>
                                            <span className="text-sm font-medium text-brand-cream">
                                                {(resources.memory_mb / 1024).toFixed(1)} GB
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-sm text-brand-cream/60">CPU</span>
                                            <span className="text-sm font-medium text-brand-cream">
                                                {resources.cpu_percent}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-sm text-brand-cream/60">Storage</span>
                                            <span className="text-sm font-medium text-brand-cream">
                                                {resources.disk_mb === 0 ? '∞ (Unlimited)' : `${(resources.disk_mb / 1024).toFixed(1)} GB`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-sm text-brand-cream/60">Databases</span>
                                            <span className="text-sm font-medium text-brand-cream">
                                                {resources.databases}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-sm text-brand-cream/60">Backups</span>
                                            <span className="text-sm font-medium text-brand-cream">
                                                {resources.backups}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-sm text-brand-cream/60">Port Allocations</span>
                                            <span className="text-sm font-medium text-brand-cream">
                                                {resources.allocations}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <div className="mb-3 text-lg font-semibold text-brand-cream">
                                    Server Details
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-sm text-brand-cream/60">Server ID</span>
                                        <span className="text-sm font-medium text-brand-cream">
                                            #{server.id}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-sm text-brand-cream/60">Created</span>
                                        <span className="text-sm font-medium text-brand-cream">
                                            {new Date(server.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <div className="mb-3 text-lg font-semibold text-brand-cream">
                                    Recent Invoices
                                </div>
                                {!invoices || (invoices as any[]).length === 0 ? (
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center text-sm text-brand-cream/70">
                                        No invoices yet
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {(invoices as any[]).slice(0, 5).map((inv: any, idx: number) => (
                                            <a
                                                key={`${inv.id}-${idx}`}
                                                href={inv.hosted_invoice_url ?? '#'}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="text-xs text-brand-cream/60">
                                                        {inv.date ?? 'N/A'}
                                                    </div>
                                                    <span
                                                        className={`text-xs px-2 py-0.5 rounded-full ${inv.paid
                                                            ? 'bg-green-500/10 text-green-400'
                                                            : 'bg-yellow-500/10 text-yellow-400'
                                                            }`}
                                                    >
                                                        {inv.paid ? 'Paid' : 'Unpaid'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm font-medium text-brand-cream">
                                                        {inv.number || 'Invoice'}
                                                    </div>
                                                    <div className="text-sm font-semibold text-brand">
                                                        {inv.total}
                                                    </div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </aside>
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
        case 'pending_cancellation':
            return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
        case 'active':
            return 'bg-green-500/10 border-green-500/20 text-green-400';
        default:
            return 'bg-white/10 border-white/20 text-brand-cream/80';
    }
}

function formatBillingCycle(cycle: string): string {
    const mapping: Record<string, string> = {
        'monthly': 'Monthly',
        'quarterly': 'Quarterly',
        'semi_annual': 'Semi Annual',
        'yearly': 'Yearly',
    };
    return mapping[cycle] || cycle;
}
