ARG BUILD_FROM

FROM node:20.11-alpine AS node
FROM 1password/op:2.24.0 AS onePassword

FROM $BUILD_FROM

COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/share /usr/local/share
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

COPY --from=onePassword /usr/local/bin /usr/local/bin

RUN apk add --no-cache libc6-compat
RUN npm install -g npm

# Copy data for add-on
COPY run.sh /
RUN chmod a+x /run.sh

ENV PORT 8000
ENV NEXT_TELEMETRY_DISABLED 1
# ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Add crontab entry for fetching a url every 5 minutes
RUN echo "*/1 * * * * /usr/bin/curl -s -S -X GET \"http://localhost:${PORT}/api/cron\" > /dev/null" >> /etc/crontabs/root

WORKDIR /app
USER nodejs

COPY --chown=nodejs:nodejs web/public ./public
COPY --chown=nodejs:nodejs web/.next/static ./.next/static
COPY --chown=nodejs:nodejs web/.next/standalone ./

EXPOSE $PORT
CMD ["/run.sh"]
