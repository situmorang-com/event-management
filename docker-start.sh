#!/bin/sh
set -e

# Run database migrations
echo "Running database migrations..."
node --import tsx src/lib/server/db/migrate.ts

# Start the application
echo "Starting application..."
exec node build/index.js
