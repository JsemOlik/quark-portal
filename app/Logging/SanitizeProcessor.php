<?php

namespace App\Logging;

use Monolog\LogRecord;
use Monolog\Processor\ProcessorInterface;

class SanitizeProcessor implements ProcessorInterface
{
    /**
     * Sensitive keys that should be redacted from logs
     */
    private array $sensitiveKeys = [
        'password',
        'password_confirmation',
        'api_key',
        'app_key',
        'secret',
        'token',
        'stripe_id',
        'stripe_key',
        'stripe_secret',
        'webhook_secret',
        'client_secret',
        'email_password',
        'mail_password',
        'pterodactyl_key',
        'ptero_app_key',
        'credit_card',
        'card_number',
        'cvv',
        'ssn',
        'authorization',
    ];

    /**
     * Patterns to redact from log messages
     */
    private array $sensitivePatterns = [
        '/password["\']?\s*[:=]\s*["\']?([^"\'\s,}]+)/i' => 'password: [REDACTED]',
        '/api[_-]?key["\']?\s*[:=]\s*["\']?([^"\'\s,}]+)/i' => 'api_key: [REDACTED]',
        '/secret["\']?\s*[:=]\s*["\']?([^"\'\s,}]+)/i' => 'secret: [REDACTED]',
        '/token["\']?\s*[:=]\s*["\']?([^"\'\s,}]+)/i' => 'token: [REDACTED]',
        '/(sk_live_|sk_test_|pk_live_|pk_test_)[a-zA-Z0-9]{20,}/' => '[STRIPE_KEY_REDACTED]',
        '/whsec_[a-zA-Z0-9]{32,}/' => '[WEBHOOK_SECRET_REDACTED]',
        '/pyro_[a-zA-Z0-9]{30,}/' => '[PTERO_KEY_REDACTED]',
    ];

    public function __invoke(LogRecord $record): LogRecord
    {
        // Sanitize the message
        $record->message = $this->sanitizeString($record->message);

        // Sanitize context array
        if (!empty($record->context)) {
            $record->context = $this->sanitizeArray($record->context);
        }

        // Sanitize extra array
        if (!empty($record->extra)) {
            $record->extra = $this->sanitizeArray($record->extra);
        }

        return $record;
    }

    /**
     * Sanitize a string by replacing sensitive patterns
     */
    private function sanitizeString(string $string): string
    {
        foreach ($this->sensitivePatterns as $pattern => $replacement) {
            $string = preg_replace($pattern, $replacement, $string);
        }

        return $string;
    }

    /**
     * Recursively sanitize an array
     */
    private function sanitizeArray(array $data): array
    {
        foreach ($data as $key => $value) {
            // Check if key is sensitive
            if ($this->isSensitiveKey($key)) {
                $data[$key] = '[REDACTED]';
                continue;
            }

            // Recursively sanitize arrays
            if (is_array($value)) {
                $data[$key] = $this->sanitizeArray($value);
            } elseif (is_string($value)) {
                $data[$key] = $this->sanitizeString($value);
            }
        }

        return $data;
    }

    /**
     * Check if a key is sensitive
     */
    private function isSensitiveKey(string $key): bool
    {
        $key = strtolower($key);

        foreach ($this->sensitiveKeys as $sensitiveKey) {
            if (str_contains($key, strtolower($sensitiveKey))) {
                return true;
            }
        }

        return false;
    }
}
