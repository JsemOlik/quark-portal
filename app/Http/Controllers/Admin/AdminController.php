<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Server;
use App\Models\AdminEmail as AdminEmailModel;
use App\Mail\AdminEmail;
use App\Services\PterodactylService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Stripe\StripeClient;

class AdminController extends Controller
{
    public function index()
    {
        $users = User::with('role:id,display_name')
            ->withCount('servers')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_admin' => $user->is_admin,
                    'role_name' => $user->role ? $user->role->display_name : null,
                    'servers_count' => $user->servers_count,
                    'created_at' => $user->created_at->format('Y-m-d'),
                ];
            });

        $stats = [
            'total_users' => User::count(),
            'total_servers' => Server::count(),
            'active_servers' => Server::where('status', 'active')->count(),
            'cancelled_servers' => Server::where('status', 'cancelled')->count(),
        ];

        // Get current admin's permissions
        $currentAdmin = auth()->user();
        $permissions = [];
        if ($currentAdmin->isSuperAdmin()) {
            // Super admins have all permissions
            $permissions = ['*']; // Special marker for "all permissions"
        } elseif ($currentAdmin->role) {
            // Get user's role permissions
            $permissions = $currentAdmin->role->permissions->pluck('name')->toArray();
        }

        return Inertia::render('admin/dashboard', [
            'users' => $users,
            'stats' => $stats,
            'permissions' => $permissions,
        ]);
    }

    public function servers()
    {
        $servers = Server::with(['user:id,name,email', 'plan:id,name,key'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($server) {
                return [
                    'id' => $server->id,
                    'server_name' => $server->server_name,
                    'game' => $server->game,
                    'status' => $server->status,
                    'billing_cycle' => $server->billing_cycle,
                    'user_name' => $server->user->name ?? 'N/A',
                    'user_email' => $server->user->email ?? 'N/A',
                    'user_id' => $server->user_id,
                    'plan_name' => $server->plan ? ucfirst($server->plan->key) : 'N/A',
                    'subscription_id' => $server->subscription_id,
                    'created_at' => $server->created_at->format('Y-m-d'),
                ];
            });

        return Inertia::render('admin/servers', [
            'servers' => $servers,
        ]);
    }

    public function userDetails(User $user)
    {
        // Get subscription period ends from Stripe
        $subscriptionPeriods = [];
        try {
            if ($user->stripe_id) {
                $stripe = new StripeClient(config('cashier.secret'));
                $stripeSubscriptions = $stripe->subscriptions->all([
                    'customer' => $user->stripe_id,
                    'limit' => 100,
                ]);

                foreach ($stripeSubscriptions->data as $sub) {
                    $subscriptionPeriods[$sub->id] = date('Y-m-d', $sub->current_period_end);
                }
            }
        } catch (\Throwable $e) {
            Log::error('Admin: Failed to fetch subscription periods', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }

        $servers = Server::where('user_id', $user->id)
            ->with('plan:id,name,key')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($server) use ($subscriptionPeriods) {
                return [
                    'id' => $server->id,
                    'server_name' => $server->server_name,
                    'game' => $server->game,
                    'status' => $server->status,
                    'billing_cycle' => $server->billing_cycle,
                    'pending_billing_cycle' => $server->pending_billing_cycle,
                    'plan_name' => $server->plan ? ucfirst($server->plan->key) : 'N/A',
                    'subscription_id' => $server->subscription_id,
                    'subscription_period_end' => $server->subscription_id && isset($subscriptionPeriods[$server->subscription_id])
                        ? $subscriptionPeriods[$server->subscription_id]
                        : null,
                    'pterodactyl_server_id' => $server->pterodactyl_server_id,
                    'pterodactyl_identifier' => $server->pterodactyl_identifier,
                    'created_at' => $server->created_at->format('Y-m-d'),
                ];
            });

        // Get user's Stripe subscriptions
        $subscriptions = [];
        try {
            if ($user->stripe_id) {
                $stripe = new StripeClient(config('cashier.secret'));
                $stripeSubscriptions = $stripe->subscriptions->all([
                    'customer' => $user->stripe_id,
                    'limit' => 100,
                ]);

                foreach ($stripeSubscriptions->data as $sub) {
                    $subscriptions[] = [
                        'id' => $sub->id,
                        'status' => $sub->status,
                        'current_period_end' => date('Y-m-d', $sub->current_period_end),
                        'cancel_at_period_end' => $sub->cancel_at_period_end,
                    ];
                }
            }
        } catch (\Throwable $e) {
            Log::error('Admin: Failed to fetch user subscriptions', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }

        // Get user's invoices
        $invoices = [];
        try {
            if ($user->stripe_id) {
                foreach (collect($user->invoices())->take(20) as $inv) {
                    $stripeInvoice = $inv->asStripeInvoice();
                    $invoices[] = [
                        'id' => $inv->id,
                        'number' => $inv->number,
                        'total' => $inv->total(),
                        'date' => $stripeInvoice->created ? date('Y-m-d', $stripeInvoice->created) : null,
                        'paid' => ($stripeInvoice->status === 'paid' || $stripeInvoice->paid === true),
                        'status' => $stripeInvoice->status,
                        'hosted_invoice_url' => $stripeInvoice->hosted_invoice_url ?? null,
                    ];
                }
            }
        } catch (\Throwable $e) {
            Log::error('Admin: Failed to fetch user invoices', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }

        // Get previous emails sent to this user
        $previousEmails = AdminEmailModel::where('user_id', $user->id)
            ->with('admin:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($email) {
                return [
                    'id' => $email->id,
                    'subject' => $email->subject,
                    'message' => $email->message,
                    'cc_emails' => $email->cc_emails,
                    'admin_name' => $email->admin->name ?? 'Unknown',
                    'sent_at' => $email->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Get all available roles for the dropdown
        $availableRoles = \App\Models\Role::select('id', 'name', 'display_name', 'description')
            ->orderBy('name')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => $role->display_name,
                    'description' => $role->description,
                ];
            });

        // Get current admin's permissions
        $currentAdmin = auth()->user();
        $permissions = [];
        if ($currentAdmin->isSuperAdmin()) {
            $permissions = ['*'];
        } elseif ($currentAdmin->role) {
            $permissions = $currentAdmin->role->permissions->pluck('name')->toArray();
        }

        return Inertia::render('admin/user-details', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
                'role_id' => $user->role_id,
                'role_name' => $user->role ? $user->role->display_name : null,
                'stripe_id' => $user->stripe_id,
                'billing_name' => $user->billing_name,
                'billing_address' => $user->billing_address,
                'billing_city' => $user->billing_city,
                'billing_country' => $user->billing_country,
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
            ],
            'servers' => $servers,
            'subscriptions' => $subscriptions,
            'invoices' => $invoices,
            'previousEmails' => $previousEmails,
            'availableRoles' => $availableRoles,
            'permissions' => $permissions,
            'pterodactylUrl' => rtrim(config('services.pterodactyl.url'), '/'),
            'csrf' => csrf_token(),
        ]);
    }

    public function sendEmail(Request $request, User $user)
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
            'cc_emails' => ['nullable', 'string'],
        ]);

        try {
            // Add predefined prefix to subject
            $subjectPrefix = '[No-Reply] ';
            $fullSubject = $subjectPrefix . $validated['subject'];

            $mailable = new AdminEmail($fullSubject, $validated['message']);

            // Parse CC emails
            $ccEmails = [];
            if (!empty($validated['cc_emails'])) {
                $ccEmails = array_filter(
                    array_map('trim', explode(',', $validated['cc_emails'])),
                    function ($email) {
                        return filter_var($email, FILTER_VALIDATE_EMAIL);
                    }
                );
            }

            // Send to primary recipient
            Mail::to($user->email)->send($mailable);

            // Send CC copies if provided
            if (!empty($ccEmails)) {
                foreach ($ccEmails as $ccEmail) {
                    Mail::to($ccEmail)->send(new AdminEmail($fullSubject, $validated['message']));
                }
            }

            // Save email to database
            AdminEmailModel::create([
                'user_id' => $user->id,
                'admin_id' => auth()->id(),
                'subject' => $fullSubject,
                'message' => $validated['message'],
                'cc_emails' => !empty($ccEmails) ? implode(', ', $ccEmails) : null,
            ]);

            Log::info('Admin sent email to user', [
                'admin_id' => auth()->id(),
                'user_id' => $user->id,
                'user_email' => $user->email,
                'cc_emails' => $ccEmails,
                'subject' => $fullSubject,
            ]);

            return back()->with('success', 'Email sent successfully to ' . $user->email .
                (!empty($ccEmails) ? ' and ' . count($ccEmails) . ' CC recipient(s)' : ''));
        } catch (\Throwable $e) {
            Log::error('Admin email send error: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'trace' => $e->getTraceAsString(),
            ]);
            return back()->withErrors(['email' => 'Failed to send email. Please try again or check your SMTP configuration.']);
        }
    }

    public function updateRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'is_admin' => ['required', 'boolean'],
            'role_id' => ['nullable', 'exists:roles,id'],
        ]);

        // Prevent admins from removing their own admin role
        if ($user->id === auth()->id() && !$validated['is_admin']) {
            return back()->withErrors(['role' => 'You cannot remove your own admin/super admin status.']);
        }

        // Update is_admin status
        $user->is_admin = $validated['is_admin'];

        // Update role_id (null if super admin or no role)
        $user->role_id = $validated['role_id'];

        $user->save();

        $roleName = $user->role ? $user->role->display_name : ($validated['is_admin'] ? 'Super Admin' : 'No Role');

        Log::info('Admin updated user role', [
            'admin_id' => auth()->id(),
            'user_id' => $user->id,
            'is_admin' => $validated['is_admin'],
            'role_id' => $validated['role_id'],
            'role_name' => $roleName,
        ]);

        return back()->with('success', "User role updated successfully to: {$roleName}");
    }

    public function sendPasswordReset(User $user)
    {
        // Generate password reset token
        $token = app('auth.password.broker')->createToken($user);

        // Send password reset email
        $user->sendPasswordResetNotification($token);

        Log::info('Admin triggered password reset', [
            'admin_id' => auth()->id(),
            'user_id' => $user->id,
        ]);

        return back()->with('success', 'Password reset email sent successfully.');
    }

    public function updateEmail(Request $request, User $user)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        // Prevent admins from changing their own email through this interface
        if ($user->id === auth()->id()) {
            return back()->withErrors(['email' => 'You cannot change your own email through this interface.']);
        }

        $oldEmail = $user->email;
        $user->email = $validated['email'];
        $user->email_verified_at = null; // Require email verification for new email
        $user->save();

        Log::info('Admin updated user email', [
            'admin_id' => auth()->id(),
            'user_id' => $user->id,
            'old_email' => $oldEmail,
            'new_email' => $validated['email'],
        ]);

        return back()->with('success', 'Email updated successfully. User will need to verify their new email.');
    }

    public function updatePassword(Request $request, User $user)
    {
        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        // Prevent admins from changing their own password through this interface
        if ($user->id === auth()->id()) {
            return back()->withErrors(['password' => 'You cannot change your own password through this interface.']);
        }

        $user->password = bcrypt($validated['password']);
        $user->save();

        Log::info('Admin updated user password', [
            'admin_id' => auth()->id(),
            'user_id' => $user->id,
        ]);

        return back()->with('success', 'Password updated successfully.');
    }

    public function suspendServers(User $user)
    {
        // Get all active servers for this user
        $activeServers = $user->servers()->where('status', 'active')->get();

        if ($activeServers->isEmpty()) {
            return back()->withErrors(['suspend' => 'No active servers found to suspend.']);
        }

        $pterodactylService = app(PterodactylService::class);
        $suspendedCount = 0;
        $errors = [];

        foreach ($activeServers as $server) {
            try {
                // Suspend in Pterodactyl if the server has a pterodactyl_server_id
                if ($server->pterodactyl_server_id) {
                    $pterodactylService->suspendServer((int) $server->pterodactyl_server_id);
                    Log::info('Suspended server in Pterodactyl', [
                        'server_id' => $server->id,
                        'pterodactyl_server_id' => $server->pterodactyl_server_id,
                    ]);
                }

                // Update status in our database
                $server->status = 'suspended';
                $server->save();
                $suspendedCount++;
            } catch (\Throwable $e) {
                Log::error('Failed to suspend server', [
                    'server_id' => $server->id,
                    'pterodactyl_server_id' => $server->pterodactyl_server_id,
                    'error' => $e->getMessage(),
                ]);
                $errors[] = "Failed to suspend server {$server->server_name}: {$e->getMessage()}";
            }
        }

        Log::info('Admin suspended user servers', [
            'admin_id' => auth()->id(),
            'user_id' => $user->id,
            'servers_suspended' => $suspendedCount,
            'errors' => count($errors),
        ]);

        if (!empty($errors)) {
            return back()->with('success', "Suspended {$suspendedCount} server(s), but encountered errors with some: " . implode(', ', $errors));
        }

        return back()->with('success', "Successfully suspended {$suspendedCount} server(s) for {$user->name}.");
    }

    public function unsuspendServers(User $user)
    {
        // Get all suspended servers for this user
        $suspendedServers = $user->servers()->where('status', 'suspended')->get();

        if ($suspendedServers->isEmpty()) {
            return back()->withErrors(['unsuspend' => 'No suspended servers found to unsuspend.']);
        }

        $pterodactylService = app(PterodactylService::class);
        $unsuspendedCount = 0;
        $errors = [];

        foreach ($suspendedServers as $server) {
            try {
                // Unsuspend in Pterodactyl if the server has a pterodactyl_server_id
                if ($server->pterodactyl_server_id) {
                    $pterodactylService->unsuspendServer((int) $server->pterodactyl_server_id);
                    Log::info('Unsuspended server in Pterodactyl', [
                        'server_id' => $server->id,
                        'pterodactyl_server_id' => $server->pterodactyl_server_id,
                    ]);
                }

                // Update status in our database
                $server->status = 'active';
                $server->save();
                $unsuspendedCount++;
            } catch (\Throwable $e) {
                Log::error('Failed to unsuspend server', [
                    'server_id' => $server->id,
                    'pterodactyl_server_id' => $server->pterodactyl_server_id,
                    'error' => $e->getMessage(),
                ]);
                $errors[] = "Failed to unsuspend server {$server->server_name}: {$e->getMessage()}";
            }
        }

        Log::info('Admin unsuspended user servers', [
            'admin_id' => auth()->id(),
            'user_id' => $user->id,
            'servers_unsuspended' => $unsuspendedCount,
            'errors' => count($errors),
        ]);

        if (!empty($errors)) {
            return back()->with('success', "Unsuspended {$unsuspendedCount} server(s), but encountered errors with some: " . implode(', ', $errors));
        }

        return back()->with('success', "Successfully unsuspended {$unsuspendedCount} server(s) for {$user->name}.");
    }

    public function cancelService(Request $request, User $user, Server $server)
    {
        $validated = $request->validate([
            'cancel_type' => ['required', 'in:immediate,period_end'],
        ]);

        // Verify the server belongs to the user
        if ($server->user_id !== $user->id) {
            return back()->withErrors(['cancel' => 'Server does not belong to this user.']);
        }

        // Check if server already cancelled
        if ($server->status === 'cancelled') {
            return back()->withErrors(['cancel' => 'Server is already cancelled.']);
        }

        // Check if server has a subscription
        if (!$server->subscription_id) {
            return back()->withErrors(['cancel' => 'Server does not have an active subscription.']);
        }

        try {
            $stripe = new StripeClient(config('cashier.secret'));
            $pterodactylService = app(PterodactylService::class);

            if ($validated['cancel_type'] === 'immediate') {
                // Cancel subscription immediately
                $stripe->subscriptions->cancel($server->subscription_id);

                // Suspend server in Pterodactyl
                if ($server->pterodactyl_server_id) {
                    $pterodactylService->suspendServer((int) $server->pterodactyl_server_id);
                    Log::info('Suspended server in Pterodactyl (immediate cancellation)', [
                        'server_id' => $server->id,
                        'pterodactyl_server_id' => $server->pterodactyl_server_id,
                    ]);
                }

                // Update server status
                $server->status = 'cancelled';
                $server->save();

                Log::info('Admin cancelled service immediately', [
                    'admin_id' => auth()->id(),
                    'user_id' => $user->id,
                    'server_id' => $server->id,
                    'subscription_id' => $server->subscription_id,
                ]);

                return back()->with('success', "Service cancelled immediately. Server {$server->server_name} has been suspended.");
            } else {
                // Cancel at period end
                $stripe->subscriptions->update($server->subscription_id, [
                    'cancel_at_period_end' => true,
                ]);

                // Update server status to cancelled (webhook will handle suspension at period end)
                $server->status = 'cancelled';
                $server->save();

                Log::info('Admin cancelled service at period end', [
                    'admin_id' => auth()->id(),
                    'user_id' => $user->id,
                    'server_id' => $server->id,
                    'subscription_id' => $server->subscription_id,
                ]);

                return back()->with('success', "Service will be cancelled at the end of the billing period. Server {$server->server_name} will be suspended automatically at that time.");
            }
        } catch (\Throwable $e) {
            Log::error('Admin failed to cancel service', [
                'admin_id' => auth()->id(),
                'user_id' => $user->id,
                'server_id' => $server->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors(['cancel' => 'Failed to cancel service: ' . $e->getMessage()]);
        }
    }

    public function deleteAccount(User $user)
    {
        // Prevent admins from deleting their own account
        if ($user->id === auth()->id()) {
            return back()->withErrors(['delete' => 'You cannot delete your own account.']);
        }

        // Check if user has active servers/subscriptions
        $activeServers = $user->servers()->whereIn('status', ['active', 'suspended'])->count();
        if ($activeServers > 0) {
            return back()->withErrors(['delete' => 'User has active servers. Please cancel all subscriptions first.']);
        }

        $userName = $user->name;
        $userEmail = $user->email;

        Log::warning('Admin deleted user account', [
            'admin_id' => auth()->id(),
            'deleted_user_id' => $user->id,
            'deleted_user_name' => $userName,
            'deleted_user_email' => $userEmail,
        ]);

        // Delete the user (cascade will handle related records)
        $user->delete();

        return redirect()->route('admin.index')->with('success', "User account for {$userName} has been deleted.");
    }

    /**
     * Display roles management page (Super Admin only)
     */
    public function roles()
    {
        // Only super admins can access this
        if (!auth()->user()->isSuperAdmin()) {
            abort(403, 'Only super administrators can manage roles.');
        }

        $roles = \App\Models\Role::withCount(['users', 'permissions'])
            ->with('permissions:id,name,display_name,group')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => $role->display_name,
                    'description' => $role->description,
                    'users_count' => $role->users_count,
                    'permissions_count' => $role->permissions_count,
                    'permissions' => $role->permissions->map(function ($permission) {
                        return [
                            'id' => $permission->id,
                            'name' => $permission->name,
                            'display_name' => $permission->display_name,
                            'group' => $permission->group,
                        ];
                    }),
                ];
            });

        return Inertia::render('admin/roles', [
            'roles' => $roles,
        ]);
    }

    /**
     * Display role edit page (Super Admin only)
     */
    public function roleEdit(\App\Models\Role $role)
    {
        // Only super admins can access this
        if (!auth()->user()->isSuperAdmin()) {
            abort(403, 'Only super administrators can manage roles.');
        }

        // Get all permissions grouped by category
        $allPermissions = \App\Models\Permission::all()
            ->groupBy('group')
            ->map(function ($permissions, $group) {
                return [
                    'group' => $group,
                    'permissions' => $permissions->map(function ($permission) {
                        return [
                            'id' => $permission->id,
                            'name' => $permission->name,
                            'display_name' => $permission->display_name,
                            'description' => $permission->description,
                        ];
                    })->values(),
                ];
            })->values();

        // Get role with current permissions
        $roleData = [
            'id' => $role->id,
            'name' => $role->name,
            'display_name' => $role->display_name,
            'description' => $role->description,
            'permission_ids' => $role->permissions->pluck('id')->toArray(),
        ];

        return Inertia::render('admin/role-edit', [
            'role' => $roleData,
            'permissionGroups' => $allPermissions,
        ]);
    }

    /**
     * Update role permissions (Super Admin only)
     */
    public function rolePermissionsUpdate(Request $request, \App\Models\Role $role)
    {
        // Only super admins can access this
        if (!auth()->user()->isSuperAdmin()) {
            abort(403, 'Only super administrators can manage roles.');
        }

        $validated = $request->validate([
            'permission_ids' => ['required', 'array'],
            'permission_ids.*' => ['exists:permissions,id'],
        ]);

        // Sync permissions
        $role->permissions()->sync($validated['permission_ids']);

        Log::info('Admin updated role permissions', [
            'admin_id' => auth()->id(),
            'role_id' => $role->id,
            'role_name' => $role->name,
            'permissions_count' => count($validated['permission_ids']),
        ]);

        return back()->with('success', "Permissions updated successfully for {$role->display_name} role.");
    }

    /**
     * Update role details (Super Admin only)
     */
    public function roleUpdate(Request $request, \App\Models\Role $role)
    {
        // Only super admins can access this
        if (!auth()->user()->isSuperAdmin()) {
            abort(403, 'Only super administrators can manage roles.');
        }

        $validated = $request->validate([
            'display_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $role->update($validated);

        Log::info('Admin updated role details', [
            'admin_id' => auth()->id(),
            'role_id' => $role->id,
            'role_name' => $role->name,
        ]);

        return back()->with('success', "Role details updated successfully.");
    }

    /**
     * Create a new role (Super Admin only)
     */
    public function roleStore(Request $request)
    {
        // Only super admins can access this
        if (!auth()->user()->isSuperAdmin()) {
            abort(403, 'Only super administrators can manage roles.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name', 'regex:/^[a-z_]+$/'],
            'display_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $role = \App\Models\Role::create($validated);

        Log::info('Admin created new role', [
            'admin_id' => auth()->id(),
            'role_id' => $role->id,
            'role_name' => $role->name,
        ]);

        return redirect()->route('admin.roles.index')->with('success', "Role '{$role->display_name}' created successfully.");
    }

    /**
     * Delete a role (Super Admin only)
     */
    public function roleDestroy(\App\Models\Role $role)
    {
        // Only super admins can access this
        if (!auth()->user()->isSuperAdmin()) {
            abort(403, 'Only super administrators can manage roles.');
        }

        // Check if role has users assigned
        $usersCount = $role->users()->count();
        if ($usersCount > 0) {
            return back()->withErrors(['role' => "Cannot delete role '{$role->display_name}' because it has {$usersCount} user(s) assigned to it. Please reassign these users first."]);
        }

        $roleName = $role->display_name;

        Log::warning('Admin deleted role', [
            'admin_id' => auth()->id(),
            'role_id' => $role->id,
            'role_name' => $role->name,
        ]);

        $role->delete();

        return redirect()->route('admin.roles.index')->with('success', "Role '{$roleName}' deleted successfully.");
    }
}
