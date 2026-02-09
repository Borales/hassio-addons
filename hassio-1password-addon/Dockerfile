ARG BUILD_FROM

FROM node:24.13.0-alpine AS node
FROM 1password/op:2.32.1 AS onepassword

FROM ${BUILD_FROM}

COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/share /usr/local/share
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

COPY --from=onepassword /usr/local/bin /usr/local/bin

RUN apk add --no-cache libc6-compat
RUN npm i -g npm prisma dotenv

# Copy data for add-on
COPY run.sh /
RUN chmod a+x /run.sh

ENV PORT=8000
ENV NEXT_TELEMETRY_DISABLED=1
# ENV NODE_ENV production

# Add crontab entry for fetching a url every minute
RUN echo "*/1 * * * * /usr/bin/curl -s -S -X GET \"http://localhost:${PORT}/api/cron\" > /dev/null" >> /etc/crontabs/root

WORKDIR /app

# Copy pre-built Next.js artifacts (standalone already includes minimal node_modules)
COPY web/.next/standalone ./
COPY web/public ./public
COPY web/.next/static ./.next/static
COPY web/prisma ./prisma
COPY web/prisma.config.ts ./
COPY web/messages ./messages

EXPOSE $PORT
CMD ["/run.sh"]
