<?php

namespace App\Console\Commands\Maintenance;

use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class EnableMaintenance extends Command
{
    protected $signature = 'p:maintenance:enable
        {--minutes= : Enable for N minutes (exclusive with --until)}
        {--until= : Enable until Y-m-d H:i in app timezone (exclusive with --minutes)}
        {--message= : Custom maintenance message to show on the 503 page}
        {--retry= : Retry-After seconds (e.g., 60)}
        {--allow=* : Whitelist IPs or CIDRs to bypass maintenance}
        {--secret= : Secret token for bypass link (auto-generated if omitted)}
        {--render= : Maintenance view name (e.g., errors.503). Use a view name, not a path}
        {--force : Do not ask for confirmation}
    ';

    protected $description = 'Enable maintenance mode with an interactive, intuitive flow or CLI flags.';

    public function handle(): int
    {
        $message = $this->option('message') ?? 'We are performing maintenance. Please check back soon.';
        $retry = (int) ($this->option('retry') ?? 60);
        $allow = (array) $this->option('allow');
        $secret = $this->option('secret');
        $renderOpt = $this->normalizeRenderOption($this->option('render')) ?: 'errors.503';

        // Resolve duration (interactive unless flags provided)
        [$minutes, $untilString] = $this->resolveDurationInteractively(
            $this->option('minutes'),
            $this->option('until')
        );

        if ($minutes && $untilString) {
            $this->error('Use either minutes or until, not both.');
            return Command::FAILURE;
        }

        $tz = config('app.timezone', 'UTC');

        // Compute the end time if applicable
        $untilAt = null;
        if ($untilString) {
            try {
                $dt = CarbonImmutable::parse($untilString, $tz);
                $now = CarbonImmutable::now($tz);
                if ($dt->lessThanOrEqualTo($now)) {
                    $this->error('The "until" datetime must be in the future.');
                    return Command::FAILURE;
                }
                $untilAt = $dt;
            } catch (\Throwable $e) {
                $this->error('Invalid "until" format. Use "Y-m-d H:i" in your app timezone.');
                return Command::FAILURE;
            }
        } elseif ($minutes) {
            $minutes = max(1, (int) $minutes);
            $untilAt = CarbonImmutable::now($tz)->addMinutes($minutes);
        }

        $downOptions = [
            '--retry' => (string) $retry,
            '--render' => $renderOpt,
        ];

        if (!empty($allow)) {
            foreach ($allow as $ip) {
                $downOptions['--allow'][] = $ip;
            }
        }

        if (!$secret) {
            $secret = 'maintenance-' . Str::random(24);
            $this->line('Generated maintenance secret for bypass link: ' . $secret);
            $this->line('Bypass URL (sets cookie): ' . url("/{$secret}"));
        }
        $downOptions['--secret'] = $secret;

        $indefinite = $untilAt === null;

        $force = (bool) $this->option('force');
        if (!$force) {
            $summary = [
                'Indefinite' => $indefinite ? 'yes' : 'no',
                'Ends at' => $indefinite ? '(unknown)' : $untilAt->format('Y-m-d H:i:s') . ' ' . $tz,
                'Retry' => $retry,
                'Allow' => implode(', ', $allow) ?: '(none)',
                'Secret' => $secret,
                'Render' => $downOptions['--render'],
                'Message' => $message,
            ];
            $this->info('Maintenance mode summary:');
            foreach ($summary as $k => $v) {
                $this->line(" - {$k}: {$v}");
            }
            if (!$this->confirm('Enable maintenance with these settings?', true)) {
                $this->warn('Aborted.');
                return Command::SUCCESS;
            }
        }

        // Enter maintenance mode
        $this->call('down', $downOptions);

        // Persist metadata into storage/framework/down
        $downFile = storage_path('framework/down');
        try {
            $data = [];
            if (file_exists($downFile)) {
                $raw = (string) file_get_contents($downFile);
                $data = json_decode($raw, true);
                if (!is_array($data)) {
                    $data = [];
                }
            }

            $data['custom_message'] = $message;
            $data['generated_at'] = now($tz)->toIso8601String();

            if ($untilAt) {
                // Explicitly set both keys so view has multiple ways to read
                $data['time'] = $untilAt->getTimestamp();
                $data['ends_at'] = $untilAt->toIso8601String();
                $data['timezone'] = $tz;
                $this->line('Debug: wrote ends_at=' . $data['ends_at'] . ' time=' . $data['time'] . ' tz=' . $tz);
            } else {
                unset($data['time'], $data['ends_at'], $data['timezone']);
                $this->line('Debug: set maintenance as indefinite (no end time).');
            }

            file_put_contents($downFile, json_encode($data, JSON_PRETTY_PRINT));
        } catch (\Throwable $e) {
            $this->warn('Warning: could not persist extended maintenance payload: ' . $e->getMessage());
        }

        $this->info('Maintenance enabled.');
        return Command::SUCCESS;
    }

    /**
     * Resolve maintenance duration interactively unless flags already supply it.
     *
     * @return array{0: int|null, 1: string|null} [$minutes, $untilString]
     */
    private function resolveDurationInteractively($minutesOpt, $untilOpt): array
    {
        if ($minutesOpt !== null || $untilOpt !== null || !$this->input->isInteractive()) {
            return [$minutesOpt !== null ? (int) $minutesOpt : null, $untilOpt !== null ? (string) $untilOpt : null];
        }

        $choice = $this->choice(
            'How long should maintenance last?',
            [
                'Indefinite (until disabled)',
                'For a set number of minutes',
                'Until a specific date/time',
            ],
            0
        );

        if ($choice === 'Indefinite (until disabled)') {
            return [null, null];
        }

        if ($choice === 'For a set number of minutes') {
            $minutes = null;
            while ($minutes === null) {
                $val = $this->ask('Enter number of minutes', '30');
                if ($val !== null && ctype_digit((string) $val) && (int) $val > 0) {
                    $minutes = (int) $val;
                } else {
                    $this->warn('Please enter a positive integer.');
                }
            }
            return [$minutes, null];
        }

        // Until a specific date/time
        $tz = config('app.timezone', 'UTC');
        $this->line('Enter a datetime in the format: Y-m-d H:i (timezone: ' . $tz . ')');
        $until = null;
        while ($until === null) {
            $input = $this->ask('Maintenance ends at (e.g., 2025-12-31 23:59)');
            try {
                $dt = CarbonImmutable::parse((string) $input, $tz);
                $now = CarbonImmutable::now($tz);
                if ($dt->lessThanOrEqualTo($now)) {
                    $this->warn('That time is not in the future. Try again.');
                } else {
                    $until = $dt->format('Y-m-d H:i');
                }
            } catch (\Throwable $e) {
                $this->warn('Invalid format. Please use "Y-m-d H:i".');
            }
        }

        return [null, $until];
    }

    private function normalizeRenderOption(?string $render): ?string
    {
        if (!$render) {
            return null;
        }

        if (str_contains($render, DIRECTORY_SEPARATOR) || str_ends_with($render, '.blade.php')) {
            $render = str_replace(['\\', '/'], '.', $render);
            $render = preg_replace('/^resources\.views\./', '', $render);
            $render = preg_replace('/\.blade\.php$/', '', $render);
            return $render;
        }

        return $render;
    }
}
