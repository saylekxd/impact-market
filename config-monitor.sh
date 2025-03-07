#!/bin/bash

# Script to monitor and auto-restore config files if they become empty

echo "Starting config file monitor..."

# Function to check if file is empty or corrupted
check_file() {
  local file=$1
  local backup=$2
  
  # Check if file exists and is empty or just whitespace
  if [ ! -s "$file" ] || [ "$(grep -c '[^[:space:]]' "$file")" -eq 0 ]; then
    echo "$(date): $file is empty or corrupted, restoring from backup..."
    cp "$backup" "$file"
    echo "$(date): $file restored."
  fi
}

# Ensure we have backups
if [ ! -f "package.json.backup" ] || [ ! -f "tsconfig.json.backup" ] || [ ! -f "vite.config.ts.backup" ]; then
  echo "Creating backups..."
  cp package.json package.json.backup
  cp tsconfig.json tsconfig.json.backup
  cp vite.config.ts vite.config.ts.backup
fi

# Monitor files in a loop
while true; do
  check_file "package.json" "package.json.backup"
  check_file "tsconfig.json" "tsconfig.json.backup"
  check_file "vite.config.ts" "vite.config.ts.backup"
  
  # Wait before checking again (5 seconds)
  sleep 5
done 