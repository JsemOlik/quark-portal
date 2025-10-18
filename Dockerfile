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

# System packages
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    libpq-dev \
    libzip-dev \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# PHP extensions
RUN docker-php-ext-install pdo_pgsql zip bcmath

# Install Node.js (using NodeSource for Node 20)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get update && apt-get install -y nodejs \
    && node -v && npm -v

# Workdir
WORKDIR /var/www/html

# Composer caching
COPY composer.json composer.lock ./

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- \
    --install-dir=/usr/local/bin --filename=composer

# Install PHP deps without scripts (artisan not present yet)
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --optimize-autoloader \
    --no-scripts

# Copy application code (provides artisan)
COPY . .

# Bring node_modules from node-deps for faster build
COPY --from=node-deps /app/node_modules ./node_modules
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Build frontend assets now that php/artisan exists
RUN npm run build

# Permissions for Laravel
RUN chown -R www-data:www-data storage bootstrap/cache \
    && find storage -type d -exec chmod 775 {} \; \
    && find storage -type f -exec chmod 664 {} \; \
    && chmod -R 775 bootstrap/cache

# Composer scripts after artisan exists
RUN composer dump-autoload -o \
    && composer run-script post-autoload-dump || true

RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

EXPOSE 80
