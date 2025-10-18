<?php

namespace App\Console\Commands\Maintenance;

use Illuminate\Console\Command;

class DisableMaintenance extends Command
{
    protected $signature = 'p:maintenance:disable {--force : Do not ask for confirmation}';
    protected $description = 'Disable maintenance mode.';

    public function handle(): int
    {
        $force = (bool) $this->option('force');

        if (!$force && !$this->confirm('Disable maintenance mode?', true)) {
            $this->warn('Aborted.');
            return Command::SUCCESS;
        }

        $this->call('up');
        $this->info('Maintenance disabled.');
        return Command::SUCCESS;
    }
}
