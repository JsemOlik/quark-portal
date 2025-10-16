import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { ArrowLeft, Mail, Calendar, CreditCard, Server as ServerIcon, MapPin, ExternalLink, Send, History, FileText, ScrollText, KeyRound, Trash2, AlertTriangle, PauseCircle, PlayCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type User = {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    role_id: number | null;
    role_name: string | null;
    stripe_id: string | null;
    billing_name: string | null;
    billing_address: string | null;
    billing_city: string | null;
    billing_country: string | null;
    created_at: string;
};

type Role = {
    id: number;
    name: string;
    display_name: string;
    description: string;
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
    pterodactyl_identifier: string | null;
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
    pterodactylUrl,
    availableRoles,
    permissions,
    csrf,
    flash,
}: {
    user: User;
    servers: Server[];
    invoices: Invoice[];
    previousEmails: PreviousEmail[];
    pterodactylUrl: string;
    availableRoles: Role[];
    permissions: string[];
    csrf?: string;
    flash?: FlashMessages;
}) {
    const [emailSubject, setEmailSubject] = React.useState('');
    const [emailMessage, setEmailMessage] = React.useState('');
    const [ccEmails, setCcEmails] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [showNotification, setShowNotification] = React.useState(false);
    const [showEmailHistory, setShowEmailHistory] = React.useState(false);
    const [newEmail, setNewEmail] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const [showPasswordResetDialog, setShowPasswordResetDialog] = React.useState(false);
    const [showSuspendDialog, setShowSuspendDialog] = React.useState(false);
    const [showUnsuspendDialog, setShowUnsuspendDialog] = React.useState(false);
    const [showCancelDialog, setShowCancelDialog] = React.useState(false);
    const [cancelServerId, setCancelServerId] = React.useState<number | null>(null);
    const [cancelType, setCancelType] = React.useState<'immediate' | 'period_end'>('period_end');

    // Helper to check permissions
    const hasPermission = (permission: string) => {
        return permissions.includes('*') || permissions.includes(permission);
    };

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

    function handleRoleChange(value: string) {
        const isAdmin = value === 'super_admin';
        const roleId = value === 'super_admin' || value === 'no_role' ? null : parseInt(value);

        router.post(
            `/admin/users/${user.id}/update-role`,
            {
                is_admin: isAdmin,
                role_id: roleId,
            },
            {
                preserveScroll: true,
            }
        );
    }

    function handleSendPasswordReset() {
        router.post(
            `/admin/users/${user.id}/send-password-reset`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowPasswordResetDialog(false);
                },
            }
        );
    }

    function handleUpdateEmail(e: React.FormEvent) {
        e.preventDefault();
        if (!newEmail) return;

        router.post(
            `/admin/users/${user.id}/update-email`,
            {
                email: newEmail,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewEmail('');
                },
                onError: (errors) => {
                    console.error('Email update error:', errors);
                }
            }
        );
    }

    function handleUpdatePassword(e: React.FormEvent) {
        e.preventDefault();
        if (!newPassword) return;

        router.post(
            `/admin/users/${user.id}/update-password`,
            {
                password: newPassword,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewPassword('');
                },
            }
        );
    }

    function handleDeleteAccount() {
        router.delete(`/admin/users/${user.id}/delete-account`, {
            preserveScroll: false,
            onSuccess: () => {
                setShowDeleteDialog(false);
            },
            onError: (errors) => {
                console.error('Delete account error:', errors);
                setShowDeleteDialog(false);
            }
        });
    }

    function handleSuspendServers() {
        router.post(
            `/admin/users/${user.id}/suspend-servers`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowSuspendDialog(false);
                },
            }
        );
    }

    function handleUnsuspendServers() {
        router.post(
            `/admin/users/${user.id}/unsuspend-servers`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowUnsuspendDialog(false);
                },
            }
        );
    }

    function handleCancelService() {
        if (!cancelServerId) return;

        router.post(
            `/admin/users/${user.id}/servers/${cancelServerId}/cancel`,
            {
                cancel_type: cancelType,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowCancelDialog(false);
                    setCancelServerId(null);
                    setCancelType('period_end');
                },
            }
        );
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
                            {user.is_admin ? (
                                <span className="inline-flex items-center rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400 border border-purple-500/20">
                                    Super Admin
                                </span>
                            ) : user.role_name ? (
                                <span className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand border border-brand/20">
                                    {user.role_name}
                                </span>
                            ) : null}
                        </div>
                        <p className="text-sm text-brand-cream/70">
                            User ID: {user.id}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - User Info & Quick Stats */}
                        <div className="space-y-6">
                            {/* User Information */}
                            <div className="rounded-2xl border border-brand-cream/10 bg-brand-cream/5 p-5">
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
                                        <div className="flex-1">
                                            <div className="text-xs text-brand-cream/60 mb-1">
                                                Stripe Customer ID
                                            </div>
                                            <div className="text-sm text-brand-cream font-mono break-all mb-2">
                                                {user.stripe_id || 'N/A'}
                                            </div>
                                            {user.stripe_id && (
                                                <a
                                                    href={`https://dashboard.stripe.com/customers/${user.stripe_id}`}
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

                                    {hasPermission('manage_user_roles') && (
                                        <div className="pt-3 border-t border-brand-cream/10">
                                            <label htmlFor="role" className="block text-xs text-brand-cream/60 mb-2">
                                                User Role & Permissions
                                            </label>
                                            <Select
                                                value={user.is_admin ? 'super_admin' : (user.role_id ? user.role_id.toString() : 'no_role')}
                                                onValueChange={handleRoleChange}
                                            >
                                                <SelectTrigger className="w-full rounded-xl bg-brand-cream/5 border-brand-cream/10 text-brand-cream">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1a1714] border-brand-cream/10">
                                                    <SelectItem value="no_role" className="text-brand-cream/60 hover:bg-brand-cream/10">
                                                        No Role (Customer)
                                                    </SelectItem>
                                                    {availableRoles.map((role) => (
                                                        <SelectItem
                                                            key={role.id}
                                                            value={role.id.toString()}
                                                            className="text-brand-cream hover:bg-brand-cream/10"
                                                        >
                                                            {role.display_name}
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem value="super_admin" className="text-purple-400 hover:bg-purple-500/10">
                                                        Super Admin (Full Access)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {user.role_name && !user.is_admin && (
                                                <p className="mt-2 text-xs text-brand-cream/60">
                                                    Current role: <span className="font-medium text-brand">{user.role_name}</span>
                                                </p>
                                            )}
                                            {user.is_admin && (
                                                <p className="mt-2 text-xs text-purple-400">
                                                    Super Admins have unrestricted access to all features
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Billing Details */}
                            {(user.billing_name || user.billing_address || user.billing_city || user.billing_country) && (
                                <div className="rounded-2xl border border-brand-cream/10 bg-brand-cream/5 p-5">
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
                            <div className="rounded-2xl border border-brand-cream/10 bg-brand-cream/5 p-5">
                                <h2 className="mb-4 text-lg font-semibold text-brand-cream">
                                    Quick Stats
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-brand-cream/5">
                                        <span className="text-sm text-brand-cream/60">Total Services</span>
                                        <span className="text-sm font-medium text-brand-cream">
                                            {servers.length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-brand-cream/5">
                                        <span className="text-sm text-brand-cream/60">Active Services</span>
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

                            {/* Account Actions - Only show if user has ANY of these permissions */}
                            {(hasPermission('edit_users') || hasPermission('delete_users') || hasPermission('suspend_servers') || hasPermission('unsuspend_servers')) && (
                            <div className="rounded-2xl border border-brand-cream/10 bg-brand-cream/5 p-5">
                                <h2 className="mb-4 text-lg font-semibold text-brand-cream">
                                    Account Actions
                                </h2>
                                <div className="space-y-3">
                                    {/* Change Email */}
                                    {hasPermission('edit_users') && (
                                        <form onSubmit={handleUpdateEmail} className="space-y-2">
                                            <label htmlFor="new-email" className="block text-xs text-brand-cream/60">
                                                Change Email Address
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="email"
                                                    id="new-email"
                                                    value={newEmail}
                                                    onChange={(e) => setNewEmail(e.target.value)}
                                                    className="flex-1 rounded-xl bg-brand-cream/5 border border-brand-cream/10 px-3 py-2 text-sm text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:ring-2 focus:ring-brand"
                                                    placeholder="new@email.com"
                                                />
                                                <Button
                                                    type="submit"
                                                    disabled={!newEmail}
                                                    className="rounded-xl bg-brand text-brand-brown hover:bg-brand/80 disabled:opacity-50"
                                                >
                                                    Update
                                                </Button>
                                            </div>
                                        </form>
                                    )}

                                    {/* Change Password */}
                                    {hasPermission('edit_users') && (
                                        <form onSubmit={handleUpdatePassword} className="space-y-2">
                                            <label htmlFor="new-password" className="block text-xs text-brand-cream/60">
                                                Set New Password
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="password"
                                                    id="new-password"
                                                    name="new-password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="flex-1 rounded-xl bg-brand-cream/5 border border-brand-cream/10 px-3 py-2 text-sm text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:ring-2 focus:ring-brand"
                                                    placeholder="New password (min 8 characters)"
                                                    minLength={8}
                                                    autoComplete="new-password"
                                                />
                                                <Button
                                                    type="submit"
                                                    disabled={!newPassword || newPassword.length < 8}
                                                    className="rounded-xl bg-brand text-brand-brown hover:bg-brand/80 disabled:opacity-50"
                                                >
                                                    Update
                                                </Button>
                                            </div>
                                        </form>
                                    )}

                                    {/* Password Reset */}
                                    {hasPermission('edit_users') && (
                                        <Dialog open={showPasswordResetDialog} onOpenChange={setShowPasswordResetDialog}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    className="w-full justify-start gap-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20"
                                                    variant="ghost"
                                                >
                                                    <KeyRound className="h-4 w-4" />
                                                    Send Password Reset
                                                </Button>
                                            </DialogTrigger>
                                        <DialogContent className="bg-[#1a1714] border-brand-cream/10">
                                            <DialogHeader>
                                                <DialogTitle className="text-brand-cream">
                                                    Send Password Reset Email
                                                </DialogTitle>
                                                <DialogDescription className="text-brand-cream/70">
                                                    Send a password reset link to <span className="font-semibold text-brand-cream">{user.email}</span>?
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowPasswordResetDialog(false)}
                                                    className="rounded-xl border-brand-cream/10 text-brand-cream hover:bg-brand-cream/10"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleSendPasswordReset}
                                                    className="rounded-xl bg-blue-500 text-white hover:bg-blue-600"
                                                >
                                                    Send Reset Email
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                        </Dialog>
                                    )}

                                    {/* Suspend/Unsuspend Buttons */}
                                    {(hasPermission('suspend_servers') || hasPermission('unsuspend_servers')) && (
                                    <div className="flex gap-2">
                                        {/* Suspend Dialog */}
                                        {hasPermission('suspend_servers') && (
                                        <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    className="flex-1 justify-center gap-2 rounded-xl bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20"
                                                    variant="ghost"
                                                    disabled={servers.filter(s => s.status === 'active').length === 0}
                                                >
                                                    <PauseCircle className="h-4 w-4" />
                                                    Suspend
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-[#1a1714] border-brand-cream/10">
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center gap-2 text-brand-cream">
                                                        <PauseCircle className="h-5 w-5 text-yellow-400" />
                                                        Suspend All Servers
                                                    </DialogTitle>
                                                    <DialogDescription className="text-brand-cream/70">
                                                        Are you sure you want to suspend all active servers for <span className="font-semibold text-brand-cream">{user.name}</span>?
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 my-4">
                                                    <p className="text-sm text-yellow-400">
                                                        <strong>Note:</strong> All active servers will be suspended both in the portal and in the Pterodactyl panel. This action will affect {servers.filter(s => s.status === 'active').length} server(s).
                                                    </p>
                                                </div>
                                                <DialogFooter>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setShowSuspendDialog(false)}
                                                        className="rounded-xl border-brand-cream/10 text-brand-cream hover:bg-brand-cream/10"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={handleSuspendServers}
                                                        className="rounded-xl bg-yellow-500 text-white hover:bg-yellow-600"
                                                    >
                                                        Suspend Servers
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                        )}

                                        {/* Unsuspend Dialog */}
                                        {hasPermission('unsuspend_servers') && (
                                        <Dialog open={showUnsuspendDialog} onOpenChange={setShowUnsuspendDialog}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    className="flex-1 justify-center gap-2 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
                                                    variant="ghost"
                                                    disabled={servers.filter(s => s.status === 'suspended').length === 0}
                                                >
                                                    <PlayCircle className="h-4 w-4" />
                                                    Unsuspend
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-[#1a1714] border-brand-cream/10">
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center gap-2 text-brand-cream">
                                                        <PlayCircle className="h-5 w-5 text-green-400" />
                                                        Unsuspend All Servers
                                                    </DialogTitle>
                                                    <DialogDescription className="text-brand-cream/70">
                                                        Are you sure you want to unsuspend all suspended servers for <span className="font-semibold text-brand-cream">{user.name}</span>?
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 my-4">
                                                    <p className="text-sm text-green-400">
                                                        <strong>Note:</strong> All suspended servers will be reactivated both in the portal and in the Pterodactyl panel. This action will affect {servers.filter(s => s.status === 'suspended').length} server(s).
                                                    </p>
                                                </div>
                                                <DialogFooter>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setShowUnsuspendDialog(false)}
                                                        className="rounded-xl border-brand-cream/10 text-brand-cream hover:bg-brand-cream/10"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={handleUnsuspendServers}
                                                        className="rounded-xl bg-green-500 text-white hover:bg-green-600"
                                                    >
                                                        Unsuspend Servers
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                        )}
                                    </div>
                                    )}

                                    {/* Delete Account */}
                                    {hasPermission('delete_users') && (
                                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                        <DialogTrigger asChild>
                                            <Button
                                                className="w-full justify-start gap-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                                variant="ghost"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete Account
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-[#1a1714] border-brand-cream/10">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2 text-brand-cream">
                                                    <AlertTriangle className="h-5 w-5 text-red-400" />
                                                    Delete User Account
                                                </DialogTitle>
                                                <DialogDescription className="text-brand-cream/70">
                                                    Are you sure you want to delete <span className="font-semibold text-brand-cream">{user.name}'s</span> account? This action cannot be undone.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 my-4">
                                                <p className="text-sm text-red-400">
                                                    <strong>Warning:</strong> All user data will be permanently deleted. Make sure all subscriptions are cancelled first.
                                                </p>
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowDeleteDialog(false)}
                                                    className="rounded-xl border-brand-cream/10 text-brand-cream hover:bg-brand-cream/10"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleDeleteAccount}
                                                    className="rounded-xl bg-red-500 text-white hover:bg-red-600"
                                                >
                                                    Delete Account
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                    )}
                                </div>
                            </div>
                            )}
                        </div>

                        {/* Right Column - Servers, Subscriptions, Invoices */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Servers */}
                            <div className="rounded-2xl border border-brand-cream/10 bg-brand-cream/5 p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <ServerIcon className="h-5 w-5 text-brand" />
                                    <h2 className="text-lg font-semibold text-brand-cream">
                                        Services ({servers.length})
                                    </h2>
                                </div>

                                {servers.length === 0 ? (
                                    <div className="rounded-xl border border-brand-cream/10 bg-brand-cream/5 p-8 text-center">
                                        <p className="text-sm text-brand-cream/60">
                                            No servers found for this user.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {servers.map((server) => (
                                            <div
                                                key={server.id}
                                                className="rounded-xl border border-brand-cream/10 bg-brand-cream/5 p-4 hover:bg-brand-cream/10 transition-colors"
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

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Link
                                                        href={`/dashboard/servers/${server.id}`}
                                                        className="inline-flex items-center rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/20 transition-colors border border-brand/20"
                                                    >
                                                        View Server Details
                                                    </Link>
                                                    {server.pterodactyl_identifier && (
                                                        <a
                                                            href={`${pterodactylUrl}/server/${server.pterodactyl_identifier}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                            Open in Panel
                                                        </a>
                                                    )}
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
                                                    {hasPermission('cancel_servers') && server.subscription_id && server.status !== 'cancelled' && (
                                                        <Button
                                                            onClick={() => {
                                                                setCancelServerId(server.id);
                                                                setShowCancelDialog(true);
                                                            }}
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20"
                                                            variant="ghost"
                                                        >
                                                            <XCircle className="h-3 w-3" />
                                                            Cancel Service
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Cancel Service Dialog */}
                            <Dialog open={showCancelDialog} onOpenChange={(open) => {
                                setShowCancelDialog(open);
                                if (!open) {
                                    setCancelServerId(null);
                                    setCancelType('period_end');
                                }
                            }}>
                                <DialogContent className="bg-[#1a1714] border-brand-cream/10">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2 text-brand-cream">
                                            <XCircle className="h-5 w-5 text-red-400" />
                                            Cancel Service
                                        </DialogTitle>
                                        <DialogDescription className="text-brand-cream/70">
                                            Choose when to cancel this service for <span className="font-semibold text-brand-cream">{user.name}</span>.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="py-4">
                                        <RadioGroup value={cancelType} onValueChange={(value: 'immediate' | 'period_end') => setCancelType(value)}>
                                            <div className="space-y-3">
                                                <div className="flex items-start space-x-3 rounded-lg border border-brand-cream/10 bg-brand-cream/5 p-4 cursor-pointer hover:bg-brand-cream/10 transition-colors">
                                                    <RadioGroupItem value="period_end" id="period_end" className="mt-0.5" />
                                                    <Label htmlFor="period_end" className="flex-1 cursor-pointer">
                                                        <div className="font-medium text-brand-cream mb-1">Cancel at End of Billing Period</div>
                                                        <div className="text-xs text-brand-cream/60">
                                                            Service will remain active until the current billing period ends. The subscription will be cancelled and the server will be suspended automatically at that time.
                                                        </div>
                                                    </Label>
                                                </div>

                                                <div className="flex items-start space-x-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 cursor-pointer hover:bg-red-500/10 transition-colors">
                                                    <RadioGroupItem value="immediate" id="immediate" className="mt-0.5" />
                                                    <Label htmlFor="immediate" className="flex-1 cursor-pointer">
                                                        <div className="font-medium text-brand-cream mb-1">Cancel Immediately</div>
                                                        <div className="text-xs text-brand-cream/60">
                                                            The subscription will be cancelled and the server will be suspended right now. The user will lose access immediately.
                                                        </div>
                                                    </Label>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowCancelDialog(false);
                                                setCancelServerId(null);
                                                setCancelType('period_end');
                                            }}
                                            className="rounded-xl border-brand-cream/10 text-brand-cream hover:bg-brand-cream/10"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleCancelService}
                                            className="rounded-xl bg-red-500 text-white hover:bg-red-600"
                                        >
                                            Confirm Cancellation
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* Invoices */}
                            <div className="rounded-2xl border border-brand-cream/10 bg-brand-cream/5 p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <ScrollText className="h-5 w-5 text-brand" />
                                    <h2 className="text-lg font-semibold text-brand-cream">
                                        Recent Invoices ({invoices.length})
                                    </h2>
                                </div>


                                {invoices.length === 0 ? (
                                    <div className="rounded-xl border border-brand-cream/10 bg-brand-cream/5 p-8 text-center">
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
                                                className="block rounded-xl border border-brand-cream/10 bg-brand-cream/5 p-3 hover:bg-brand-cream/10 transition-colors"
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

                            {/* Send Email - Only show if user has send_emails permission */}
                            {hasPermission('send_emails') && (
                            <div className="rounded-2xl border border-brand-cream/10 bg-brand-cream/5 p-5">
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
                                                    className="inline-flex items-center gap-2 rounded-xl bg-brand-cream/5 text-brand-cream hover:bg-brand-cream/10 border border-brand-cream/10"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    <span className="hidden sm:inline">Select Template</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56 bg-[#1a1714] border-brand-cream/10">
                                                <DropdownMenuLabel className="text-brand-cream">Email Templates</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {EMAIL_TEMPLATES.map((template) => (
                                                    <DropdownMenuItem
                                                        key={template.name}
                                                        onClick={() => handleTemplateSelect(template)}
                                                        className="text-brand-cream hover:bg-brand-cream/10 cursor-pointer"
                                                    >
                                                        {template.name}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button
                                            type="button"
                                            onClick={() => setShowEmailHistory(!showEmailHistory)}
                                            className="inline-flex items-center gap-2 rounded-xl bg-brand-cream/5 text-brand-cream hover:bg-brand-cream/10 border border-brand-cream/10"
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
                                    <div className="mb-6 rounded-xl border border-brand-cream/10 bg-brand-cream/5 p-4">
                                        <h3 className="mb-3 text-sm font-semibold text-brand-cream">
                                            Email History
                                        </h3>
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {previousEmails.map((email) => (
                                                <div
                                                    key={email.id}
                                                    className="rounded-lg border border-brand-cream/10 bg-brand-cream/5 p-3"
                                                >
                                                    <div className="mb-2 flex items-start justify-between">
                                                        <div className="font-medium text-brand-cream text-sm">
                                                            {email.subject}
                                                        </div>
                                                        <div className="text-xs text-brand-cream/60">
                                                            {email.sent_at}
                                                        </div>
                                                    </div>
                                                    <div className="mb-2 text-xs text-brand-cream/70 brand-creamspace-pre-wrap">
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
                                    <div className="mb-6 rounded-xl border border-brand-cream/10 bg-brand-cream/5 p-8 text-center">
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
                                            className="w-full rounded-xl bg-brand-cream/5 border border-brand-cream/10 px-4 py-2 text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:ring-2 focus:ring-brand"
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
                                            className="w-full rounded-xl bg-brand-cream/5 border border-brand-cream/10 px-4 py-2 text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:ring-2 focus:ring-brand resize-y"
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
                                            className="w-full rounded-xl bg-brand-cream/5 border border-brand-cream/10 px-4 py-2 text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:ring-2 focus:ring-brand"
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
            return 'bg-brand-cream/10 border-brand-cream/20 text-brand-cream/80';
    }
}
