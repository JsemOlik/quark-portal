# Quark Portal — Laravel (Inertia + React) on Ubuntu with NGINX (No SSL)

This guide walks you through deploying the Quark Portal on Ubuntu Server using NGINX without SSL.

If you plan to use SSL later, you can add it with Let’s Encrypt/Caddy/nginx
TLS, but this document focuses on a simple HTTP-only setup for local networks
or behind a reverse proxy.

Note: Quark does not support most OpenVZ systems due to Docker incompatibilities.

## Supported Environment

- OS: Ubuntu 22.04 or 24.04 (recommended)
- Web Server: NGINX
- PHP: 8.4 (FPM)
- Database: MySQL 8+ or MariaDB 10.6+ (or SQLite for simple setups)
- Cache/Queue: Redis (recommended)
- Node.js: 18+ (for building frontend assets)
- Composer: v2

## 1) System Update and Base Packages

```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install software-properties-common curl apt-transport-https \
  ca-certificates gnupg lsb-release
```

## 2) Install PHP 8.4, NGINX, MariaDB/MySQL, Redis

On Ubuntu 22.04, you may need the PHP PPA:

```bash
# Only needed on 22.04
sudo add-apt-repository -y ppa:ondrej/php
sudo apt update
```

Install runtime dependencies:

```bash
sudo apt -y install nginx mariadb-server redis-server git unzip tar
sudo apt -y install php8.4 php8.4-fpm php8.4-cli php8.4-common php8.4-mysql \
  php8.4-mbstring php8.4-bcmath php8.4-xml php8.4-curl php8.4-zip php8.4-gd
```

Enable services:

```bash
sudo systemctl enable --now nginx
sudo systemctl enable --now mariadb
sudo systemctl enable --now redis-server
```

Secure MariaDB (optional but recommended):

```bash
sudo mysql_secure_installation
```

## 3) Create Database and User

Connect to MariaDB/MySQL:

```bash
sudo mariadb
# or
# mysql -u root -p
```

Inside the SQL shell:

```sql
CREATE DATABASE quark_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'quark'@'127.0.0.1' IDENTIFIED BY 'change-this-strong-password';
GRANT ALL PRIVILEGES ON quark_portal.* TO 'quark'@'127.0.0.1';
FLUSH PRIVILEGES;
EXIT;
```

## 4) Install Composer

```bash
curl -sS https://getcomposer.org/installer | sudo php \
  -- --install-dir=/usr/local/bin --filename=composer
```

## 5) Deploy the Quark Portal Code

Choose a web root:

```bash
sudo mkdir -p /var/www/quark
sudo chown -R $USER:$USER /var/www/quark
cd /var/www/quark
```

Clone your repository:

```bash
git clone https://github.com/jsemolik/quark-frontend.git .
```

Install PHP dependencies:

```bash
COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --optimize-autoloader
```

Install Node dependencies and build assets:

```bash
# Install Node.js if you don't have it
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs

npm ci
npm run build
```

## 6) Environment Configuration

Copy the example env and set your values:

```bash
cp .env.example .env
```

Edit `.env` and provide API keys.

```bash
php artisan key:generate --force
```

Cache config/routes (optional but recommended for prod):

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 7) Database Migrations and Seeders

Run migrations:

```bash
php artisan migrate --force
```

Seed roles and permissions:

```bash
php artisan db:seed --class=RolesAndPermissionsSeeder
```

Sync Stripe plans:

```bash
php artisan stripe:sync-plans
```

## 8) File Permissions

```bash
sudo chown -R www-data:www-data /var/www/quark/storage /var/www/quark/bootstrap/cache
sudo find /var/www/quark/storage -type d -exec chmod 775 {} \;
sudo find /var/www/quark/bootstrap/cache -type d -exec chmod 775 {} \;
```

## 9) NGINX Configuration (No SSL)

Remove the default site:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

Create a new site config:

```bash
sudo nano /etc/nginx/sites-available/quark.conf
```

Paste this configuration (update server_name and root path if needed):

```nginx
server {
  listen 80;
  listen [::]:80;

  server_name your-domain.com; # or your server's IP
  root /var/www/quark/public;
  index index.php index.html;

  # Prevent exposing hidden or sensitive files
  location ~ /\.(?!well-known).* {
    deny all;
  }

  # Serve static assets directly
  location ~* \.(jpg|jpeg|png|gif|svg|webp|ico|css|js|map|woff|woff2|ttf|otf|eot)$ {
    expires 30d;
    add_header Cache-Control "public, max-age=2592000";
    try_files $uri =404;
    access_log off;
  }

  # Handle front-controller for Laravel (Inertia + React)
  location / {
    try_files $uri $uri/ /index.php?$query_string;
  }

  # PHP-FPM handling (PHP 8.4)
  location ~ \.php$ {
    include snippets/fastcgi-php.conf;
    # Adjust the sock path if your distro uses a different PHP-FPM pool/socket
    fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
  }

  # Security headers (basic, adjust as needed)
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;

  # Client body size (for file uploads)
  client_max_body_size 50M;

  # Error pages (optional)
  error_page 404 /index.php;
  error_page 500 502 503 504 /index.php;

  access_log /var/log/nginx/quark.access.log;
  error_log /var/log/nginx/quark.error.log;
}
```

Enable the site and reload NGINX:

```bash
sudo ln -s /etc/nginx/sites-available/quark.conf /etc/nginx/sites-enabled/quark.conf
sudo nginx -t
sudo systemctl reload nginx
```

Make sure PHP-FPM 8.4 is running:

```bash
sudo systemctl enable --now php8.4-fpm
```

## 10) Supervisor or systemd Queue Worker

Option A — systemd service:

```bash
sudo nano /etc/systemd/system/quark-queue.service
```

```ini
[Unit]
Description=Quark Portal Queue Worker
After=redis-server.service

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /var/www/quark/artisan queue:work --queue=high,default,low --sleep=3 --tries=3
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now quark-queue.service
```

Option B — Supervisor (alternative):

```bash
sudo apt -y install supervisor
sudo bash -c 'cat >/etc/supervisor/conf.d/quark-queue.conf' << "EOF"
[program:quark-queue]
process_name=%(program_name)s_%(process_num)02d
command=/usr/bin/php /var/www/quark/artisan queue:work --queue=high,default,low --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/log/supervisor/quark-queue.log
EOF

sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start quark-queue:
```

## 11) Testing

- Visit http://your-domain.com (or server IP).
- If you see a 502:
  - Check `sudo systemctl status php8.4-fpm`
  - Confirm the socket path in nginx config matches your PHP-FPM pool
- If assets don’t load:
  - Rebuild `npm run build`
  - Ensure the document root is `/var/www/quark/public`
- If database errors:
  - Verify `.env` DB credentials and that migrations ran successfully

## 12) Production Tips

- Keep your `.env` out of version control.
- Back up your `APP_KEY` (in `.env`).
- Use `php artisan config:cache` and `php artisan route:cache` after config changes.
- Consider adding SSL before going public-facing on the internet.

## Quick Commands Recap

```bash
# Clone and install
cd /var/www/quark
git clone https://github.com/jsemolik/quark-frontend.git .
COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --optimize-autoloader
npm ci && npm run build

# Env + app key
cp .env.example .env
php artisan key:generate --force

# DB
php artisan migrate --force
php artisan db:seed --class=RolesAndPermissionsSeeder
php artisan stripe:sync-plans

# Permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo find storage -type d -exec chmod 775 {} \;
sudo find bootstrap/cache -type d -exec chmod 775 {} \;

# NGINX
sudo rm -f /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-available/quark.conf
sudo ln -s /etc/nginx/sites-available/quark.conf /etc/nginx/sites-enabled/quark.conf
sudo nginx -t && sudo systemctl reload nginx
```
