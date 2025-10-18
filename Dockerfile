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
RUN curl -sS https://getcomposer.org/installer | php -- \
  --install-dir=/usr/local/bin --filename=composer

# Install deps WITHOUT scripts so it won't call artisan yet
RUN composer install \
  --no-dev --prefer-dist --no-interaction --optimize-autoloader --no-scripts

# Copy app
COPY . .

# Ensure .env exists and contains safe defaults so service constructors don't blow up
# Use envsubst-like sed to ensure required keys exist with dummy values
RUN [ -f .env ] || cp .env.example .env \
  && sed -i 's#^APP_ENV=.*#APP_ENV=production#' .env || true \
  && grep -q '^APP_KEY=' .env || echo 'APP_KEY=base64:FAKEKEYFORBUILDONLY=' >> .env \
  && grep -q '^PTERO_APP_KEY=' .env || echo 'PTERO_APP_KEY=dummy_key' >> .env \
  && grep -q '^PTERO_URL=' .env || echo 'PTERO_URL=http://localhost' >> .env

# Now run composer scripts (if you need them)
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader

# Now artisan can run safely
RUN php artisan key:generate --force || true
# If you have custom commands that might not exist in all branches, guard with "|| true"
# RUN php artisan wayfinder:generate --with-form || true

# Frontend build
COPY --from=node-deps /app/node_modules ./node_modules
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm run build

# Permissions/caches
RUN chown -R www-data:www-data storage bootstrap/cache \
  && find storage -type d -exec chmod 775 {} \; \
  && find storage -type f -exec chmod 664 {} \; \
  && chmod -R 775 bootstrap/cache

RUN php artisan config:cache && php artisan route:cache && php artisan view:cache || true

EXPOSE 80
