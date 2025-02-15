ARG BUILD_FROM

FROM node:22.14.0-alpine AS node
FROM 1password/op:2.30.3 AS onePassword

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

# Add crontab entry for fetching a url every 5 minutes
RUN echo "*/1 * * * * /usr/bin/curl -s -S -X GET \"http://localhost:${PORT}/api/cron\" > /dev/null" >> /etc/crontabs/root

WORKDIR /app

COPY web/public ./public
COPY web/.next/static ./.next/static
COPY web/.next/standalone ./
COPY web/prisma ./prisma
COPY web/node_modules/.bin ./node_modules/.bin
COPY web/node_modules/@prisma ./node_modules/@prisma
COPY web/node_modules/.prisma ./node_modules/.prisma
COPY web/node_modules/prisma ./node_modules/prisma

EXPOSE $PORT
CMD ["/run.sh"]
