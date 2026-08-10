#!/usr/bin/env bash
set -e

echo "=== 🚀 Starting VPS Initial Setup for GAP_VoicePilot ==="

# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install essential tools, Nginx, Redis, Certbot
sudo apt install -y curl git ufw nginx redis-server certbot python3-certbot-nginx

# 3. Install Node.js 20 LTS via Nodesource
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 4. Install PM2 globally
sudo npm install -g pm2

# 5. Enable and start Redis & Nginx
sudo systemctl enable redis-server
sudo systemctl start redis-server
sudo systemctl enable nginx
sudo systemctl start nginx

# 6. Configure UFW Firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# 7. Symlink Nginx config if present
if [ -f /var/www/GAP_VoicePilot/deploy/nginx/voicepilot.conf ]; then
    sudo cp /var/www/GAP_VoicePilot/deploy/nginx/voicepilot.conf /etc/nginx/sites-available/voicepilot.conf
    sudo ln -sf /etc/nginx/sites-available/voicepilot.conf /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl reload nginx
fi

echo "=== ✅ VPS Initial Setup Complete ==="
