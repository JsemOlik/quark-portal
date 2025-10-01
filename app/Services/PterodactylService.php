<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PterodactylService
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.pterodactyl.url'), '/');
        $this->apiKey = config('services.pterodactyl.app_key');
    }

    protected function http()
    {
        return \Illuminate\Support\Facades\Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ])->timeout(20);
    }

    public function createUser(array $payload): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ])->post($this->baseUrl . '/api/application/users', $payload);

        if ($response->failed()) {
            $error = $response->json();
            throw new \RuntimeException(
                'Pterodactyl user creation failed: ' . json_encode($error)
            );
        }

        $data = $response->json();
        return $data['attributes'] ?? $data;
    }

    public function buildUserPayload(string $name, string $email, string $password): array
    {
        [$first, $last] = $this->splitName($name);

        // Build desired username from name, fallback to email local-part
        $desired = $this->usernameFromName($name) ?: $this->usernameFromEmail($email);

        // Ensure only allowed chars and max length (Pterodactyl accepts up to 191)
        $desired = $this->sanitizeUsername($desired);

        // Try desired username; if taken, append a short suffix
        $username = $this->ensureUniqueUsername($desired);

        return [
            'email' => $email,
            'username' => $username,
            'first_name' => $first ?: 'User',
            'last_name' => $last ?: 'Quark',
            'password' => $password,
            'language' => 'en',
            'root_admin' => false,
            '2fa' => false,
        ];
    }

    protected function splitName(string $name): array
    {
        $parts = preg_split('/\s+/', trim($name)) ?: [];
        $first = $parts[0] ?? '';
        $last = count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : '';
        return [$first, $last];
    }

    protected function usernameFromName(string $name): string
    {
        $name = trim($name);
        if ($name === '') {
            return '';
        }
        // Convert spaces to underscores, remove disallowed chars, lowercase
        $u = strtolower(preg_replace('/[^a-z0-9]+/i', '_', $name));
        // Collapse multiple underscores and trim
        $u = preg_replace('/_+/', '_', $u);
        $u = trim($u, '_');
        return $u;
    }

    protected function usernameFromEmail(string $email): string
    {
        $local = strtolower(substr($email, 0, strpos($email, '@') ?: strlen($email)));
        $local = preg_replace('/[^a-z0-9]+/i', '_', $local);
        $local = preg_replace('/_+/', '_', $local);
        return trim($local, '_');
    }

    protected function sanitizeUsername(string $u): string
    {
        $u = strtolower(preg_replace('/[^a-z0-9_]/i', '_', $u));
        $u = preg_replace('/_+/', '_', $u);
        $u = trim($u, '_');
        // Hard cap length for safety
        return substr($u, 0, 50);
    }

    protected function ensureUniqueUsername(string $desired): string
    {
        // Try desired first
        if (!$this->usernameExists($desired)) {
            return $desired;
        }

        // Append a short numeric suffix until unique
        // Example: anne_marie_sigma, anne_marie_sigma_1, _2, ...
        for ($i = 1; $i <= 20; $i++) {
            $candidate = $desired . '_' . $i;
            if (!$this->usernameExists($candidate)) {
                return $candidate;
            }
        }

        // Fallback: random short suffix if many collisions
        return $desired . '_' . Str::lower(Str::random(4));
    }

    protected function usernameExists(string $username): bool
    {
        // Pterodactyl Application API: list users with filter[username]
        // Docs: GET /api/application/users?filter[username]=foo
        $res = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Accept' => 'application/json',
        ])->get($this->baseUrl . '/api/application/users', [
                    'filter[username]' => $username,
                    'per_page' => 1,
                ]);

        if ($res->failed()) {
            // If we can’t verify, assume it’s free to avoid blocking registration;
            // collisions will be caught by createUser 422 and you can handle in controller.
            return false;
        }

        $data = $res->json();
        $items = $data['data'] ?? [];
        return count($items) > 0;
    }

    public function findServerByExternalId(string $externalId): ?array
    {
        $res = $this->http()->get($this->baseUrl . '/api/application/servers', [
            'filter[external_id]' => $externalId,
            'per_page' => 1,
        ]);

        if ($res->failed()) {
            return null;
        }

        $data = $res->json();
        $first = $data['data'][0]['attributes'] ?? null;
        return $first ?: null;
    }

    public function findUserByEmail(string $email): ?array
    {
        $res = $this->http()->get($this->baseUrl . '/api/application/users', [
            'filter[email]' => $email,
            'per_page' => 1,
        ]);

        if ($res->failed()) {
            return null;
        }

        $data = $res->json();
        $first = $data['data'][0]['attributes'] ?? null;
        return $first ?: null;
    }

    public function createServer(array $payload): array
    {
        $res = $this->http()->post($this->baseUrl . '/api/application/servers', $payload);

        if ($res->failed()) {
            throw new \RuntimeException('Pterodactyl server creation failed: ' . $res->body());
        }

        $data = $res->json();
        return $data['attributes'] ?? $data;
    }

    public function powerAction(int|string $serverId, string $signal): void
    {
        // Optional: POST /api/client/servers/{identifier}/power is a Client API.
        // For application-level: use suspend/unsuspend via Application API if needed.
    }

    public function suspendServer(int $serverId): void
    {
        $res = $this->http()->post($this->baseUrl . "/api/application/servers/{$serverId}/suspend");
        if ($res->failed()) {
            throw new \RuntimeException('Failed to suspend server: ' . $res->body());
        }
    }

    public function unsuspendServer(int $serverId): void
    {
        $res = $this->http()->post($this->baseUrl . "/api/application/servers/{$serverId}/unsuspend");
        if ($res->failed()) {
            throw new \RuntimeException('Failed to unsuspend server: ' . $res->body());
        }
    }

    public function forceDeleteServer(int $serverId): void
    {
        $res = $this->http()->delete($this->baseUrl . "/api/application/servers/{$serverId}/force");
        if ($res->failed()) {
            throw new \RuntimeException('Failed to delete server: ' . $res->body());
        }
    }
}
