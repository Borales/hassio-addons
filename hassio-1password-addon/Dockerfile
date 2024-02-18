ARG BUILD_FROM

FROM node:20.11-alpine AS node
FROM 1password/op:2.24.0 AS onePassword

FROM $BUILD_FROM

COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/share /usr/local/share
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin
RUN rm /usr/local/bin/yarn*

COPY --from=onePassword /usr/local/bin /usr/local/bin

RUN apk add --no-cache libc6-compat
RUN npm install -g npm
RUN npm install -g yarn

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
COPY web/ .
RUN ls -la .
RUN ls -lah ./.next
RUN chown -R nodejs:nodejs .
USER nodejs

RUN yarn --frozen-lockfile
RUN yarn build
RUN yarn prisma:generate

EXPOSE $PORT
CMD ["/run.sh"]
