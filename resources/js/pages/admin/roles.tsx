import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { ArrowLeft, Shield, Users, Key, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

type Permission = {
    id: number;
    name: string;
    display_name: string;
    group: string;
};

type Role = {
    id: number;
    name: string;
    display_name: string;
    description: string;
    users_count: number;
    permissions_count: number;
    permissions: Permission[];
};

type FlashMessages = {
    success?: string;
    error?: string;
};

export default function Roles({ roles, flash }: { roles: Role[]; flash?: FlashMessages }) {
    const [showCreateDialog, setShowCreateDialog] = React.useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const [roleToDelete, setRoleToDelete] = React.useState<Role | null>(null);
    const [showNotification, setShowNotification] = React.useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        display_name: '',
        description: '',
    });

    React.useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowNotification(true);
            const timer = setTimeout(() => setShowNotification(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handleCreateRole = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/roles', {
            preserveScroll: true,
            onSuccess: () => {
                setShowCreateDialog(false);
                reset();
            },
        });
    };

    const handleDeleteRole = () => {
        if (!roleToDelete) return;
        router.delete(`/admin/roles/${roleToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteDialog(false);
                setRoleToDelete(null);
            },
        });
    };
    return (
        <>
            <Head title="Roles & Permissions - Admin" />
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

                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="h-6 w-6 text-brand" />
                                <h1 className="text-2xl font-semibold text-brand-cream">
                                    Roles & Permissions
                                </h1>
                            </div>
                            <p className="text-sm text-brand-cream/70">
                                Manage staff roles and their permissions. Super Admins (is_admin=true) have all permissions automatically.
                            </p>
                        </div>
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                            <DialogTrigger asChild>
                                <Button className="rounded-xl bg-brand text-brand-brown hover:bg-brand/80">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Role
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#1a1714] border-brand-cream/10">
                                <DialogHeader>
                                    <DialogTitle className="text-brand-cream">Create New Role</DialogTitle>
                                    <DialogDescription className="text-brand-cream/70">
                                        Create a new staff role. You can assign permissions after creation.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateRole}>
                                    <div className="space-y-4 py-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-brand-cream/70 mb-2">
                                                Role Name (lowercase with underscores) <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="w-full rounded-xl bg-brand-cream/5 border border-brand-cream/10 px-4 py-2 text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:ring-2 focus:ring-brand"
                                                placeholder="e.g., customer_support"
                                                pattern="[a-z_]+"
                                                required
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="display_name" className="block text-sm font-medium text-brand-cream/70 mb-2">
                                                Display Name <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="display_name"
                                                value={data.display_name}
                                                onChange={(e) => setData('display_name', e.target.value)}
                                                className="w-full rounded-xl bg-brand-cream/5 border border-brand-cream/10 px-4 py-2 text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:ring-2 focus:ring-brand"
                                                placeholder="e.g., Customer Support"
                                                required
                                            />
                                            {errors.display_name && (
                                                <p className="mt-1 text-xs text-red-400">{errors.display_name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-brand-cream/70 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                rows={3}
                                                className="w-full rounded-xl bg-brand-cream/5 border border-brand-cream/10 px-4 py-2 text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                                                placeholder="Describe this role's responsibilities..."
                                            />
                                            {errors.description && (
                                                <p className="mt-1 text-xs text-red-400">{errors.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowCreateDialog(false);
                                                reset();
                                            }}
                                            className="rounded-xl border-brand-cream/10 text-brand-cream hover:bg-brand-cream/10"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-xl bg-brand text-brand-brown hover:bg-brand/80 disabled:opacity-50"
                                        >
                                            {processing ? 'Creating...' : 'Create Role'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {roles.map((role) => (
                            <div
                                key={role.id}
                                className="rounded-2xl border border-brand-cream/10 bg-brand-cream/5 p-6 hover:bg-brand-cream/10 transition-all relative group"
                            >
                                <Link
                                    href={`/admin/roles/${role.id}`}
                                    className="block"
                                >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-brand-cream mb-1">
                                            {role.display_name}
                                        </h3>
                                        <p className="text-xs text-brand-cream/60 font-mono">
                                            {role.name}
                                        </p>
                                    </div>
                                    <Shield className="h-5 w-5 text-brand" />
                                </div>

                                <p className="text-sm text-brand-cream/70 mb-4 min-h-[40px]">
                                    {role.description}
                                </p>

                                <div className="flex items-center gap-4 pt-4 border-t border-brand-cream/10">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-brand-cream/60" />
                                        <span className="text-sm text-brand-cream">
                                            {role.users_count} {role.users_count === 1 ? 'user' : 'users'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Key className="h-4 w-4 text-brand-cream/60" />
                                        <span className="text-sm text-brand-cream">
                                            {role.permissions_count} {role.permissions_count === 1 ? 'permission' : 'permissions'}
                                        </span>
                                    </div>
                                </div>

                                {role.permissions_count > 0 && (
                                    <div className="mt-4 pt-4 border-t border-brand-cream/10">
                                        <p className="text-xs text-brand-cream/60 mb-2">Key Permissions:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {role.permissions.slice(0, 3).map((permission) => (
                                                <span
                                                    key={permission.id}
                                                    className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand border border-brand/20"
                                                >
                                                    {permission.display_name}
                                                </span>
                                            ))}
                                            {role.permissions.length > 3 && (
                                                <span className="inline-flex items-center rounded-full bg-brand-cream/10 px-2 py-0.5 text-[10px] font-medium text-brand-cream/60">
                                                    +{role.permissions.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                                </Link>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setRoleToDelete(role);
                                        setShowDeleteDialog(true);
                                    }}
                                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                    title="Delete role"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
                        <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-semibold text-brand-cream mb-1">
                                    About Super Admins
                                </h3>
                                <p className="text-sm text-brand-cream/70">
                                    Users with <code className="px-1.5 py-0.5 rounded bg-brand-cream/10 text-brand-cream font-mono text-xs">is_admin=true</code> are Super Administrators.
                                    They have unrestricted access to all features and permissions, including the ability to manage roles and permissions.
                                    Super Admin status can only be changed through direct database access for security.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Delete Role Dialog */}
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogContent className="bg-[#1a1714] border-brand-cream/10">
                            <DialogHeader>
                                <DialogTitle className="text-brand-cream">Delete Role</DialogTitle>
                                <DialogDescription className="text-brand-cream/70">
                                    Are you sure you want to delete the role <span className="font-semibold text-brand-cream">"{roleToDelete?.display_name}"</span>?
                                    This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            {roleToDelete && roleToDelete.users_count > 0 && (
                                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                                    <p className="text-sm text-red-400">
                                        <strong>Warning:</strong> This role has {roleToDelete.users_count} user(s) assigned. You must reassign these users before deleting this role.
                                    </p>
                                </div>
                            )}
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowDeleteDialog(false);
                                        setRoleToDelete(null);
                                    }}
                                    className="rounded-xl border-brand-cream/10 text-brand-cream hover:bg-brand-cream/10"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDeleteRole}
                                    disabled={roleToDelete ? roleToDelete.users_count > 0 : false}
                                    className="rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                                >
                                    Delete Role
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </section>
            </div>
        </>
    );
}
