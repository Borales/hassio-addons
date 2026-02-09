ARG BUILD_FROM

FROM node:24.13.0-alpine AS node
FROM 1password/op:2.32.1 AS onepassword

# Builder stage - build Next.js app with native modules for Alpine
FROM node:24.13.0-alpine AS builder

RUN apk add --no-cache libc6-compat python3 make g++
RUN corepack enable pnpm

WORKDIR /build

# Copy web app source
COPY web/package.json web/pnpm-lock.yaml web/pnpm-workspace.yaml ./
COPY web/prisma ./prisma
COPY web/prisma.config.ts ./prisma.config.ts

# Install dependencies (scripts needed for native modules like better-sqlite3)
RUN pnpm install --frozen-lockfile

# Copy rest of source files
COPY web/ ./

# Build the app (better-sqlite3 will be compiled for Alpine here)
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

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

# Copy migration sub-app for running Prisma migrations
COPY migration/package.json /migration/
COPY migration/pnpm-lock.yaml /migration/
COPY migration/pnpm-workspace.yaml /migration/
COPY web/prisma.config.ts /migration/prisma.config.ts
RUN cd /migration && pnpm install --frozen-lockfile --prod

# Copy pre-built Next.js artifacts from builder stage (standalone already includes minimal node_modules)
COPY --from=builder /build/.next/standalone ./
COPY --from=builder /build/public ./public
COPY --from=builder /build/.next/static ./.next/static
COPY --from=builder /build/prisma ./prisma
COPY web/prisma.config.ts ./
COPY web/messages ./messages

EXPOSE $PORT
CMD ["/run.sh"]
