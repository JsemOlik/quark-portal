# ---- Frontend build stage ----
FROM node:20 AS node-builder
WORKDIR /app

# Copy lockfiles for best caching
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Install deps (auto-detects your lockfile)
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then corepack enable && yarn install --frozen-lockfile; \
    else npm i; fi

# Copy rest of the repository (for Tailwind, Vite config, resources, etc.)
COPY . .

# Build production assets (ensure "build" exists in package.json)
# Example script: "build": "vite build"
RUN npm run build

# ---- PHP + Apache stage ----
FROM php:8.4-apache

# System packages
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# PHP extensions
RUN docker-php-ext-install pdo_pgsql zip bcmath

# Set working directory
WORKDIR /var/www/html

# Copy only composer files first for caching
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

# Copy application code
COPY . .

# Copy built Vite assets from node stage
COPY --from=node-builder /app/public/build ./public/build

# Permissions for Laravel
RUN chown -R www-data:www-data storage bootstrap/cache \
    && find storage -type d -exec chmod 775 {} \; \
    && find storage -type f -exec chmod 664 {} \; \
    && chmod -R 775 bootstrap/cache

# Run composer scripts now that artisan exists
RUN composer dump-autoload -o \
    && composer run-script post-autoload-dump || true

# Expose Apache
EXPOSE 80

# Optional: set DocumentRoot to public (the default for official image is /var/www/html)
# If needed, ensure your VirtualHost points to /var/www/html/public
