# Home Assistant 1Password App - Web Interface

> Next.js 16 web interface for managing 1Password secret synchronization with Home Assistant

## Technical Overview

Modern web application built with **Next.js 16** featuring the new App Router and Cache Components pattern. Provides a containerized, standalone web UI for managing secret synchronization between 1Password and Home Assistant.

### Tech Stack

- **Next.js 16**: App Router, Server Components, Cache Components (`'use cache'`), Server Actions
- **Database**: SQLite with Prisma ORM (`@prisma-generated/client`)
- **UI Framework**: HeroUI + Tailwind CSS
- **i18n**: next-intl for multi-language support (EN, DE, NL, PL, UK)
- **Container**: Standalone build (`output: 'standalone'`) for Docker
- **Integration**: Home Assistant Supervisor API via Ingress

### Key Architecture

- **Service Layer**: Singleton services for business logic (`OnePasswordService`, `HASecretService`, `SyncService`)
- **Server Actions**: Form mutations with Home Assistant event firing
- **Cache Strategy**: Tag-based invalidation with `cacheTag()` and `updateTag()`
- **Proxy Pattern**: `proxy.ts` for locale detection (Next.js 16 middleware replacement)
- **Secure Storage**: Masked secret values in SQLite; full values fetched on-demand from 1Password

## Development

### Prerequisites

- Node.js 24 (.nvmrc included for version management)
- pnpm 10+

### Local Setup

```bash
cd web
pnpm install
pnpm dev  # Runs on port 8000
```

### Database Migrations

```bash
# Create a new migration
pnpm migration:dev --name your_migration_name

# View migration status
pnpm migration:status
```

### Production Build

```bash
pnpm build  # Creates .next/standalone for Docker
```

## Architecture

- **Service Layer**: Business logic in singleton services (`src/service/*.service.ts`)
- **Server Actions**: Form mutations using Next.js Server Actions (`src/actions/*.ts`)
- **Cache Components**: Next.js 16 `'use cache'` with tag-based invalidation
- **Event System**: Fires Home Assistant events for all operations
- **Proxy Pattern**: `proxy.ts` handles locale detection (replaces middleware in Next.js 16)

For detailed architectural information, see [AGENTS.md](AGENTS.md).

## Environment Variables

| Variable                   | Description                                     | Default                                  |
| -------------------------- | ----------------------------------------------- | ---------------------------------------- |
| `OP_SERVICE_ACCOUNT_TOKEN` | 1Password service account token                 | -                                        |
| `OP_DB_URL`                | SQLite connection string                        | `file:/data/store.db?connection_limit=1` |
| `SUPERVISOR_TOKEN`         | Home Assistant Supervisor token (auto-provided) | -                                        |
| `PORT`                     | Server port                                     | `8000`                                   |
| `APP_LOG_LEVEL`            | Logging level                                   | `info`                                   |

## Contributing

Contributions are welcome! Please ensure your code:

- Follows existing patterns and conventions
- Includes proper TypeScript types
- Uses proper internationalization for user-facing strings
- Updates all translation files in `messages/`

## Support the Project

If you find this project helpful, consider supporting its development:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow?style=for-the-badge&logo=buy-me-a-coffee)](https://buymeacoffee.com/borales)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-red?style=for-the-badge&logo=ko-fi)](https://ko-fi.com/borales_gh)

## License

MIT License - see [LICENSE](../../LICENSE) for details.
