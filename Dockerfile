# ---- Node deps stage (cache node_modules) ----
FROM node:20 AS node-deps
WORKDIR /app

# Copy lockfiles for deterministic installs
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Install deps (auto-detect lockfile)
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then corepack enable && yarn install --frozen-lockfile; \
    else npm i; fi

# ---- PHP + Apache stage ----
FROM php:8.4-apache

# System packages (added libicu-dev, libxml2-dev, zlib1g-dev for intl/mbstring building)
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    libpq-dev \
    libzip-dev \
    unzip \
    git \
    libicu-dev \
    libxml2-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# PHP extensions (added mbstring and intl)
RUN docker-php-ext-install pdo_pgsql zip bcmath mbstring intl \
    && docker-php-ext-enable intl

# Install Node.js (using NodeSource for Node 20)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get update && apt-get install -y nodejs \
    && node -v && npm -v

# Workdir
WORKDIR /var/www/html

# Composer caching - copy composer manifest first (still used as cache layer)
COPY composer.json composer.lock ./

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- \
    --install-dir=/usr/local/bin --filename=composer

# NOTE: do a lightweight composer install here if you want to cache vendor,
# but it's important to run the *final* composer install after the app files are present.
# We'll skip a full install here to ensure correct scripts run after app files are copied.

# Copy application code (provides artisan)
COPY . .

# Bring node_modules from node-deps for faster build
COPY --from=node-deps /app/node_modules ./node_modules
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Ensure .env exists and APP_KEY is generated before any artisan commands run
RUN if [ ! -f .env ]; then cp .env.example .env; fi \
    && php -r "file_exists('.env') || copy('.env.example', '.env');" \
    && php artisan key:generate --force

# Now install PHP dependencies with scripts enabled (so packages that require composer scripts can run)
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --optimize-autoloader

# (Optional) If Wayfinder needs DB or other setup, do minimal setup here (migrations/seeds) — comment out if not needed.
# RUN php artisan migrate --force

# Generate Wayfinder types ahead of the Vite build to avoid plugin-triggered failures
# This ensures the artisan command succeeds in advance of npm build.
RUN php artisan wayfinder:generate --with-form

# Build frontend assets now that php/artisan exists and environment is ready
RUN npm run build

# Permissions for Laravel
RUN chown -R www-data:www-data storage bootstrap/cache \
    && find storage -type d -exec chmod 775 {} \; \
    && find storage -type f -exec chmod 664 {} \; \
    && chmod -R 775 bootstrap/cache

# Composer scripts / optimization after artisan exists
RUN composer dump-autoload -o \
    && composer run-script post-autoload-dump || true

RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

EXPOSE 80
