<!DOCTYPE html>
<?php
// Preload maintenance payload from storage/framework/down
$customMessage = 'We are performing maintenance. Please try again later.';
$retryAfter = null;
$endsAtIso = null;
$timezone = config('app.timezone', 'UTC');
$debugKeys = [];

try {
    $downFile = storage_path('framework/down');
    if (file_exists($downFile)) {
        $d = json_decode((string) file_get_contents($downFile), true) ?: [];
        $debugKeys = array_keys($d);

        if (!empty($d['custom_message'])) {
            $customMessage = (string) $d['custom_message'];
        }
        if (isset($d['retry'])) {
            $retryAfter = (int) $d['retry'];
        }
        // Prefer ends_at (ISO), fallback to time (UNIX timestamp)
        if (!empty($d['ends_at'])) {
            $endsAtIso = (string) $d['ends_at'];
        } elseif (!empty($d['time'])) {
            $endsAtIso = date('c', (int) $d['time']);
        }
        if (!empty($d['timezone'])) {
            $timezone = (string) $d['timezone'];
        }
    }
} catch (\Throwable $e) {
    // Ignore and use defaults
}

$endsAtDisplay = null;
if ($endsAtIso) {
    try {
        $dt = new DateTimeImmutable($endsAtIso);
        // If you prefer local app timezone display, you could convert:
        // $tzObj = new DateTimeZone($timezone);
        // $dt = $dt->setTimezone($tzObj);
        $endsAtDisplay = $dt->format('Y-m-d H:i:s') . ' ' . $timezone;
    } catch (\Throwable $e) {
        $endsAtDisplay = null;
    }
}
?>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>We’ll be back soon</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen bg-brand-brown text-[rgb(255,245,235)] dark:bg-brand-brown">
    <main class="min-h-screen w-full flex items-center justify-center px-4">
        <div class="w-full max-w-2xl text-center">
            <div class="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-brand-cream/80">
                503 • Scheduled Maintenance
            </div>

            <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-brand-cream">
                We’ll be back soon
            </h1>

            <p class="mt-3 text-brand-cream/80">
                <?= htmlspecialchars($customMessage, ENT_QUOTES, 'UTF-8') ?>
            </p>

            <?php if ($endsAtDisplay): ?>
                <p class="mt-2 text-sm text-brand-cream/70">
                    Expected to be back by:
                    <span class="font-semibold text-brand">
                        <?= htmlspecialchars($endsAtDisplay, ENT_QUOTES, 'UTF-8') ?>
                    </span>
                </p>
            <?php else: ?>
                <p class="mt-2 text-sm text-brand-cream/70">
                    We don't know when we'll be back yet, but we are trying our best!
                </p>
            <?php endif; ?>

            <?php if (!empty($retryAfter)) : ?>
                <p class="mt-2 text-xs text-brand-cream/60">
                    Retry-After:
                    <code class="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5">
                        <?= (int) $retryAfter ?> seconds
                    </code>
                </p>
            <?php endif; ?>

            <div class="mt-6">
                <a href="{{ url('/status') }}"
                   class="mr-2 inline-flex items-center gap-2 rounded-xl bg-brand-cream/5 text-brand-cream px-4 py-3 text-sm font-semibold hover:bg-brand-cream/10 transition-colors border border-brand-cream/50">w
                    View Status Page
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
                <a href="{{ url('/dashboard') }}"
                   class="inline-flex items-center gap-2 rounded-xl bg-brand text-brand-brown px-4 py-3 text-sm font-semibold hover:bg-brand/90 transition-colors">
                    Join the Discord
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
            </div>
        </div>
    </main>
</body>
</html>
