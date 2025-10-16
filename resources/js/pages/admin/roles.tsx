import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { ArrowLeft, Shield, Users, Key } from 'lucide-react';

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

export default function Roles({ roles }: { roles: Role[] }) {
    return (
        <>
            <Head title="Roles & Permissions - Admin" />
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {roles.map((role) => (
                            <Link
                                key={role.id}
                                href={`/admin/roles/${role.id}`}
                                className="rounded-2xl border border-brand-cream/10 bg-brand-cream/5 p-6 hover:bg-brand-cream/10 transition-all hover:border-brand/20"
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
                </section>
            </div>
        </>
    );
}
