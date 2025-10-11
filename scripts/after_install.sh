#!/bin/bash
set -e

echo "===== After Install Hook ====="

sudo chown -R ubuntu:ubuntu /var/www/chess-backend

# Navigate to application directory
cd /var/www/chess-backend || exit

# Install dependencies
echo "Installing Node.js dependencies..."
npm ci --production

# Create necessary directories
echo "Creating logs directory..."
mkdir -p logs

# Set proper permissions
echo "Setting file permissions..."
chmod -R 755 .
chown -R ubuntu:ubuntu .

echo "After Install completed successfully."

