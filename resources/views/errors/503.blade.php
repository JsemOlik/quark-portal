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
            color: #e6edf3;
        }
        .wrap { min-height: 100%; display: grid; place-items: center; padding: 2rem; }
        .card {
            max-width: 720px; width: 100%;
            background: #111827; border: 1px solid #1f2937; border-radius: 12px;
            padding: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,.3);
        }
        h1 { margin: 0 0 0.75rem; font-size: 1.75rem; }
        p { margin: 0.5rem 0; line-height: 1.6; color: #c7d2fe; }
        .muted { color: #9ca3af; font-size: 0.95rem; }
        code { background: #0b1220; padding: 0.1rem 0.35rem; border-radius: 6px; border: 1px solid #1f2a44; }
        .footer { margin-top: 1.25rem; color: #6b7280; font-size: 0.85rem; }
    </style>
</head>
<body>
<div class="wrap">
    <div class="card">
        <h1>Scheduled Maintenance</h1>
        <p><?= htmlspecialchars($customMessage, ENT_QUOTES, 'UTF-8') ?></p>

        <?php if ($endsAtDisplay): ?>
            <p class="muted">
                Expected to be back by:
                <strong><?= htmlspecialchars($endsAtDisplay, ENT_QUOTES, 'UTF-8') ?></strong>
            </p>
        <?php else: ?>
            <p class="muted">We don't know yet, but we are trying our best!</p>
        <?php endif; ?>

        <?php if (!empty($retryAfter)) : ?>
            <p class="muted">Retry-After: <code><?= (int) $retryAfter ?> seconds</code></p>
        <?php endif; ?>

        <?php if (config('app.name')) : ?>
            <div class="footer"><?= htmlspecialchars(config('app.name'), ENT_QUOTES, 'UTF-8') ?></div>
        <?php endif; ?>
    </div>
</div>
</body>
</html>
