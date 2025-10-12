<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Server;
use App\Models\AdminEmail as AdminEmailModel;
use App\Mail\AdminEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Stripe\StripeClient;

class AdminController extends Controller
{
    public function index()
    {
        $users = User::withCount('servers')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_admin' => $user->is_admin,
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

        return Inertia::render('admin/dashboard', [
            'users' => $users,
            'stats' => $stats,
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

        return Inertia::render('admin/user-details', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
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
        ]);

        // Prevent admins from removing their own admin role
        if ($user->id === auth()->id() && !$validated['is_admin']) {
            return back()->withErrors(['role' => 'You cannot remove your own admin role.']);
        }

        $user->is_admin = $validated['is_admin'];
        $user->save();

        Log::info('Admin updated user role', [
            'admin_id' => auth()->id(),
            'user_id' => $user->id,
            'is_admin' => $validated['is_admin'],
        ]);

        return back()->with('success', 'User role updated successfully.');
    }
}
