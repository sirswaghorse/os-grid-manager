#!/bin/bash

# OS Grid Manager Update Script
echo "Starting OS Grid Manager update process..."

# Check if we're in the correct directory
if [[ ! -f "package.json" ]]; then
  echo "Error: Must be run from the OS Grid Manager root directory"
  exit 1
fi

# Get current version
CURRENT_VERSION=$(grep -o '"version": *"[^"]*"' package.json | grep -o '[0-9]*\.[0-9]*\.[0-9]*')
echo "Current version: $CURRENT_VERSION"

# Create backup directory with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup_${TIMESTAMP}"
echo "Creating backup in $BACKUP_DIR"
mkdir -p $BACKUP_DIR

# Backup important files
echo "Backing up configuration files..."
cp .env $BACKUP_DIR/
cp -r config/* $BACKUP_DIR/ 2>/dev/null || true

# Stop the service
echo "Stopping OS Grid Manager service..."
if systemctl is-active --quiet osgridmanager.service; then
  sudo systemctl stop osgridmanager.service
else
  echo "Service not running or not using systemd"
fi

# Pull latest code from repository
echo "Fetching latest code..."
git fetch origin
git reset --hard origin/main

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Run database migrations if needed
echo "Running database migrations..."
npx drizzle-kit push:pg

# Start the service
echo "Starting OS Grid Manager service..."
if [ -f "/etc/systemd/system/osgridmanager.service" ]; then
  sudo systemctl daemon-reload
  sudo systemctl start osgridmanager.service
else
  echo "Starting application manually..."
  npm run start &
fi

# Get new version
NEW_VERSION=$(grep -o '"version": *"[^"]*"' package.json | grep -o '[0-9]*\.[0-9]*\.[0-9]*')
echo "Update complete!"
echo "Updated from version $CURRENT_VERSION to $NEW_VERSION"
echo "Backup saved in $BACKUP_DIR"

exit 0