<?php

namespace App\Logging;

use Monolog\Logger;
use Illuminate\Log\Logger as IlluminateLogger;

class CustomizeFormatter
{
    /**
     * Customize the given logger instance.
     */
    public function __invoke($logger): void
    {
        // Handle both Illuminate\Log\Logger and Monolog\Logger
        $monologLogger = $logger instanceof IlluminateLogger
            ? $logger->getLogger()
            : $logger;

        if ($monologLogger instanceof Logger) {
            foreach ($monologLogger->getHandlers() as $handler) {
                $handler->pushProcessor(new SanitizeProcessor());
            }
        }
    }
}
