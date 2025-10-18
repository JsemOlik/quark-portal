# ---- Node deps stage (cache node_modules) ----
FROM node:20 AS node-deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then corepack enable && yarn install --frozen-lockfile; \
    else npm i; fi

# ---- PHP + Apache stage ----
FROM php:8.4-apache

# System packages for extensions
RUN apt-get update && apt-get install -y \
    curl ca-certificates git unzip \
    libpq-dev libzip-dev libicu-dev libxml2-dev zlib1g-dev libonig-dev pkg-config \
  && rm -rf /var/lib/apt/lists/*

RUN a2enmod rewrite

# PHP extensions
RUN docker-php-ext-install pdo_pgsql zip bcmath mbstring intl \
  && docker-php-ext-enable intl

# Node.js (for Vite build)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get update && apt-get install -y nodejs \
  && node -v && npm -v

WORKDIR /var/www/html

# 1) Copy only composer manifests first to leverage layer cache
COPY composer.json composer.lock ./

# 2) Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- \
  --install-dir=/usr/local/bin --filename=composer

# 3) Install PHP deps early (no app code yet -> good cache).
#    If your composer.json runs scripts requiring app files, use --no-scripts here,
#    then run a second composer install after copying the app.
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader --no-scripts

# 4) Copy app code
COPY . .

# 5) If you used --no-scripts above, run a second pass to execute scripts
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader

# 6) Ensure .env exists AFTER vendor is present, then run artisan
RUN [ -f .env ] || cp .env.example .env
RUN php artisan key:generate --force

# Optional: only if this command exists in your app
# RUN php artisan wayfinder:generate --with-form || true

# 7) Frontend build
COPY --from=node-deps /app/node_modules ./node_modules
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm run build

# 8) Permissions and caches
RUN chown -R www-data:www-data storage bootstrap/cache \
  && find storage -type d -exec chmod 775 {} \; \
  && find storage -type f -exec chmod 664 {} \; \
  && chmod -R 775 bootstrap/cache

RUN composer dump-autoload -o || true
RUN php artisan config:cache && php artisan route:cache && php artisan view:cache

EXPOSE 80
