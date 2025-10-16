import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { ArrowLeft, Shield, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

type Permission = {
    id: number;
    name: string;
    display_name: string;
    description: string;
};

type PermissionGroup = {
    group: string;
    permissions: Permission[];
};

type Role = {
    id: number;
    name: string;
    display_name: string;
    description: string;
    permission_ids: number[];
};

type FlashMessages = {
    success?: string;
    error?: string;
};

export default function RoleEdit({
    role,
    permissionGroups,
    flash,
}: {
    role: Role;
    permissionGroups: PermissionGroup[];
    flash?: FlashMessages;
}) {
    const [selectedPermissions, setSelectedPermissions] = React.useState<number[]>(role.permission_ids);
    const [showNotification, setShowNotification] = React.useState(false);
    const [saving, setSaving] = React.useState(false);

    const { data, setData, put, processing, errors } = useForm({
        display_name: role.display_name,
        description: role.description || '',
    });

    React.useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowNotification(true);
            const timer = setTimeout(() => setShowNotification(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const togglePermission = (permissionId: number) => {
        setSelectedPermissions((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const toggleGroup = (group: PermissionGroup) => {
        const groupPermissionIds = group.permissions.map((p) => p.id);
        const allSelected = groupPermissionIds.every((id) => selectedPermissions.includes(id));

        if (allSelected) {
            // Deselect all in group
            setSelectedPermissions((prev) => prev.filter((id) => !groupPermissionIds.includes(id)));
        } else {
            // Select all in group
            setSelectedPermissions((prev) => [...new Set([...prev, ...groupPermissionIds])]);
        }
    };

    const handleSavePermissions = () => {
        setSaving(true);
        router.post(
            `/admin/roles/${role.id}/permissions`,
            {
                permission_ids: selectedPermissions,
            },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
            }
        );
    };

    const handleUpdateRole = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/roles/${role.id}`, {
            preserveScroll: true,
        });
    };

    const getGroupColor = (groupName: string) => {
        const colors: Record<string, string> = {
            users: 'blue',
            servers: 'green',
            billing: 'purple',
            tickets: 'yellow',
            communication: 'pink',
            system: 'red',
        };
        return colors[groupName] || 'gray';
    };

    return (
        <>
            <Head title={`Edit ${role.display_name} - Admin`} />
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
                        href="/admin/roles"
                        className="mb-4 inline-flex items-center gap-2 text-sm text-brand-cream/70 hover:text-brand transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Roles
                    </Link>

                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="h-6 w-6 text-brand" />
                            <h1 className="text-2xl font-semibold text-brand-cream">
                                Edit {role.display_name}
                            </h1>
                        </div>
                        <p className="text-sm text-brand-cream/70 font-mono">
                            Role: {role.name}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Role Details */}
                        <div className="lg:col-span-1">
                            <div className="rounded-2xl border border-brand-cream/10 bg-brand-cream/5 p-5 sticky top-4">
                                <h2 className="mb-4 text-lg font-semibold text-brand-cream">
                                    Role Details
                                </h2>
                                <form onSubmit={handleUpdateRole} className="space-y-4">
                                    <div>
                                        <label htmlFor="display_name" className="block text-sm font-medium text-brand-cream/70 mb-2">
                                            Display Name
                                        </label>
                                        <input
                                            type="text"
                                            id="display_name"
                                            value={data.display_name}
                                            onChange={(e) => setData('display_name', e.target.value)}
                                            className="w-full rounded-xl bg-brand-cream/5 border border-brand-cream/10 px-4 py-2 text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:ring-2 focus:ring-brand"
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
                                            rows={4}
                                            className="w-full rounded-xl bg-brand-cream/5 border border-brand-cream/10 px-4 py-2 text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-xs text-red-400">{errors.description}</p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full rounded-xl bg-brand text-brand-brown hover:bg-brand/80 disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? 'Saving...' : 'Save Details'}
                                    </Button>
                                </form>

                                <div className="mt-6 pt-6 border-t border-brand-cream/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-brand-cream/70">Selected Permissions</span>
                                        <span className="text-sm font-semibold text-brand">
                                            {selectedPermissions.length}
                                        </span>
                                    </div>
                                    <Button
                                        onClick={handleSavePermissions}
                                        disabled={saving}
                                        className="w-full rounded-xl bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        {saving ? 'Saving...' : 'Save Permissions'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Permissions Grid */}
                        <div className="lg:col-span-2">
                            <div className="rounded-2xl border border-brand-cream/10 bg-brand-cream/5 p-5">
                                <h2 className="mb-4 text-lg font-semibold text-brand-cream">
                                    Permissions
                                </h2>

                                <div className="space-y-6">
                                    {permissionGroups.map((group) => {
                                        const color = getGroupColor(group.group);
                                        const groupPermissionIds = group.permissions.map((p) => p.id);
                                        const allSelected = groupPermissionIds.every((id) =>
                                            selectedPermissions.includes(id)
                                        );
                                        const someSelected = groupPermissionIds.some((id) =>
                                            selectedPermissions.includes(id)
                                        );

                                        return (
                                            <div
                                                key={group.group}
                                                className="rounded-xl border border-brand-cream/10 bg-brand-cream/5 p-4"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="text-base font-semibold text-brand-cream capitalize">
                                                        {group.group}
                                                    </h3>
                                                    <button
                                                        onClick={() => toggleGroup(group)}
                                                        className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                                                            allSelected
                                                                ? `bg-${color}-500/20 text-${color}-400 hover:bg-${color}-500/30`
                                                                : someSelected
                                                                ? `bg-${color}-500/10 text-${color}-400/70 hover:bg-${color}-500/20`
                                                                : 'bg-brand-cream/10 text-brand-cream/60 hover:bg-brand-cream/20'
                                                        }`}
                                                    >
                                                        {allSelected ? 'Deselect All' : 'Select All'}
                                                    </button>
                                                </div>

                                                <div className="space-y-2">
                                                    {group.permissions.map((permission) => (
                                                        <label
                                                            key={permission.id}
                                                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-brand-cream/5 cursor-pointer transition-colors"
                                                        >
                                                            <Checkbox
                                                                checked={selectedPermissions.includes(permission.id)}
                                                                onCheckedChange={() => togglePermission(permission.id)}
                                                                className="mt-0.5"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="text-sm font-medium text-brand-cream">
                                                                    {permission.display_name}
                                                                </div>
                                                                <div className="text-xs text-brand-cream/60 mt-0.5">
                                                                    {permission.description}
                                                                </div>
                                                                <div className="text-[10px] text-brand-cream/50 font-mono mt-1">
                                                                    {permission.name}
                                                                </div>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
