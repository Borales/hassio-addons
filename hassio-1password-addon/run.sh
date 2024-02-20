#!/usr/bin/with-contenv bashio

# Start the cron service
crond

CONFIG_PATH=/data/options.json

# Home assistant config folder
HA_CONFIG_FOLDER=/config

OP_TTR="$(bashio::config 'checkIntervalMin')"
OP_DB_URL="file:/data/store.db?connection_limit=1"
OP_SERVICE_ACCOUNT_TOKEN="$(bashio::config 'serviceAccountToken')"
APP_LOG_LEVEL="$(bashio::config 'logLevel')"

# Run Prisma migrations
cd /app && npm exec -- prisma migrate deploy

# run the web-app
cd /app && node server.js
