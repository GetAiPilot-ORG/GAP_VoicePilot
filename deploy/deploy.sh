#!/usr/bin/env bash
set -e

echo "=== 🚀 Starting Deployment for GAP_VoicePilot ==="

# Navigate to project root
APP_DIR="/var/www/GAP_VoicePilot"
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
fi

# Pull latest changes
echo "Pulling latest code from Git..."
git pull origin main || git pull origin master

# Install dependencies across monorepo
echo "Installing dependencies..."
npm install

# Build frontend and backend
echo "Building applications..."
npm run build

# Start or reload PM2 processes
echo "Reloading PM2 applications..."
if pm2 list | grep -q "voicepilot-frontend"; then
    pm2 reload ecosystem.config.js --env production
else
    pm2 start ecosystem.config.js --env production
fi

# Save PM2 state
pm2 save

echo "=== ✅ Deployment Complete Successfully ==="
