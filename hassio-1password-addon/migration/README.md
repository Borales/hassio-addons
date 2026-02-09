# Migration tool for 1Password Home Assistant addon

This directory contains a migration tool for the 1Password Home Assistant addon.
It is used to run Prisma migrations via Docker on the database when the addon is updated to a new version that includes database schema changes.

The reason for having a separate migration app is to ensure a smaller Docker image size for the main addon (without installing all app dependencies).

## Usage

```bash
pnpm run migrate --schema=../web/prisma/schema.prisma --config=../web/prisma.config.ts
```
