# Changelog

## 0.3.0

- Added tests for the web interface
- Updated web dependencies and lockfile (including next-intl, vite, vitest, and form-data)
- Updated web package manager configuration to pnpm 11.9.0 and removed deprecated .npmrc
- Fixed Next.js dev/prod asset path handling in web config (assetPrefix and image path)
- Updated HA secrets sync to drop DB secrets that are no longer referenced in any YAML files (including `secrets.yaml`)
- Removed stale/unneeded HA secrets from the web UI list after sync by deleting unreferenced records from the DB

## 0.2.1

- Fixed a silent error in Docker build
- Reduced log noise of rate limit updates from INFO to DEBUG

## 0.2.0

- Initial public release
