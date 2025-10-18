<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnforceMaintenance
{
    public function __construct(private readonly Application $app)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        if ($this->isApi($request) && $this->app->isDownForMaintenance()) {
            $payload = [
                'message' => 'Service under maintenance. Please try again later.',
                'retry_after' => $this->retryAfterSeconds(),
            ];
            return new JsonResponse($payload, 503, [
                'Retry-After' => (string) $payload['retry_after'],
            ]);
        }

        return $next($request);
    }

    private function isApi(Request $request): bool
    {
        return str_starts_with($request->path(), 'api');
    }

    private function retryAfterSeconds(): int
    {
        $path = storage_path('framework/down');
        if (!file_exists($path)) {
            return 60;
        }

        $data = json_decode((string) file_get_contents($path), true);
        return isset($data['retry']) ? (int) $data['retry'] : 60;
    }
}
