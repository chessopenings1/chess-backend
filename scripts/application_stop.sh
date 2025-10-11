#!/bin/bash

echo "===== Application Stop Hook ====="

# Stop the application gracefully
if pm2 list | grep -q "chess-backend"; then
    echo "Stopping chess-backend application..."
    pm2 stop chess-backend || true
    echo "Application stopped successfully."
else
    echo "No chess-backend process found. Skipping..."
fi

echo "Application Stop completed."

