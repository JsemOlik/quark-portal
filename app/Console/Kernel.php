<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        \App\Console\Commands\Maintenance\MakeMaintenance::class,
        \App\Console\Commands\Environment\DatabaseSettingsCommand::class,
        \App\Console\Commands\User\MakeUser::class,
        \App\Console\Commands\User\DeleteUser::class,
    ];

    protected function schedule(Schedule $schedule): void
    {
        // Define scheduled tasks here if needed
    }

    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');
        require base_path('routes/console.php');
    }
}
