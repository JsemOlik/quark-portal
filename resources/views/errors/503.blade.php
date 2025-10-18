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
        $endsAtDisplay = $dt->format('Y-m-d H:i:s') . ' ' . $timezone;
    } catch (\Throwable $e) {
        $endsAtDisplay = null;
    }
}
?>
<!-- Debug: keys in down file: <?= htmlspecialchars(implode(', ', $debugKeys), ENT_QUOTES, 'UTF-8') ?> -->
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>We’ll be back soon</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
        :root { color-scheme: light dark; }
        html, body {
            height: 100%;
            margin: 0;
            font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell,
                Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji",
                "Segoe UI Emoji", "Segoe UI Symbol";
            background: #0b0f17;
            color: #ffeedd;
        }
        .wrap { min-height: 100%; display: grid; place-items: center; padding: 2rem; }
        .card {
            max-width: 720px; width: 100%;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,.35);
            backdrop-filter: blur(6px);
        }
        .badge {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 6px 10px;
            border-radius: 999px;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.12);
            color: rgba(255, 245, 235, 0.85);
            font-weight: 700; font-size: 12px; letter-spacing: 0.02em;
        }
        h1 { margin: 10px 0 8px; font-size: 28px; line-height: 1.2; color: #fff5eb; }
        p { margin: 8px 0; line-height: 1.6; color: rgba(255,245,235,0.85); }
        .muted { color: rgba(255,245,235,0.7); font-size: 0.95rem; }
        code {
            background: rgba(255,255,255,0.06);
            padding: 2px 6px; border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.12);
            color: #fff5eb;
        }
        .btns { margin-top: 16px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .btn {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 10px 14px; border-radius: 12px; font-weight: 700; font-size: 14px;
            text-decoration: none; transition: all .15s ease;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .btn.primary {
            background: #ffd166; color: #2b2119; border-color: #ffd166;
        }
        .btn.primary:hover { background: #ffc640; }
        .btn.ghost {
            background: rgba(255,255,255,0.06); color: #fff5eb;
        }
        .btn.ghost:hover { background: rgba(255,255,255,0.1); }
        .footer { margin-top: 16px; color: rgba(255,245,235,0.65); font-size: 0.85rem; }
        .arrow { width: 16px; height: 16px; }
    </style>
</head>
<body>
<div class="wrap">
    <div class="card">
        <span class="badge">503 • Scheduled Maintenance</span>
        <h1>We’ll be back soon</h1>

        <p><?= htmlspecialchars($customMessage, ENT_QUOTES, 'UTF-8') ?></p>

        <?php if ($endsAtDisplay): ?>
            <p class="muted">
                Expected to be back by:
                <strong><?= htmlspecialchars($endsAtDisplay, ENT_QUOTES, 'UTF-8') ?></strong>
            </p>
        <?php else: ?>
            <p class="muted">We don't know when we'll be back yet, but we are trying our best!</p>
        <?php endif; ?>

        <?php if (!empty($retryAfter)) : ?>
            <p class="muted">
                Retry-After: <code><?= (int) $retryAfter ?> seconds</code>
            </p>
        <?php endif; ?>

        <div class="btns">
            <a href="<?= htmlspecialchars(url('/status'), ENT_QUOTES, 'UTF-8') ?>" class="btn ghost">
                View Status Page
                <svg class="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </a>
            <a href="https://discord.gg/" class="btn primary">
                Join the Discord
                <svg class="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </a>
        </div>

        <?php if (config('app.name')) : ?>
            <div class="footer"><?= htmlspecialchars(config('app.name'), ENT_QUOTES, 'UTF-8') ?></div>
        <?php endif; ?>
    </div>
</div>
</body>
</html>
