#!/bin/bash
set -e

echo "===== Before Install Hook ====="

# Navigate to application directory
cd /var/www/chess-backend || exit

# Stop any running PM2 processes
if pm2 list | grep -q "chess-backend"; then
    echo "Stopping existing chess-backend process..."
    pm2 stop chess-backend || true
    pm2 delete chess-backend || true
fi

# Clean up old files (except node_modules to speed up deployment)
echo "Cleaning up old application files..."
find . -maxdepth 1 ! -name 'node_modules' ! -name '.' ! -name '..' -exec rm -rf {} + || true

echo "Before Install completed successfully."

