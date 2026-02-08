#!/usr/bin/with-contenv bashio

# Start the cron service
crond

bashio::log.info "Setting the configuration for the 1Password addon..."

CONFIG_PATH=/data/options.json

# Home assistant config folder
HA_CONFIG_FOLDER=/config
HA_URL=http://supervisor/core/api

OP_TTR="$(bashio::config 'checkIntervalMin')"
OP_DB_URL="file:/data/onepassword_app_store.db"
OP_SERVICE_ACCOUNT_TOKEN="$(bashio::config 'serviceAccountToken')"
APP_LOG_LEVEL="$(bashio::config 'logLevel')"

# Check if `/data` directory exists
if [ ! -d /data ]; then
  bashio::log.fatal "The /data directory does not exist. Please mount the directory and try again."
  exit 1
fi

# Check if `/data` is writable
if [ ! -w /data ]; then
  bashio::log.fatal "The /data directory is not writable. Please check the permissions and try again."
  exit 1
fi

# Run Prisma migrations
bashio::log.info "Running Prisma migrations on ${OP_DB_URL}..."
bashio::log.info "Node version: $(node --version)"

cd /app || exit 1

if ! node node_modules/.bin/prisma migrate deploy; then
  bashio::log.fatal "Prisma migration failed. Check the logs above for details."
  exit 1
fi

bashio::log.info "Prisma migrations completed successfully"

# run the web-app
bashio::log.info "Starting the app..."
cd /app && node server.js
