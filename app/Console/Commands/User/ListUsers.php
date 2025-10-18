<?php

namespace App\Console\Commands\User;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class ListUsers extends Command
{
    protected $signature = 'p:user:list
        {--search= : Filter by name or email (case-insensitive)}
        {--admin= : Filter by admin status: yes|no}
        {--verified= : Filter by email verification: yes|no}
        {--sort=created_at : Sort by column: id|name|email|created_at|updated_at}
        {--order=desc : Sort order: asc|desc}
        {--page=1 : Page number (for pagination)}
        {--per-page=25 : Results per page}
        {--format=table : Output format: table|json|ndjson|csv}
    ';

    protected $description = 'List users with filtering, sorting, and formatting options.';

    public function handle(): int
    {
        $query = User::query();

        // Filters
        $search = $this->option('search');
        if ($search) {
            $like = '%' . str_replace(['%', '_'], ['\\%', '\\_'], $search) . '%';
            $query->where(function ($q) use ($like) {
                $q->where('name', 'like', $like)
                    ->orWhere('email', 'like', $like);
            });
        }

        $adminOpt = $this->normalizeYesNo($this->option('admin'));
        if ($adminOpt !== null) {
            $query->where('is_admin', $adminOpt);
        }

        $verifiedOpt = $this->normalizeYesNo($this->option('verified'));
        if ($verifiedOpt !== null) {
            if ($verifiedOpt) {
                $query->whereNotNull('email_verified_at');
            } else {
                $query->whereNull('email_verified_at');
            }
        }

        // Sorting
        $sort = (string) $this->option('sort');
        $order = strtolower((string) $this->option('order')) === 'asc' ? 'asc' : 'desc';

        $allowedSorts = ['id', 'name', 'email', 'created_at', 'updated_at'];
        if (!in_array($sort, $allowedSorts, true)) {
            $this->warn("Invalid --sort value '{$sort}'. Falling back to 'created_at'.");
            $sort = 'created_at';
        }
        $query->orderBy($sort, $order);

        // Pagination
        $page = max(1, (int) $this->option('page'));
        $perPage = max(1, min(1000, (int) $this->option('per-page')));
        $total = (clone $query)->count();
        $results = $query
            ->forPage($page, $perPage)
            ->get([
                'id',
                'name',
                'email',
                'is_admin',
                'email_verified_at',
                'created_at',
                'updated_at',
            ]);

        $format = strtolower((string) $this->option('format'));
        switch ($format) {
            case 'json':
                return $this->outputJson($results, $total, $page, $perPage);
            case 'ndjson':
                return $this->outputNdjson($results, $total, $page, $perPage);
            case 'csv':
                return $this->outputCsv($results, $total, $page, $perPage);
            case 'table':
            default:
                return $this->outputTable($results, $total, $page, $perPage, $sort, $order, $search, $adminOpt, $verifiedOpt);
        }
    }

    private function outputTable($results, int $total, int $page, int $perPage, string $sort, string $order, ?string $search, ?bool $admin, ?bool $verified): int
    {
        $headers = ['ID', 'Name', 'Email', 'Admin', 'Verified', 'Created', 'Updated'];
        $rows = $results->map(function ($u) {
            return [
                $u->id,
                $u->name,
                $u->email,
                $u->is_admin ? 'yes' : 'no',
                $u->email_verified_at ? 'yes' : 'no',
                optional($u->created_at)->format('Y-m-d H:i'),
                optional($u->updated_at)->format('Y-m-d H:i'),
            ];
        })->toArray();

        // Header info
        $this->info('Users');
        $filters = [];
        if ($search) {
            $filters[] = "search=\"{$search}\"";
        }
        if ($admin !== null) {
            $filters[] = 'admin=' . ($admin ? 'yes' : 'no');
        }
        if ($verified !== null) {
            $filters[] = 'verified=' . ($verified ? 'yes' : 'no');
        }
        $filters[] = "sort={$sort}";
        $filters[] = "order={$order}";
        $filters[] = "page={$page}";
        $filters[] = "perPage={$perPage}";

        $this->line(' - ' . implode(' | ', $filters));
        $from = ($page - 1) * $perPage + 1;
        $to = min($from + $perPage - 1, $total);
        $this->line(" - showing {$from}-{$to} of {$total}");

        $this->table($headers, $rows);

        return Command::SUCCESS;
    }

    private function outputJson($results, int $total, int $page, int $perPage): int
    {
        $payload = [
            'meta' => [
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'count' => $results->count(),
            ],
            'data' => $results->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'is_admin' => (bool) $u->is_admin,
                'email_verified' => (bool) $u->email_verified_at,
                'created_at' => optional($u->created_at)->toIso8601String(),
                'updated_at' => optional($u->updated_at)->toIso8601String(),
            ])->toArray(),
        ];

        $this->line(json_encode($payload, JSON_PRETTY_PRINT));
        return Command::SUCCESS;
    }

    private function outputNdjson($results, int $total, int $page, int $perPage): int
    {
        $meta = [
            'meta' => [
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'count' => $results->count(),
            ],
        ];
        $this->line(json_encode($meta));

        foreach ($results as $u) {
            $this->line(json_encode([
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'is_admin' => (bool) $u->is_admin,
                'email_verified' => (bool) $u->email_verified_at,
                'created_at' => optional($u->created_at)->toIso8601String(),
                'updated_at' => optional($u->updated_at)->toIso8601String(),
            ]));
        }

        return Command::SUCCESS;
    }

    private function outputCsv($results, int $total, int $page, int $perPage): int
    {
        // Print header
        $header = ['id', 'name', 'email', 'is_admin', 'email_verified', 'created_at', 'updated_at'];
        $this->line(implode(',', $header));

        foreach ($results as $u) {
            $row = [
                $u->id,
                $this->csvEscape($u->name),
                $this->csvEscape($u->email),
                $u->is_admin ? '1' : '0',
                $u->email_verified_at ? '1' : '0',
                optional($u->created_at)->toIso8601String(),
                optional($u->updated_at)->toIso8601String(),
            ];
            $this->line(implode(',', $row));
        }

        // Footer as comment-like line (optional)
        $this->line('# total=' . $total . ', page=' . $page . ', per_page=' . $perPage);
        return Command::SUCCESS;
    }

    private function csvEscape(?string $value): string
    {
        $v = (string) $value;
        $needsQuotes = Str::contains($v, [',', '"', "\n", "\r"]);
        if ($needsQuotes) {
            $v = '"' . str_replace('"', '""', $v) . '"';
        }
        return $v;
    }

    private function normalizeYesNo($val): ?bool
    {
        if ($val === null) {
            return null;
        }

        $v = strtolower((string) $val);
        return match ($v) {
            '1', 'y', 'yes', 'true' => true,
            '0', 'n', 'no', 'false' => false,
            default => null,
        };
    }
}
