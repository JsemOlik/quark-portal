<?php

namespace App\Console\Commands\User;

use App\Models\User;
use App\Services\PterodactylService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MakeUser extends Command
{
    // Run as: php artisan p:user:make ...
    protected $signature = 'p:user:make
        {--name= : Full name}
        {--email= : Email address (must be unique)}
        {--password= : Plain password (will be hashed). If omitted, you will be prompted or one will be generated}
        {--admin : Create as Super Admin (sets is_admin=true)}
        {--verify : Mark email as verified (sets email_verified_at=now)}
        {--billing-name= : Billing name}
        {--billing-address= : Billing street address}
        {--billing-city= : Billing city}
        {--billing-country= : 2-letter country code (e.g. CZ, US)}
        {--show-password : Output the generated password to console when auto-generated}
        {--no-ptero : Do NOT create a Pterodactyl user (overrides interactive choice)}
        {--ptero : Force create a Pterodactyl user (overrides interactive choice)}
    ';

    protected $description = 'Create a user with optional Super Admin, billing, verification, and Pterodactyl linkage';

    public function __construct(private readonly PterodactylService $ptero)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $name = $this->option('name') ?: $this->askRequired('Full name');
        $email = $this->option('email') ?: $this->askRequired('Email');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email format.');
            return Command::FAILURE;
        }

        if (User::where('email', $email)->exists()) {
            $this->error("A user with email {$email} already exists.");
            return Command::FAILURE;
        }

        $password = $this->option('password');
        if (!$password) {
            if ($this->confirm('Do you want to enter a password?', true)) {
                $password = $this->secret('Password (input hidden)');
                while (!$password || strlen($password) < 8) {
                    $this->warn('Password must be at least 8 characters.');
                    $password = $this->secret('Password (input hidden)');
                }
            } else {
                $password = Str::password(16);
                if ($this->option('show-password')) {
                    $this->info("Generated password: {$password}");
                } else {
                    $this->line('A strong password was generated (use --show-password to display).');
                }
            }
        }

        // Super Admin prompt (sets is_admin)
        $isAdmin = (bool) $this->option('admin');
        if (!$isAdmin && $this->input->isInteractive()) {
            if ($this->confirm('Should this user be a Super Admin?', false)) {
                $isAdmin = true;
            }
        }

        $verified = (bool) $this->option('verify');

        // Optional billing fields
        $billingName = $this->option('billing-name');
        $billingAddress = $this->option('billing-address');
        $billingCity = $this->option('billing-city');
        $billingCountry = $this->option('billing-country');

        if ($this->input->isInteractive()) {
            if (
                $billingName === null &&
                $billingAddress === null &&
                $billingCity === null &&
                $billingCountry === null &&
                $this->confirm('Add billing info?', false)
            ) {
                $billingName = $this->ask('Billing name (optional)', $billingName);
                $billingAddress = $this->ask('Billing address (optional)', $billingAddress);
                $billingCity = $this->ask('Billing city (optional)', $billingCity);
                $billingCountry = $this->ask(
                    'Billing country 2-letter code (optional)',
                    $billingCountry
                );
            }
        }

        if ($billingCountry) {
            $billingCountry = strtoupper(substr($billingCountry, 0, 2));
        }

        // Pterodactyl prompt/flags
        $forcePtero = (bool) $this->option('ptero');
        $noPtero = (bool) $this->option('no-ptero');
        $createPtero = false;

        if ($forcePtero) {
            $createPtero = true;
        } elseif ($noPtero) {
            $createPtero = false;
        } elseif ($this->input->isInteractive()) {
            $createPtero = $this->confirm('Create a matching Pterodactyl user?', true);
        }

        try {
            $user = DB::transaction(function () use (
                $name,
                $email,
                $password,
                $isAdmin,
                $verified,
                $billingName,
                $billingAddress,
                $billingCity,
                $billingCountry,
                $createPtero
            ) {
                $user = new User();
                $user->name = $name;
                $user->email = $email;
                $user->password = Hash::make($password);
                $user->is_admin = $isAdmin;

                if ($verified) {
                    $user->email_verified_at = now();
                }

                $user->billing_name = $billingName ?: null;
                $user->billing_address = $billingAddress ?: null;
                $user->billing_city = $billingCity ?: null;
                $user->billing_country = $billingCountry ?: null;

                $user->save();

                if ($createPtero) {
                    // Build and create remote user
                    $payload = $this->ptero->buildUserPayload($name, $email, $password);
                    $pteroUser = $this->ptero->createUser($payload);

                    // Persist linkage if present
                    $user->pterodactyl_id = $pteroUser['id'] ?? null;
                    $user->pterodactyl_uuid = $pteroUser['uuid'] ?? null;
                    $user->save();
                }

                return $user;
            });
        } catch (\Throwable $e) {
            $this->error('Failed to create user: ' . $e->getMessage());
            report($e);
            return Command::FAILURE;
        }

        $this->info('User created successfully:');
        $this->line(" - ID: {$user->id}");
        $this->line(" - Name: {$user->name}");
        $this->line(" - Email: {$user->email}");
        $this->line(' - Super Admin: ' . ($user->is_admin ? 'yes' : 'no'));
        $this->line(' - Verified: ' . ($user->email_verified_at ? 'yes' : 'no'));

        if (!empty($user->pterodactyl_id)) {
            $this->line(" - Pterodactyl ID: {$user->pterodactyl_id}");
            $this->line(" - Pterodactyl UUID: {$user->pterodactyl_uuid}");
        } elseif ($forcePtero) {
            $this->warn('Pterodactyl user creation was requested but linkage is empty.');
        }

        if ($this->option('show-password')) {
            $this->warn('Remember to store the password securely.');
            $this->line(" - Password: {$password}");
        }

        return Command::SUCCESS;
    }

    private function askRequired(string $question): string
    {
        $value = $this->ask($question);
        while (!$value) {
            $this->warn("{$question} is required.");
            $value = $this->ask($question);
        }
        return $value;
    }
}
