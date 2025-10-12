import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { ArrowLeft, Mail, Calendar, CreditCard, Server as ServerIcon, MapPin, ExternalLink, Send, History, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type User = {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    stripe_id: string | null;
    billing_name: string | null;
    billing_address: string | null;
    billing_city: string | null;
    billing_country: string | null;
    created_at: string;
};

type Server = {
    id: number;
    server_name: string;
    game: string;
    status: string;
    billing_cycle: string;
    pending_billing_cycle?: string | null;
    plan_name: string;
    subscription_id: string | null;
    subscription_period_end: string | null;
    pterodactyl_server_id: number | null;
    created_at: string;
};

type Invoice = {
    id: string;
    number: string;
    total: string;
    date: string | null;
    paid: boolean;
    status: string;
    hosted_invoice_url: string | null;
};

type PreviousEmail = {
    id: number;
    subject: string;
    message: string;
    cc_emails: string | null;
    admin_name: string;
    sent_at: string;
};

type FlashMessages = {
    success?: string;
    error?: string;
};

type EmailTemplate = {
    name: string;
    subject: string;
    message: string;
};

const EMAIL_TEMPLATES: EmailTemplate[] = [
    {
        name: 'Payment Issue',
        subject: 'Payment Issue with Your Account',
        message: 'Hello,\n\nWe noticed there was an issue processing your recent payment. Please update your payment method in your customer portal, which can be found in the dashboard, to avoid any service interruptions.\n\nIf you have any questions, feel free to reach out to our support team.\n\nBest regards,\nThe Support Team',
    },
    {
        name: 'Account Suspended',
        subject: 'Your Account Has Been Suspended',
        message: 'Hello,\n\nYour account has been temporarily suspended due to [REASON]. To restore access, please [ACTION REQUIRED].\n\nIf you believe this is a mistake, please contact our support team immediately.\n\nBest regards,\nThe Support Team',
    },
    {
        name: 'Server Maintenance',
        subject: 'Scheduled Server Maintenance',
        message: 'Hello,\n\nWe will be performing scheduled maintenance on our servers on [DATE] at [TIME]. Expected downtime is approximately [DURATION].\n\nWe apologize for any inconvenience this may cause.\n\nBest regards,\nThe Support Team',
    },
    {
        name: 'Billing Inquiry Response',
        subject: 'Response to Your Billing Inquiry',
        message: 'Hello,\n\nThank you for reaching out regarding your billing inquiry. [PROVIDE SPECIFIC RESPONSE HERE]\n\nIf you have any additional questions, please don\'t hesitate to contact us.\n\nBest regards,\nThe Support Team',
    },
];

export default function AdminUserDetails({
    user,
    servers,
    invoices,
    previousEmails,
    csrf,
    flash,
}: {
    user: User;
    servers: Server[];
    invoices: Invoice[];
    previousEmails: PreviousEmail[];
    csrf?: string;
    flash?: FlashMessages;
}) {
    const [emailSubject, setEmailSubject] = React.useState('');
    const [emailMessage, setEmailMessage] = React.useState('');
    const [ccEmails, setCcEmails] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [showNotification, setShowNotification] = React.useState(false);
    const [showEmailHistory, setShowEmailHistory] = React.useState(false);

    React.useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowNotification(true);
            const timer = setTimeout(() => setShowNotification(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    function handleTemplateSelect(template: EmailTemplate) {
        setEmailSubject(template.subject);
        setEmailMessage(template.message);
    }

    function handleSendEmail(e: React.FormEvent) {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        router.post(
            `/admin/users/${user.id}/send-email`,
            {
                _token: csrf ?? '',
                subject: emailSubject,
                message: emailMessage,
                cc_emails: ccEmails,
            },
            {
                onFinish: () => {
                    setLoading(false);
                    setEmailSubject('');
                    setEmailMessage('');
                    setCcEmails('');
                },
            }
        );
    }
    return (
        <>
            <Head title={`Admin - ${user.name}`} />
            <div className="min-h-screen bg-[#FDFDFC] text-[rgb(255,245,235)] dark:bg-background">
                <header className="mx-auto w-full max-w-7xl px-4 pt-4">
                    <Navbar />
                </header>

                <section className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-8">
                    {showNotification && (flash?.success || flash?.error) && (
                        <div
                            className={`mb-6 rounded-xl border p-4 ${
                                flash?.success
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
                        href="/admin"
                        className="mb-4 inline-flex items-center gap-2 text-sm text-brand-cream/70 hover:text-brand transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Admin Dashboard
                    </Link>

                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-semibold text-brand-cream">
                                {user.name}
                            </h1>
                            {user.is_admin && (
                                <span className="inline-flex items-center rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400 border border-purple-500/20">
                                    Admin
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-brand-cream/70">
                            User ID: {user.id}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - User Info & Quick Stats */}
                        <div className="space-y-6">
                            {/* User Information */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <h2 className="mb-4 text-lg font-semibold text-brand-cream">
                                    User Information
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-5 w-5 text-brand-cream/60 mt-0.5" />
                                        <div>
                                            <div className="text-xs text-brand-cream/60 mb-1">
                                                Email
                                            </div>
                                            <div className="text-sm text-brand-cream break-all">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-brand-cream/60 mt-0.5" />
                                        <div>
                                            <div className="text-xs text-brand-cream/60 mb-1">
                                                Joined
                                            </div>
                                            <div className="text-sm text-brand-cream">
                                                {user.created_at}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <CreditCard className="h-5 w-5 text-brand-cream/60 mt-0.5" />
                                        <div>
                                            <div className="text-xs text-brand-cream/60 mb-1">
                                                Stripe Customer ID
                                            </div>
                                            <div className="text-sm text-brand-cream font-mono break-all">
                                                {user.stripe_id || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Billing Details */}
                            {(user.billing_name || user.billing_address || user.billing_city || user.billing_country) && (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                    <h2 className="mb-4 text-lg font-semibold text-brand-cream">
                                        Billing Details
                                    </h2>
                                    <div className="space-y-3">
                                        {user.billing_name && (
                                            <div className="flex items-start gap-3">
                                                <CreditCard className="h-5 w-5 text-brand-cream/60 mt-0.5" />
                                                <div>
                                                    <div className="text-xs text-brand-cream/60 mb-1">
                                                        Billing Name
                                                    </div>
                                                    <div className="text-sm text-brand-cream">
                                                        {user.billing_name}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {(user.billing_address || user.billing_city || user.billing_country) && (
                                            <div className="flex items-start gap-3">
                                                <MapPin className="h-5 w-5 text-brand-cream/60 mt-0.5" />
                                                <div>
                                                    <div className="text-xs text-brand-cream/60 mb-1">
                                                        Billing Address
                                                    </div>
                                                    <div className="text-sm text-brand-cream">
                                                        {[user.billing_address, user.billing_city, user.billing_country]
                                                            .filter(Boolean)
                                                            .join(', ')}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Quick Stats */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <h2 className="mb-4 text-lg font-semibold text-brand-cream">
                                    Quick Stats
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-sm text-brand-cream/60">Total Servers</span>
                                        <span className="text-sm font-medium text-brand-cream">
                                            {servers.length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-sm text-brand-cream/60">Active Servers</span>
                                        <span className="text-sm font-medium text-green-400">
                                            {servers.filter((s) => s.status === 'active').length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-sm text-brand-cream/60">Total Invoices</span>
                                        <span className="text-sm font-medium text-brand-cream">
                                            {invoices.length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Servers, Subscriptions, Invoices */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Servers */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <ServerIcon className="h-5 w-5 text-brand" />
                                    <h2 className="text-lg font-semibold text-brand-cream">
                                        Servers ({servers.length})
                                    </h2>
                                </div>

                                {servers.length === 0 ? (
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
                                        <p className="text-sm text-brand-cream/60">
                                            No servers found for this user.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {servers.map((server) => (
                                            <div
                                                key={server.id}
                                                className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <div className="font-medium text-brand-cream mb-1">
                                                            {server.server_name}
                                                        </div>
                                                        <div className="text-xs text-brand-cream/50">
                                                            ID: {server.id} • Plan: {server.plan_name}
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize border ${statusClasses(
                                                            server.status
                                                        )}`}
                                                    >
                                                        {server.status}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                    <div>
                                                        <span className="text-brand-cream/60">Billing: </span>
                                                        <span className="text-brand-cream capitalize">
                                                            {server.billing_cycle}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-brand-cream/60">Created: </span>
                                                        <span className="text-brand-cream">
                                                            {server.created_at}
                                                        </span>
                                                    </div>
                                                    {server.subscription_id && (
                                                        <div className="col-span-2">
                                                            <span className="text-brand-cream/60">Subscription: </span>
                                                            <span className="text-brand-cream font-mono text-[10px]">
                                                                {server.subscription_id}
                                                            </span>
                                                            {server.subscription_period_end && (
                                                                <span className="text-brand-cream/60 ml-2">
                                                                    • Ends: {server.subscription_period_end}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/dashboard/servers/${server.id}`}
                                                        className="inline-flex items-center rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/20 transition-colors border border-brand/20"
                                                    >
                                                        View Server Details
                                                    </Link>
                                                    {server.subscription_id && (
                                                        <a
                                                            href={`https://dashboard.stripe.com/subscriptions/${server.subscription_id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-400 hover:bg-purple-500/20 transition-colors border border-purple-500/20"
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                            View in Stripe
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Invoices */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <h2 className="mb-4 text-lg font-semibold text-brand-cream">
                                    Recent Invoices ({invoices.length})
                                </h2>

                                {invoices.length === 0 ? (
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
                                        <p className="text-sm text-brand-cream/60">
                                            No invoices found for this user.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {invoices.map((inv) => (
                                            <a
                                                key={inv.id}
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
                                                        className={`text-xs px-2 py-0.5 rounded-full ${
                                                            inv.paid
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

                            {/* Send Email */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Send className="h-5 w-5 text-brand" />
                                        <h2 className="text-lg font-semibold text-brand-cream">
                                            Send Email to {user.name}
                                        </h2>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="inline-flex items-center gap-2 rounded-xl bg-white/5 text-brand-cream hover:bg-white/10 border border-white/10"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    <span className="hidden sm:inline">Select Template</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56 bg-[#1a1714] border-white/10">
                                                <DropdownMenuLabel className="text-brand-cream">Email Templates</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {EMAIL_TEMPLATES.map((template) => (
                                                    <DropdownMenuItem
                                                        key={template.name}
                                                        onClick={() => handleTemplateSelect(template)}
                                                        className="text-brand-cream hover:bg-white/10 cursor-pointer"
                                                    >
                                                        {template.name}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button
                                            type="button"
                                            onClick={() => setShowEmailHistory(!showEmailHistory)}
                                            className="inline-flex items-center gap-2 rounded-xl bg-white/5 text-brand-cream hover:bg-white/10 border border-white/10"
                                            variant="ghost"
                                        >
                                            <History className="h-4 w-4" />
                                            <span className="hidden sm:inline">
                                                {showEmailHistory ? 'Hide History' : `View Previous Emails (${previousEmails.length})`}
                                            </span>
                                        </Button>
                                    </div>
                                </div>

                                {showEmailHistory && previousEmails.length > 0 && (
                                    <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                                        <h3 className="mb-3 text-sm font-semibold text-brand-cream">
                                            Email History
                                        </h3>
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {previousEmails.map((email) => (
                                                <div
                                                    key={email.id}
                                                    className="rounded-lg border border-white/10 bg-white/5 p-3"
                                                >
                                                    <div className="mb-2 flex items-start justify-between">
                                                        <div className="font-medium text-brand-cream text-sm">
                                                            {email.subject}
                                                        </div>
                                                        <div className="text-xs text-brand-cream/60">
                                                            {email.sent_at}
                                                        </div>
                                                    </div>
                                                    <div className="mb-2 text-xs text-brand-cream/70 whitespace-pre-wrap">
                                                        {email.message}
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-brand-cream/60">
                                                            Sent by: <span className="text-brand-cream">{email.admin_name}</span>
                                                        </span>
                                                        {email.cc_emails && (
                                                            <span className="text-brand-cream/60">
                                                                CC: <span className="text-brand-cream">{email.cc_emails}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {showEmailHistory && previousEmails.length === 0 && (
                                    <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-8 text-center">
                                        <p className="text-sm text-brand-cream/60">
                                            No previous emails sent to this user.
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleSendEmail} className="space-y-4">
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-brand-cream mb-2">
                                            Subject <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            value={emailSubject}
                                            onChange={(e) => setEmailSubject(e.target.value)}
                                            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:ring-2 focus:ring-brand"
                                            placeholder="Enter email subject"
                                            required
                                            maxLength={255}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-brand-cream mb-2">
                                            Message <span className="text-red-400">*</span>
                                        </label>
                                        <textarea
                                            id="message"
                                            value={emailMessage}
                                            onChange={(e) => setEmailMessage(e.target.value)}
                                            rows={6}
                                            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:ring-2 focus:ring-brand resize-y"
                                            placeholder="Enter your message"
                                            required
                                            maxLength={5000}
                                        />
                                        <div className="mt-1 text-xs text-brand-cream/60">
                                            {emailMessage.length} / 5000 characters
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="cc_emails" className="block text-sm font-medium text-brand-cream mb-2">
                                            CC Recipients (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            id="cc_emails"
                                            value={ccEmails}
                                            onChange={(e) => setCcEmails(e.target.value)}
                                            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:ring-2 focus:ring-brand"
                                            placeholder="email1@example.com, email2@example.com"
                                        />
                                        <div className="mt-1 text-xs text-brand-cream/60">
                                            Separate multiple email addresses with commas
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-2">
                                        <Button
                                            type="submit"
                                            disabled={loading || !emailSubject || !emailMessage}
                                            className="inline-flex items-center gap-2 rounded-xl bg-brand text-brand-brown hover:bg-brand/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send className="h-4 w-4" />
                                            {loading ? 'Sending...' : 'Send Email'}
                                        </Button>
                                        <div className="text-xs text-brand-cream/60">
                                            Primary recipient: <span className="font-medium text-brand-cream">{user.email}</span>
                                        </div>
                                    </div>
                                </form>
                            </div>
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
