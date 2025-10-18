<?php

namespace App\Console\Commands\User;

use App\Models\User;
use App\Services\PterodactylService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DeleteUser extends Command
{
    protected $signature = 'p:user:delete
        {--id= : Delete by user ID}
        {--email= : Delete by email}
        {--force : Do not ask for confirmation}
        {--ptero : Force delete remote Pterodactyl user if linked}
        {--no-ptero : Do not delete remote Pterodactyl user even if linked}
    ';

    protected $description = 'Delete a user by ID or email, with optional Pterodactyl deletion.';

    public function __construct(private readonly PterodactylService $ptero)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $id = $this->option('id');
        $email = $this->option('email');

        if (!$id && !$email) {
            if ($this->input->isInteractive()) {
                $mode = $this->choice('Identify user by', ['email', 'id'], 0);
                if ($mode === 'email') {
                    $email = $this->ask('Email');
                } else {
                    $id = (int) $this->ask('User ID');
                }
            } else {
                $this->error('Provide --id or --email');
                return Command::FAILURE;
            }
        }

        $query = User::query();
        if ($id) {
            $query->where('id', $id);
        } else {
            $query->where('email', $email);
        }

        $user = $query->first();
        if (!$user) {
            $this->error('User not found.');
            return Command::FAILURE;
        }

        $this->info('User to delete:');
        $this->line(" - ID: {$user->id}");
        $this->line(" - Name: {$user->name}");
        $this->line(" - Email: {$user->email}");
        $this->line(' - Super Admin: ' . ($user->is_admin ? 'yes' : 'no'));

        $hasPtero = !empty($user->pterodactyl_id) || !empty($user->pterodactyl_uuid);
        if ($hasPtero) {
            $this->line(" - Pterodactyl ID: " . ($user->pterodactyl_id ?? '(none)'));
            $this->line(" - Pterodactyl UUID: " . ($user->pterodactyl_uuid ?? '(none)'));
        }

        $force = (bool) $this->option('force');
        if (!$force) {
            if (!$this->confirm('Are you sure you want to delete this user?', false)) {
                $this->warn('Aborted.');
                return Command::SUCCESS;
            }
        }

        // Determine remote deletion behavior
        $doPteroDelete = false;
        if ($this->option('ptero')) {
            $doPteroDelete = true;
        } elseif ($this->option('no-ptero')) {
            $doPteroDelete = false;
        } elseif ($this->input->isInteractive() && $hasPtero) {
            $doPteroDelete = $this->confirm(
                'Delete the linked Pterodactyl user as well?',
                false
            );
        }

        try {
            DB::transaction(function () use ($user, $doPteroDelete) {
                if ($doPteroDelete && (!empty($user->pterodactyl_id) || !empty($user->pterodactyl_uuid))) {
                    try {
                        // Prefer ID if present; otherwise, try email or UUID based delete in your service.
                        if (!empty($user->pterodactyl_id)) {
                            $this->ptero->deleteUserById($user->pterodactyl_id);
                        } elseif (!empty($user->email)) {
                            $this->ptero->deleteUserByEmail($user->email);
                        }
                    } catch (\Throwable $e) {
                        // Log but do not stop local deletion unless you want strict behavior
                        report($e);
                        $this->warn('Failed to delete remote Pterodactyl user: ' . $e->getMessage());
                    }
                }

                // If you have related models (subscriptions, teams, etc.) consider cascading or manual cleanup
                $user->delete();
            });
        } catch (\Throwable $e) {
            $this->error('Deletion failed: ' . $e->getMessage());
            report($e);
            return Command::FAILURE;
        }

        $this->info('User deleted.');
        return Command::SUCCESS;
    }
}
