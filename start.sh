#!/bin/bash

# Chess Backend Startup Script
echo "🚀 Starting Chess Backend with PM2..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed. Installing PM2..."
    npm install -g pm2
fi

# Build the application
echo "📦 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Exiting..."
    exit 1
fi

# Check if application is already running
if pm2 list | grep -q "chess-backend"; then
    echo "🔄 Application is already running. Restarting..."
    npm run pm2:restart
else
    echo "🆕 Starting new application instance..."
    npm run pm2:start
fi

# Show status
echo "📊 Application Status:"
npm run pm2:status

echo "✅ Chess Backend is now running!"
echo "📝 View logs with: npm run pm2:logs"
echo "📊 Monitor with: npm run pm2:monit"
echo "🌐 Application should be available at: http://localhost:3001"
