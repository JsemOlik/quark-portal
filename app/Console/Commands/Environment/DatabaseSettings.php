<?php

namespace App\Console\Commands\Environment;

use Illuminate\Console\Command;
use Illuminate\Contracts\Console\Kernel as ArtisanKernel;
use Illuminate\Database\DatabaseManager;
use Illuminate\Support\Str;
use PDOException;

class DatabaseSettings extends Command
{
    protected $description = 'Configure database settings.';
    protected $signature = 'p:environment:database
        {--driver= : Database driver: mysql|mariadb|pgsql|sqlite}
        {--host= : Host for MySQL/MariaDB/PostgreSQL}
        {--port= : Port for MySQL/MariaDB/PostgreSQL}
        {--database= : Database name (or sqlite file path)}
        {--username= : Username}
        {--password= : Password}
        {--sqlite-path= : Path to SQLite database file (overrides --database)}
    ';

    protected array $variables = [];

    public function __construct(
        private readonly DatabaseManager $database,
        private readonly ArtisanKernel $console
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        // 1) Choose driver
        $driver = strtolower((string) ($this->option('driver') ?? ''));
        $drivers = ['mysql', 'mariadb', 'pgsql', 'sqlite'];

        if (!in_array($driver, $drivers, true)) {
            if ($this->input->isInteractive()) {
                $driver = $this->choice(
                    'Select database driver',
                    ['mysql', 'mariadb', 'pgsql', 'sqlite'],
                    0
                );
            } else {
                $this->error('Please provide --driver=mysql|mariadb|pgsql|sqlite');
                return Command::FAILURE;
            }
        }

        // Normalize MariaDB to mysql in .env, but remember for defaults/ports
        $envDriver = $driver === 'mariadb' ? 'mysql' : $driver;

        $this->variables['DB_CONNECTION'] = $envDriver;

        if ($driver === 'sqlite') {
            $this->configureSqlite();
        } elseif ($driver === 'pgsql') {
            $this->configurePostgres();
        } else {
            $this->configureMySqlFamily($driver);
        }

        // Test connection if not sqlite
        if ($envDriver !== 'sqlite') {
            try {
                $this->testConnection($envDriver);
            } catch (PDOException $e) {
                $this->error(
                    sprintf(
                        'Unable to connect using provided credentials. Error: "%s".',
                        $e->getMessage()
                    )
                );
                $this->error('Credentials NOT saved.');

                if ($this->input->isInteractive() && $this->confirm('Try again?', true)) {
                    $this->database->disconnect('_env_command_test');
                    return $this->handle();
                }
                return Command::FAILURE;
            }
        }

        // Persist to .env
        $this->writeToEnvironment($this->variables);

        // Summary
        $this->line('');
        $this->info('Database configuration saved to .env');
        $this->line('Summary:');
        foreach ($this->variables as $k => $v) {
            if (str_contains($k, 'PASSWORD')) {
                $v = strlen((string) $v) ? '(hidden)' : '(empty)';
            } elseif ($k === 'DB_URL') {
                $v = '(generated)';
            }
            $this->line(" - {$k}={$v}");
        }

        // Apply config cache if present
        try {
            $this->callSilent('config:clear');
            if (file_exists(base_path('bootstrap/cache/config.php'))) {
                $this->callSilent('config:cache');
            }
        } catch (\Throwable $e) {
            // ignore
        }

        return Command::SUCCESS;
    }

    private function configureSqlite(): void
    {
        $defaultPath = database_path('database.sqlite');
        $pathOpt = $this->option('sqlite-path') ?? $this->option('database');

        $path = $pathOpt;
        if (!$path) {
            if ($this->input->isInteractive()) {
                $path = $this->ask('SQLite database path', $defaultPath);
            } else {
                $path = $defaultPath;
            }
        }

        // Ensure file exists or can be created
        if (!file_exists($path)) {
            try {
                @touch($path);
            } catch (\Throwable) {
                // ignore
            }
        }

        $this->variables['DB_DATABASE'] = $path;
        // Laravel typically needs DB_CONNECTION=sqlite and DB_DATABASE=/full/path
        unset(
            $this->variables['DB_HOST'],
            $this->variables['DB_PORT'],
            $this->variables['DB_USERNAME'],
            $this->variables['DB_PASSWORD']
        );
    }

    private function configurePostgres(): void
    {
        $cfg = config('database.connections.pgsql', []);

        $defaultHost = $cfg['host'] ?? '127.0.0.1';
        $defaultPort = (string) ($cfg['port'] ?? 5432);
        $defaultDb = $cfg['database'] ?? 'app';
        $defaultUser = $cfg['username'] ?? 'app';
        $existingPwd = (string) ($cfg['password'] ?? '');

        $this->variables['DB_HOST'] = $this->option('host') ?? $this->ask('PostgreSQL Host', $defaultHost);
        $this->variables['DB_PORT'] = $this->option('port') ?? $this->ask('PostgreSQL Port', $defaultPort);
        $this->variables['DB_DATABASE'] = $this->option('database') ?? $this->ask('PostgreSQL Database', $defaultDb);
        $this->variables['DB_USERNAME'] = $this->option('username') ?? $this->ask('PostgreSQL Username', $defaultUser);

        $askPwd = true;
        if (!empty($existingPwd) && $this->input->isInteractive()) {
            $this->variables['DB_PASSWORD'] = $existingPwd;
            $askPwd = $this->confirm('A PostgreSQL password is already set. Change it?', false);
        }
        if ($askPwd) {
            $this->variables['DB_PASSWORD'] = $this->option('password') ?? $this->secret('PostgreSQL Password');
        }
    }

    private function configureMySqlFamily(string $driver): void
    {
        $cfg = config('database.connections.mysql', []);
        $this->output->note(
            'Use "127.0.0.1" instead of "localhost" to avoid socket issues.'
        );
        $this->output->note(
            'Avoid using the "root" account. Use a dedicated user with limited privileges.'
        );

        $defaultHost = $cfg['host'] ?? '127.0.0.1';
        // MariaDB default port is often 3306 too; leave as 3306 unless you use 3307+
        $defaultPort = (string) ($cfg['port'] ?? 3306);
        $defaultDb = $cfg['database'] ?? 'app';
        $defaultUser = $cfg['username'] ?? 'app';
        $existingPwd = (string) ($cfg['password'] ?? '');

        $label = $driver === 'mariadb' ? 'MariaDB' : 'MySQL';

        $this->variables['DB_HOST'] = $this->option('host') ?? $this->ask("{$label} Host", $defaultHost);
        $this->variables['DB_PORT'] = $this->option('port') ?? $this->ask("{$label} Port", $defaultPort);
        $this->variables['DB_DATABASE'] = $this->option('database') ?? $this->ask("{$label} Database", $defaultDb);
        $this->variables['DB_USERNAME'] = $this->option('username') ?? $this->ask("{$label} Username", $defaultUser);

        $askPwd = true;
        if (!empty($existingPwd) && $this->input->isInteractive()) {
            $this->variables['DB_PASSWORD'] = $existingPwd;
            $askPwd = $this->confirm("A {$label} password is already set. Change it?", false);
        }
        if ($askPwd) {
            $this->variables['DB_PASSWORD'] = $this->option('password') ?? $this->secret("{$label} Password");
        }
    }

    private function testConnection(string $envDriver): void
    {
        $name = '_env_command_test';
        $conn = [
            'driver' => $envDriver,
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'strict' => true,
        ];

        if ($envDriver === 'pgsql') {
            $conn = array_merge($conn, [
                'host' => $this->variables['DB_HOST'] ?? '127.0.0.1',
                'port' => (int) ($this->variables['DB_PORT'] ?? 5432),
                'database' => $this->variables['DB_DATABASE'] ?? 'postgres',
                'username' => $this->variables['DB_USERNAME'] ?? 'postgres',
                'password' => (string) ($this->variables['DB_PASSWORD'] ?? ''),
            ]);
        } else { // mysql (also for mariadb)
            $conn = array_merge($conn, [
                'host' => $this->variables['DB_HOST'] ?? '127.0.0.1',
                'port' => (int) ($this->variables['DB_PORT'] ?? 3306),
                'database' => $this->variables['DB_DATABASE'] ?? 'mysql',
                'username' => $this->variables['DB_USERNAME'] ?? 'root',
                'password' => (string) ($this->variables['DB_PASSWORD'] ?? ''),
            ]);
        }

        config()->set("database.connections.{$name}", $conn);
        $this->database->connection($name)->getPdo();
        $this->database->disconnect($name);
    }

    private function writeToEnvironment(array $vars): void
    {
        $envPath = base_path('.env');
        if (!file_exists($envPath)) {
            $example = base_path('.env.example');
            if (file_exists($example)) {
                copy($example, $envPath);
            } else {
                touch($envPath);
            }
        }

        $env = file_get_contents($envPath) ?: '';

        foreach ($vars as $key => $value) {
            $value = $this->escapeEnvValue($value);

            if (preg_match("/^{$key}=.*/m", $env)) {
                $env = preg_replace("/^{$key}=.*/m", "{$key}={$value}", $env);
            } else {
                $env .= (Str::endsWith($env, PHP_EOL) ? '' : PHP_EOL) . "{$key}={$value}" . PHP_EOL;
            }
        }

        file_put_contents($envPath, $env);
    }

    private function escapeEnvValue(mixed $value): string
    {
        $str = (string) $value;
        if ($str === '') {
            return '';
        }

        if (preg_match('/\s|[#\$`\'"]/', $str)) {
            $escaped = str_replace('"', '\"', $str);
            return "\"{$escaped}\"";
        }

        return $str;
    }
}
