# Home Assistant App: 1Password Secrets Storage

![Supports aarch64 Architecture][aarch64-shield]
![Supports amd64 Architecture][amd64-shield]
![Version][version-shield]
![License][license-shield]

[aarch64-shield]: https://img.shields.io/badge/aarch64-yes-green.svg
[amd64-shield]: https://img.shields.io/badge/amd64-yes-green.svg
[version-shield]: https://img.shields.io/badge/version-0.2.0-blue.svg
[license-shield]: https://img.shields.io/github/license/Borales/hassio-addons.svg

## About

Seamlessly integrate 1Password with Home Assistant to automatically sync secrets from your 1Password vaults to your `secrets.yaml` file. Manage your sensitive credentials securely with a modern web interface.

![Homepage](https://github.com/Borales/hassio-addons/raw/main/hassio-1password-addon/docs/homepage.png)

![Groups Page](https://github.com/Borales/hassio-addons/raw/main/hassio-1password-addon/docs/groups_page.png)

![Rate Limits Page](https://github.com/Borales/hassio-addons/raw/main/hassio-1password-addon/docs/rate_limits_page.png)

## Key Features

- 🔄 **Automatic Sync** - Schedule regular synchronization from 1Password to Home Assistant
- 🔐 **Secure Storage** - Secrets are masked in the database; full values only written to `secrets.yaml`
- 🗂️ **Group Management** - Organize secrets and trigger Home Assistant events
- 📊 **Rate Limit Monitoring** - Track your 1Password API usage
- 🌍 **Multi-Language** - English, German, Dutch, Polish, and Ukrainian
- 🎯 **Selective Sync** - Choose which secrets to sync from your vaults

## Quick Start

### Prerequisites

- 1Password account with Business or Enterprise plan
- [1Password service account token](https://developer.1password.com/docs/service-accounts/get-started/)
- Home Assistant OS or Supervised installation

### Installation

1. Add this repository to your Home Assistant: **Settings** → **Apps** → **⋮** → **Repositories**

   ```
   https://github.com/Borales/hassio-addons
   ```

2. Install **"1Password Secrets Storage"** from the App Store

3. Configure your service account token in the **Configuration** tab

4. Start the app and access it from the Home Assistant sidebar

📖 **For detailed installation instructions, configuration options, and usage guide, see [DOCS.md](DOCS.md)**

## Documentation

- **[DOCS.md](DOCS.md)** - Complete documentation including installation, configuration, usage, and troubleshooting
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and updates

## Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Please ensure your code follows the existing patterns and includes appropriate documentation.

## Support the Project

If you find this app helpful and want to support its development, consider buying me a coffee! ☕

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow?style=for-the-badge&logo=buy-me-a-coffee)](https://buymeacoffee.com/borales)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-red?style=for-the-badge&logo=ko-fi)](https://ko-fi.com/borales_gh)

Your support helps maintain and improve this project!

## License

This project is licensed under the [MIT License](https://github.com/Borales/hassio-addons/blob/main/LICENSE).

## Acknowledgments

- Built with [Next.js 16](https://nextjs.org/)
- Uses the [1Password Service Accounts](https://developer.1password.com/docs/service-accounts/) API
- UI components from [HeroUI](https://heroui.com/)
- Powered by [Home Assistant](https://www.home-assistant.io/)

## Links

- **GitHub Repository**: [https://github.com/Borales/hassio-addons](https://github.com/Borales/hassio-addons)
- **Issue Tracker**: [https://github.com/Borales/hassio-addons/issues](https://github.com/Borales/hassio-addons/issues)
- **1Password Developer Documentation**: [https://developer.1password.com/](https://developer.1password.com/)
