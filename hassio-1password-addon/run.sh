#!/usr/bin/with-contenv bashio

# Start the cron service
crond

# Run Prisma migrations
# TODO: run migrations
# yarn --cwd /app migration:prod

# run the web-app
cd /app && node server.js
