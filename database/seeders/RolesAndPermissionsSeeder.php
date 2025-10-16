<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define all permissions
        $permissions = [
            // User Management
            ['name' => 'view_users', 'display_name' => 'View Users', 'group' => 'users', 'description' => 'Can view user list and details'],
            ['name' => 'edit_users', 'display_name' => 'Edit Users', 'group' => 'users', 'description' => 'Can edit user information'],
            ['name' => 'delete_users', 'display_name' => 'Delete Users', 'group' => 'users', 'description' => 'Can delete user accounts'],
            ['name' => 'manage_user_roles', 'display_name' => 'Manage User Roles', 'group' => 'users', 'description' => 'Can assign roles to users'],

            // Server Management
            ['name' => 'view_servers', 'display_name' => 'View Servers', 'group' => 'servers', 'description' => 'Can view server list and details'],
            ['name' => 'suspend_servers', 'display_name' => 'Suspend Servers', 'group' => 'servers', 'description' => 'Can suspend user servers'],
            ['name' => 'unsuspend_servers', 'display_name' => 'Unsuspend Servers', 'group' => 'servers', 'description' => 'Can unsuspend user servers'],
            ['name' => 'cancel_servers', 'display_name' => 'Cancel Servers', 'group' => 'servers', 'description' => 'Can cancel server subscriptions'],
            ['name' => 'delete_servers', 'display_name' => 'Delete Servers', 'group' => 'servers', 'description' => 'Can permanently delete servers'],

            // Billing Management
            ['name' => 'view_billing', 'display_name' => 'View Billing', 'group' => 'billing', 'description' => 'Can view invoices and subscriptions'],
            ['name' => 'manage_subscriptions', 'display_name' => 'Manage Subscriptions', 'group' => 'billing', 'description' => 'Can cancel and modify subscriptions'],
            ['name' => 'issue_refunds', 'display_name' => 'Issue Refunds', 'group' => 'billing', 'description' => 'Can issue refunds to customers'],

            // Ticket Management
            ['name' => 'view_tickets', 'display_name' => 'View Tickets', 'group' => 'tickets', 'description' => 'Can view all support tickets'],
            ['name' => 'reply_tickets', 'display_name' => 'Reply to Tickets', 'group' => 'tickets', 'description' => 'Can reply to support tickets'],
            ['name' => 'close_tickets', 'display_name' => 'Close Tickets', 'group' => 'tickets', 'description' => 'Can close support tickets'],
            ['name' => 'assign_tickets', 'display_name' => 'Assign Tickets', 'group' => 'tickets', 'description' => 'Can assign tickets to staff'],
            ['name' => 'delete_tickets', 'display_name' => 'Delete Tickets', 'group' => 'tickets', 'description' => 'Can delete support tickets'],

            // Communication
            ['name' => 'send_emails', 'display_name' => 'Send Emails', 'group' => 'communication', 'description' => 'Can send emails to users'],
            ['name' => 'send_bulk_emails', 'display_name' => 'Send Bulk Emails', 'group' => 'communication', 'description' => 'Can send emails to multiple users'],

            // System Management (Super Admin only)
            ['name' => 'manage_roles', 'display_name' => 'Manage Roles', 'group' => 'system', 'description' => 'Can create and edit roles'],
            ['name' => 'manage_permissions', 'display_name' => 'Manage Permissions', 'group' => 'system', 'description' => 'Can assign permissions to roles'],
            ['name' => 'view_audit_logs', 'display_name' => 'View Audit Logs', 'group' => 'system', 'description' => 'Can view system audit logs'],
        ];

        // Create all permissions
        foreach ($permissions as $permissionData) {
            Permission::firstOrCreate(
                ['name' => $permissionData['name']],
                $permissionData
            );
        }

        // Define roles with their permissions
        $roles = [
            [
                'name' => 'support',
                'display_name' => 'Support Agent',
                'description' => 'Can handle tickets and view user information',
                'permissions' => [
                    'view_users',
                    'view_servers',
                    'view_billing',
                    'view_tickets',
                    'reply_tickets',
                    'close_tickets',
                    'send_emails',
                ],
            ],
            [
                'name' => 'billing',
                'display_name' => 'Billing Manager',
                'description' => 'Can manage billing, subscriptions, and refunds',
                'permissions' => [
                    'view_users',
                    'view_servers',
                    'view_billing',
                    'manage_subscriptions',
                    'issue_refunds',
                    'cancel_servers',
                    'view_tickets',
                    'reply_tickets',
                    'send_emails',
                ],
            ],
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'Full administrative access except system configuration',
                'permissions' => [
                    'view_users',
                    'edit_users',
                    'delete_users',
                    'manage_user_roles',
                    'view_servers',
                    'suspend_servers',
                    'unsuspend_servers',
                    'cancel_servers',
                    'delete_servers',
                    'view_billing',
                    'manage_subscriptions',
                    'issue_refunds',
                    'view_tickets',
                    'reply_tickets',
                    'close_tickets',
                    'assign_tickets',
                    'delete_tickets',
                    'send_emails',
                    'send_bulk_emails',
                    'view_audit_logs',
                ],
            ],
        ];

        // Create roles and assign permissions
        foreach ($roles as $roleData) {
            $role = Role::firstOrCreate(
                ['name' => $roleData['name']],
                [
                    'display_name' => $roleData['display_name'],
                    'description' => $roleData['description'],
                ]
            );

            // Assign permissions to role
            $permissionIds = Permission::whereIn('name', $roleData['permissions'])->pluck('id');
            $role->permissions()->sync($permissionIds);
        }

        $this->command->info('Roles and permissions have been seeded successfully!');
        $this->command->info('Created roles: Support Agent, Billing Manager, Administrator');
        $this->command->info('Note: Users with is_admin=true are Super Admins and have all permissions automatically.');
    }
}
