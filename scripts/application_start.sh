#!/bin/bash
set -e

echo "===== Application Start Hook ====="

# Navigate to application directory
cd /var/www/chess-backend || exit

# Load environment variables if .env exists
if [ -f .env ]; then
    echo "Loading environment variables..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Start the application with PM2
echo "Starting chess-backend application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 process list
echo "Saving PM2 process list..."
pm2 save

# Display status
echo "Current PM2 status:"
pm2 status

echo "Application Start completed successfully."

