{{-- resources/views/errors/404.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>404 Not Found</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen bg-brand-brown text-[rgb(255,245,235)] dark:bg-brand-brown">
    <main class="min-h-screen w-full flex items-center justify-center px-4">
        <div class="w-full max-w-2xl text-center">
            <div class="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-brand-cream/80">
                301 • Moved Permanently
            </div>

            <h1 class="text-4xl font-extrabold tracking-tight text-brand-cream">
                Uh oh, you’ve been misled!
            </h1>

            <p class="mt-3 text-brand-cream/80">
                The resource you’re looking for has been moved to a new URL.
            </p>

            <div class="mt-6">
                <a href="{{ url('/') }}"
                   class="mr-2 inline-flex items-center gap-2 rounded-xl bg-brand-cream/5 text-brand-cream px-4 py-3 text-sm font-semibold hover:bg-brand-cream/10 transition-colors border border-brand-cream/50">
                    Back to Store
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
                <a href="{{ url('/dashboard') }}"
                   class="inline-flex items-center gap-2 rounded-xl bg-brand text-brand-brown px-4 py-3 text-sm font-semibold hover:bg-brand/90 transition-colors">
                    Back to Dashboard
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
            </div>
        </div>
    </main>
</body>
</html>
