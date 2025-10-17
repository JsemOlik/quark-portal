FROM php:8.4-apache

# Install system deps
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Install PHP extensions
# - pdo_pgsql: for PostgreSQL
# - zip: for Composer packages
# - bcmath: required by moneyphp/money
RUN docker-php-ext-install pdo_pgsql zip bcmath

# Set working directory
WORKDIR /var/www/html

# Copy only composer files first to leverage caching
COPY composer.json composer.lock ./

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- \
    --install-dir=/usr/local/bin --filename=composer

# Install PHP deps without dev for production
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader

# Now copy the rest of the app
COPY . .

# Fix permissions (Laravel storage/bootstrap/cache)
RUN chown -R www-data:www-data storage bootstrap/cache \
    && find storage -type d -exec chmod 775 {} \; \
    && find storage -type f -exec chmod 664 {} \; \
    && chmod -R 775 bootstrap/cache

# Expose Apache
EXPOSE 80
