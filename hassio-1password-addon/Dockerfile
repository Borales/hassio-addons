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
RUN npm i -g npm
RUN corepack enable pnpm

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

RUN rm -rf /temp-app && mkdir /temp-app && cd /temp-app && pnpm install dotenv prisma @prisma/client
RUN rm -fr /app/node_modules/dotenv && mv -f /temp-app/node_modules/dotenv ./node_modules/dotenv
RUN rm -fr /app/node_modules/prisma && mv -f /temp-app/node_modules/prisma ./node_modules/prisma
RUN rm -rf /app/node_modules/.pnpm/dotenv* && cp -fr /temp-app/node_modules/.pnpm/dotenv* /app/node_modules/.pnpm/
RUN rm -rf /app/node_modules/.pnpm/prisma* && cp -fr /temp-app/node_modules/.pnpm/prisma* /app/node_modules/.pnpm/
RUN rm -rf /app/node_modules/.pnpm/@prisma* && cp -fr /temp-app/node_modules/.pnpm/@prisma* /app/node_modules/.pnpm/
RUN cp -fr /temp-app/node_modules/.bin /app/node_modules/ && rm -rf /temp-app

EXPOSE $PORT
CMD ["/run.sh"]
