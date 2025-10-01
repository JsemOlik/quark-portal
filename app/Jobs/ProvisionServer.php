<?php

namespace App\Jobs;

use App\Models\Server;
use App\Services\PterodactylService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class ProvisionServer implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;
    public int $backoff = 10; // seconds

    public function __construct(public int $serverId)
    {
    }

    public function handle(PterodactylService $ptero): void
    {
        $server = Server::find($this->serverId);
        if (!$server) {
            return;
        }

        if ($server->pterodactyl_server_id) {
            Log::info('Provision skipped, already has pterodactyl_server_id', [
                'server_id' => $server->id,
            ]);
            return;
        }

        // Mark provisioning
        $server->provision_status = 'provisioning';
        $server->save();

        try {
            $user = $server->user()->firstOrFail();

            // Ensure user exists on Pterodactyl and sync IDs locally
            if (!$user->pterodactyl_id) {
                $found = $ptero->findUserByEmail($user->email);

                if ($found) {
                    $user->pterodactyl_id = $found['id'];
                    $user->pterodactyl_uuid = $found['uuid'] ?? null;
                    $user->save();
                } else {
                    // Create if not found: random strong password (panel login not used)
                    $payload = $ptero->buildUserPayload(
                        $user->name ?: 'User',
                        $user->email,
                        Str::random(32)
                    );
                    $created = $ptero->createUser($payload);

                    $user->pterodactyl_id = $created['id'] ?? null;
                    $user->pterodactyl_uuid = $created['uuid'] ?? null;
                    $user->save();

                    if (!$user->pterodactyl_id) {
                        throw new \RuntimeException('Failed to create/find Pterodactyl user.');
                    }
                }
            }

            $planId = $server->plan_id;
            $gameId = $server->game;
            $region = $server->region;

            $resources = Config::get("plans.resources.$planId");
            if (!$resources) {
                throw new \RuntimeException("Missing resources config for plan: $planId");
            }

            $gameCfg = Config::get("games.$gameId");
            if (!$gameCfg) {
                throw new \RuntimeException("Missing game config for game: $gameId");
            }

            $regionCfg = Config::get("regions.$region");
            if (!$regionCfg) {
                throw new \RuntimeException("Missing region mapping for: $region");
            }

            // Determine variant (supports both multi-variant and legacy single config)
            $variantKey = $server->game_variant;
            $variants = $gameCfg['variants'] ?? null;

            if (is_array($variants) && count($variants) > 0) {
                $variantKey = $variantKey ?: array_key_first($variants);
                $variant = $variants[$variantKey] ?? null;
                if (!$variant) {
                    throw new \RuntimeException("Missing variant config for {$gameId}.{$variantKey}");
                }
            } else {
                // Legacy/no variants: treat full gameCfg as a single variant
                $variant = $gameCfg;
            }

            // Build external_id to ensure idempotency
            $externalId = "quark:server:{$server->id}";
            $server->external_id = $externalId;
            $server->save();

            // Check if already created under same external_id
            $existing = $ptero->findServerByExternalId($externalId);
            if ($existing) {
                $this->persistServerAttributes($server, $existing);
                $server->provision_status = 'provisioned';
                $server->status = 'active';
                $server->save();
                Log::info('Provision idempotent restore', [
                    'server_id' => $server->id,
                    'ptero_id' => $server->pterodactyl_server_id,
                ]);
                return;
            }

            // Build environment from variant config
            $env = [];
            foreach (($variant['env'] ?? []) as $k => $v) {
                $env[$k] = $this->interpolateEnv($v, $server);
            }

            // Basic payload for Pterodactyl Application API
            $payload = [
                'name' => $server->server_name,
                'user' => (int) $user->pterodactyl_id,
                'external_id' => $externalId,
                'description' => '',
                'egg' => (int) $variant['egg_id'],
                'environment' => $env,
                'limits' => [
                    'memory' => (int) $resources['memory_mb'],
                    'swap' => (int) ($resources['swap_mb'] ?? 0),
                    'disk' => (int) $resources['disk_mb'],
                    'io' => (int) ($resources['io'] ?? 500),
                    'cpu' => (int) $resources['cpu_percent'],
                ],
                'feature_limits' => [
                    'databases' => (int) ($resources['databases'] ?? 0),
                    'allocations' => (int) ($resources['allocations'] ?? 1),
                    'backups' => (int) ($resources['backups'] ?? 0),
                ],
                'deploy' => [
                    // Location-based deployment; Pterodactyl will auto-assign allocation
                    'locations' => [(int) $regionCfg['location_id']],
                    'dedicated_ip' => false,
                    'port_range' => [],
                ],
                'start_on_completion' => true,
            ];

            // Let panel defaults handle docker_image/startup unless provided
            if (!empty($variant['docker_image'])) {
                $payload['docker_image'] = $variant['docker_image'];
            }
            if (!empty($variant['startup'])) {
                $payload['startup'] = $variant['startup'];
            }

            Log::info('Ptero payload preview', ['payload' => $payload]);

            $created = $ptero->createServer($payload);

            $this->persistServerAttributes($server, $created);

            $server->provision_status = 'provisioned';
            $server->save();

            Log::info('Pterodactyl server provisioned', [
                'server_id' => $server->id,
                'ptero_id' => $server->pterodactyl_server_id,
            ]);
        } catch (Throwable $e) {
            Log::error('Provisioning failed: ' . $e->getMessage(), [
                'server_id' => $server->id,
                'trace' => $e->getTraceAsString(),
            ]);
            $server->provision_status = 'failed';
            $server->provision_error = $e->getMessage();
            $server->save();

            // rethrow to let queue retry
            throw $e;
        }
    }

    protected function interpolateEnv(string $value, Server $server): string
    {
        // Replace placeholders like {{SERVER_NAME}} and {{SERVER_MEMORY}}
        $map = [
            '{{SERVER_NAME}}' => $server->server_name,
            '{{SERVER_MEMORY}}' => (string) (config("plans.resources.{$server->plan_id}.memory_mb") ?? 1024),
        ];

        return strtr($value, $map);
    }

    protected function persistServerAttributes(Server $server, array $attrs): void
    {
        // Pterodactyl returns attributes with id, uuid, identifier, internal_id
        $server->pterodactyl_server_id = $attrs['id'] ?? $server->pterodactyl_server_id;
        $server->pterodactyl_uuid = $attrs['uuid'] ?? $server->pterodactyl_uuid;
        $server->pterodactyl_identifier = $attrs['identifier'] ?? $server->pterodactyl_identifier;
        $server->pterodactyl_internal_id = $attrs['internal_id'] ?? $server->pterodactyl_internal_id;
    }
}
