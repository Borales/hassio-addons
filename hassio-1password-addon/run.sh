#!/usr/bin/with-contenv bashio

# Start the cron service
crond

# Run Prisma migrations
cd /app && npm run prisma migrate deploy

# run the web-app
cd /app && node server.js
