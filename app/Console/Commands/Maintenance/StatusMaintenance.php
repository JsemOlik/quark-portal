<?php

namespace App\Console\Commands\Maintenance;

use Illuminate\Console\Command;

class StatusMaintenance extends Command
{
    protected $signature = 'p:maintenance:status';
    protected $description = 'Show current maintenance mode status and payload.';

    public function handle(): int
    {
        $path = storage_path('framework/down');
        if (!file_exists($path)) {
            $this->info('Maintenance: OFF');
            return Command::SUCCESS;
        }

        $data = json_decode((string) file_get_contents($path), true) ?? [];
        $this->info('Maintenance: ON');
        foreach ($data as $k => $v) {
            if (is_array($v)) {
                $v = json_encode($v);
            }
            $this->line(" - {$k}: {$v}");
        }

        return Command::SUCCESS;
    }
}
