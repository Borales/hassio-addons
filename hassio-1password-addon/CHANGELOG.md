# Changelog

## Unreleased

- Redesigned the web interface on daisyUI 5, with dark and light themes and a dedicated mobile layout
- Added a "Broken link" status with a banner, filter and re-link flow for secrets whose 1Password item, field or vault can no longer be read
- Added a status filter and search across keys, items, fields and groups on the Secrets page
- Added undo for unassigning, hiding and deleting a group
- Group names can now be edited, and groups can include any secret
- A secret that can't be read from 1Password no longer aborts the whole sync
- Added tests for the web interface

## 0.2.1

- Fixed a silent error in Docker build
- Reduced log noise of rate limit updates from INFO to DEBUG

## 0.2.0

- Initial public release
