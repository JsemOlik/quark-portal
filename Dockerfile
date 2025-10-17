FROM php:8.4-apache

# System packages
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite for Laravel
RUN a2enmod rewrite

# PHP extensions
# - pdo_pgsql: PostgreSQL support
# - zip: for Composer packages
# - bcmath: required by moneyphp/money (Laravel Cashier dependency)
RUN docker-php-ext-install pdo_pgsql zip bcmath

# Workdir
WORKDIR /var/www/html

# Copy only composer files first (better build caching)
COPY composer.json composer.lock ./

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- \
    --install-dir=/usr/local/bin --filename=composer

# Install dependencies without running scripts yet (artisan not present)
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --optimize-autoloader \
    --no-scripts

# Now copy the rest of the app so artisan is available
COPY . .

# Permissions for Laravel
RUN chown -R www-data:www-data storage bootstrap/cache \
    && find storage -type d -exec chmod 775 {} \; \
    && find storage -type f -exec chmod 664 {} \; \
    && chmod -R 775 bootstrap/cache

# Now that artisan exists, run post-autoload scripts
# If your app needs env variables to discover packages, you can keep || true.
RUN composer dump-autoload -o \
    && composer run-script post-autoload-dump || true

# Expose Apache
EXPOSE 80
