# ====== Builder: install composer deps without dev ======
FROM php:8.4-fpm AS builder

# System deps required for composer and common PHP extensions
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions (common for Laravel)
RUN docker-php-ext-install pdo_mysql zip

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy composer files first to leverage layer caching
COPY composer.json composer.lock ./

# Install production deps (no dev, no scripts yet to avoid needing app code)
RUN composer install --no-dev --no-interaction --prefer-dist --no-scripts --no-progress

# Now copy the rest of the app and run post-install scripts
COPY . .

# Run scripts now that app code exists (optimize autoload)
RUN composer dump-autoload --optimize

# ====== Runtime: nginx + php-fpm supervised with s6-overlay ======
FROM php:8.4-fpm AS runtime

# Install s6-overlay and nginx + deps
ENV S6_OVERLAY_VERSION=3.2.0.2
RUN apt-get update && apt-get install -y \
    nginx curl ca-certificates libzip-dev \
    && rm -rf /var/lib/apt/lists/* \
    && curl -sSL -o /tmp/s6-overlay.tar.gz \
      https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-noarch.tar.xz \
    && curl -sSL -o /tmp/s6-overlay-arch.tar.gz \
      https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-$(arch).tar.xz \
    && apt-get clean

# Extract s6-overlay
RUN tar -C / -Jxpf /tmp/s6-overlay-noarch.tar.xz && \
    tar -C / -Jxpf /tmp/s6-overlay-$(arch).tar.xz && \
    rm -f /tmp/s6-overlay-noarch.tar.xz /tmp/s6-overlay-$(arch).tar.xz

# Install PHP extensions same as builder
RUN docker-php-ext-install pdo_mysql zip

# Copy built app from builder
WORKDIR /var/www/html
COPY --from=builder /var/www/html /var/www/html

# Configure PHP-FPM for production
RUN { \
      echo "cgi.fix_pathinfo=0"; \
      echo "opcache.enable=1"; \
      echo "opcache.enable_cli=0"; \
      echo "opcache.jit=1255"; \
      echo "opcache.jit_buffer_size=64M"; \
      echo "opcache.validate_timestamps=0"; \
    } > /usr/local/etc/php/conf.d/opcache.ini

# Nginx config
RUN rm -f /etc/nginx/sites-enabled/default
COPY ./deploy/nginx/laravel.conf /etc/nginx/conf.d/laravel.conf

# Permissions (Laravel storage and cache)
RUN chown -R www-data:www-data storage bootstrap/cache && \
    find storage -type d -exec chmod 775 {} \; && \
    find storage -type f -exec chmod 664 {} \; && \
    chmod -R 775 bootstrap/cache

# s6 services: nginx and php-fpm
# php-fpm service
RUN mkdir -p /etc/s6-overlay/s6-rc.d/php-fpm /etc/s6-overlay/s6-rc.d/user/contents.d
RUN bash -lc 'cat > /etc/s6-overlay/s6-rc.d/php-fpm/type <<EOF
longrun
EOF'
RUN bash -lc 'cat > /etc/s6-overlay/s6-rc.d/php-fpm/run <<EOF
#!/usr/bin/execlineb -P
php-fpm -F
EOF' && chmod +x /etc/s6-overlay/s6-rc.d/php-fpm/run
RUN bash -lc 'echo php-fpm > /etc/s6-overlay/s6-rc.d/user/contents.d/php-fpm'

# nginx service
RUN mkdir -p /etc/s6-overlay/s6-rc.d/nginx
RUN bash -lc 'cat > /etc/s6-overlay/s6-rc.d/nginx/type <<EOF
longrun
EOF'
RUN bash -lc 'cat > /etc/s6-overlay/s6-rc.d/nginx/run <<EOF
#!/usr/bin/execlineb -P
nginx -g "daemon off;"
EOF' && chmod +x /etc/s6-overlay/s6-rc.d/nginx/run
RUN bash -lc 'echo nginx > /etc/s6-overlay/s6-rc.d/user/contents.d/nginx'

# Expose port
EXPOSE 80

# Ensure correct working dir
WORKDIR /var/www/html

# Start s6 which manages both nginx and php-fpm
ENTRYPOINT ["/init"]
