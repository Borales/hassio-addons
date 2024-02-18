#!/usr/bin/with-contenv bashio

# Start the cron service
crond

# Run Prisma migrations
yarn --cwd /app migration:prod

# run the web-app
yarn --cwd /app start
