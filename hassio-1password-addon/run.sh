#!/usr/bin/with-contenv bashio

bashio::log.info "Setting the configuration for the 1Password addon..."

# Set default hostname if not provided
HOSTNAME=${HOSTNAME:-localhost}
PORT=${PORT:-8000}

bashio::log.info "Configuring cron to call http://${HOSTNAME}:${PORT}/api/cron every minute..."

# Create crontab entry dynamically with runtime HOSTNAME
echo "*/1 * * * * /usr/bin/curl -f -s -S -X GET \"http://${HOSTNAME}:${PORT}/api/cron\" 2>&1 | logger -t onepassword-cron" > /etc/crontabs/root

# Start the cron service with logging
bashio::log.info "Starting cron daemon..."
if crond -l 2; then
  bashio::log.info "Cron daemon started successfully"
else
  bashio::log.warning "Cron daemon may have failed to start"
fi

export CONFIG_PATH=/data/options.json
# Home assistant config folder
export HA_CONFIG_FOLDER=/config
export HA_URL=http://supervisor/core/api

export OP_TTR="$(bashio::config 'checkIntervalMin')"
export OP_DB_URL="file:/data/onepassword_app_store.db"
export OP_SERVICE_ACCOUNT_TOKEN="$(bashio::config 'serviceAccountToken')"
export APP_LOG_LEVEL="$(bashio::config 'logLevel')"

# Run Prisma migrations
bashio::log.info "Running Prisma migrations on ${OP_DB_URL}..."
bashio::log.info "Node version: $(node --version)"

cd /migration || exit 1

bashio::log.info "Running Prisma migration..."
if ! OP_DB_URL="${OP_DB_URL}" pnpm run migrate --schema=/app/prisma/schema.prisma; then
  bashio::log.fatal "Prisma migration failed. Check the logs above for details."
  exit 1
fi

bashio::log.info "Prisma migrations completed successfully"

cd /app || exit 1

# run the web-app
bashio::log.info "Starting the app..."
node server.js
