# Home Assistant Add-on: 1Password - Documentation

## Table of Contents

- [How It Works](#how-it-works)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Rate Limits](#rate-limits)
- [Home Assistant Events](#home-assistant-events)

## How It Works

### Architecture Overview

The 1Password Secrets Storage app uses a **secure, privacy-focused approach** to handling your 1Password secrets:

1. **Masked Storage**: The SQLite database stores 1Password secrets as **masked values** only, showing just the first and last few characters (e.g., `ab••••••xy`). Full secret values (with "CONCEAL" type) are **never** stored in the database raw.

2. **On-Demand Fetching**: When 1Password items are detected as changed during sync, the app:
   - Fetches the **actual secret values** directly from 1Password
   - Writes them immediately to Home Assistant's `secrets.yaml`
   - Continues storing only masked values in the database

3. **Sync Process**:
   ```
   1Password → [Masked DB Storage] → Detect Changes → Fetch Full Value → secrets.yaml
   ```

This approach ensures that even if someone gains access to the app's database, they won't have access to your actual secret values - only masked representations for tracking and assignment purposes.

### Technical Stack

- **Container**: Docker multi-stage build running on Home Assistant OS
- **Framework**: Next.js 16 with standalone build output
- **Database**: SQLite with Prisma ORM (stored at `/data/onepassword_app_store.db`)
- **Authentication**: 1Password service account tokens
- **API**: 1Password CLI via `@1password/op-js` SDK
- **Scheduler**: Container cron job triggering `/api/cron` every minute (with internal checks for sync intervals set by `checkIntervalMin`)

## Installation

### Prerequisites

Before installing this app, you'll need:

1. **A 1Password account**
2. **A 1Password service account token** - [create one here](https://developer.1password.com/docs/service-accounts/get-started/)
3. **Home Assistant OS** or Supervised installation

### Step 1: Add the Repository

1. Navigate to **Settings** → **Apps** → **Install App** in your Home Assistant interface
2. Click the **three-dot menu** (⋮) in the top-right corner
3. Select **Repositories**
4. Add the following repository URL: `https://github.com/Borales/hassio-addons`
5. Click **Add** and then **Close**

### Step 2: Install the App

1. Refresh the App Store page (you may need to hard-refresh: Ctrl+F5 or Cmd+Shift+R)
2. Scroll down to find **"1Password Secrets Storage"** in the list
3. Click on the app, then click **Install**
4. Wait for the installation to complete (this may take a few minutes)

### Step 3: Configure the App

1. Once installed, go to the **Configuration** tab
2. Enter your **1Password Service Account Token**: `"ops_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"`
3. (Optional) Adjust the **check interval** and **log level** as needed
4. Click **Save**

### Step 4: Start the App

1. Go to the **Info** tab
2. Click **Start**
3. Optionally enable **"Start on boot"** and **"Watchdog"** for automatic restart
4. Click **"Show in sidebar"** to add quick access to the app UI

### Step 5: Access the Web Interface

1. Click on **"1password"** in the Home Assistant sidebar (or open it from the app page)
2. The web interface will open, showing your Home Assistant secrets
3. Start assigning secrets to your 1Password items!

## Configuration

The app can be configured through the **Configuration** tab in the app interface.

### Configuration Options

| Option                | Type     | Required | Default | Description                                               |
| --------------------- | -------- | -------- | ------- | --------------------------------------------------------- |
| `serviceAccountToken` | password | Yes      | -       | Your 1Password service account token (starts with `ops_`) |
| `checkIntervalMin`    | int      | No       | `10`    | Interval in minutes between automatic sync checks (0-180) |
| `logLevel`            | list     | No       | `info`  | Logging level: `debug`, `info`, or `error`                |

### Example Configuration

```yaml
serviceAccountToken: "ops_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
checkIntervalMin: 15
logLevel: "info"
```

### Configuration Notes

- **Service Account Token**: Must be a valid 1Password service account token. Keep this secure! Service accounts need read access to the vaults containing your secrets.
- **Check Interval**: Setting this too low may cause you to hit 1Password's daily rate limits. See [Rate Limits](#rate-limits) for more information.
- **Log Level**:
  - `debug` - Detailed logging for troubleshooting
  - `info` - Normal operation logging (recommended)
  - `error` - Only log errors to minimize log size

## Usage Guide

### First-Time Setup

1. **Scan Your Configuration**: The app automatically scans your Home Assistant configuration for `!secret` references on startup
2. **Assign Secrets**: Use the web interface to assign each secret to a corresponding 1Password item
3. **Sync**: The app will automatically sync assigned secrets based on your configured interval

### Web Interface Screens

#### Main Dashboard

The homepage displays all your Home Assistant secrets and their 1Password assignments.

![Homepage](https://github.com/Borales/hassio-addons/raw/main/hassio-1password-addon/docs/homepage.png)

Features:

- View all detected secrets from your configuration
- See which secrets are assigned to 1Password items
- Quick access to assign/unassign functionality
- Status indicators showing last sync time

#### Assigning Secrets

![Assign Secret](https://github.com/Borales/hassio-addons/raw/main/hassio-1password-addon/docs/assign_secret.png)

To assign a secret to a 1Password item:

1. Open the app web interface from the Home Assistant sidebar
2. Find a secret you want to sync from 1Password
3. Click the **"Assign"** button next to the secret
4. Select the **1Password item** (you can start typing to search)
5. Choose the **1Password field** from the item to sync (username, password, etc.)
6. Click **"Assign"** to confirm

The app will immediately fetch the value from 1Password and write it to `secrets.yaml`.

#### Managing Secret Groups

![Groups Page](https://github.com/Borales/hassio-addons/raw/main/hassio-1password-addon/docs/groups_page.png)
![Create New Group](https://github.com/Borales/hassio-addons/raw/main/hassio-1password-addon/docs/create_new_group.png)

Groups allow you to organize secrets and receive Home Assistant events when specific secrets are updated:

1. Navigate to the **"Groups"** page in the app interface
2. Click **"New Group"**
3. Enter a group name (lowercase, no spaces - will be used in event names)
4. Add a description for the group
5. Select the secrets to include in the group
6. Save the group

**Event Integration**: When any secret in a group is synced, a `onepassword_group_{name}_updated` event will be fired in Home Assistant. Use these events to trigger automations like restarting integrations or add-ons.

#### Monitoring Rate Limits

![Rate Limits Page](https://github.com/Borales/hassio-addons/raw/main/hassio-1password-addon/docs/rate_limits_page.png)

The Rate Limits page shows:

- Current daily request count
- Maximum daily limit for your plan
- Percentage of daily quota used
- Reset time

1Password service accounts have daily API request limits that vary by plan:

- **Starter/Team**: 1,000 requests/day
- **Business**: 5,000 requests/day
- **Enterprise**: 50,000 requests/day

View your current usage on the **Rate Limits** page to ensure you stay within your daily quota. If you approach the limit, consider:

- Increasing the `checkIntervalMin` value
- Reducing the number of synced secrets
- Skipping secrets that rarely change

#### Help & Documentation

![Help Page](https://github.com/Borales/hassio-addons/raw/main/hassio-1password-addon/docs/help_page.png)

The built-in Help page provides:

- Quick start guide
- Usage instructions
- Event reference
- Links to documentation

## Security

### Secure Secret Handling

The app implements multiple layers of security:

1. **Masked Database Storage**: The SQLite database stores only **masked versions** of secrets (first and last few characters visible, e.g., `ab••••••xy`). Full secret values with "CONCEAL" type are **never** persisted in the database.

2. **On-Demand Fetching**: Full secret values are fetched from 1Password only when needed and written directly to `secrets.yaml` without intermediate storage.

3. **Data Flow**:

   ```
   1Password API → Masked DB (for tracking) → On change: Fetch full value → secrets.yaml
   ```

4. **Access Control**: The web interface is protected by Home Assistant's authentication system via Ingress.

### Best Practices

- **Service Account Token**: Store your service account token securely. It provides read access to all vaults the service account can access.
- **Secrets File**: The app writes full secret values to `/config/secrets.yaml` only. Ensure your Home Assistant configuration is properly secured with appropriate file permissions and backups.
- **Access Control**: Use Home Assistant's built-in authentication and authorization features to control who can access the app interface.
- **Principle of Least Privilege**: Create a dedicated 1Password service account with **read-only** access only to vaults containing Home Assistant secrets.
- **Regular Audits**: Periodically review which secrets are synced and remove unused assignments.

### Backup Recommendations

Before using this app:

1. **Backup your existing `secrets.yaml`** file
2. Test the app with a few non-critical secrets first
3. Verify synced secrets work correctly in your configuration
4. Set up regular Home Assistant backups (Settings → System → Backups)

## Troubleshooting

### Common Issues

#### App won't start

**Symptoms**: App shows as "stopped" or fails to start

**Solutions**:

- Verify your service account token is correct in the Configuration tab
- Check the app logs for specific error messages (Info tab → Logs)
- Ensure Home Assistant can access the internet
- Restart the app after configuration changes

#### Secrets not syncing

**Symptoms**: Secrets remain unchanged in `secrets.yaml` after assignment

**Solutions**:

- Verify secrets are properly assigned in the web interface (green checkmark)
- Check that the service account has read access to the selected 1Password vaults
- Monitor rate limits to ensure you haven't exceeded your daily quota
- Check the sync logs (Info tab → Logs) for specific errors
- Try manually triggering a sync using the "Update Now" button

#### Rate limit errors

**Symptoms**: Logs show "rate limit exceeded" errors

**Solutions**:

- Increase the `checkIntervalMin` value (e.g., from 10 to 20 minutes)
- Remove unnecessary secret assignments
- Skip secrets that rarely change using the skip functionality
- Consider upgrading your 1Password plan for higher limits
- Wait for the daily quota to reset

#### Database locked errors

**Symptoms**: Logs show SQLite "database is locked" errors

**Solutions**:

- This is typically a transient issue that resolves automatically
- If persistent, restart the app
- Ensure only one instance of the app is running

#### Secrets not detected

**Symptoms**: Some `!secret` references don't appear in the interface

**Solutions**:

- Verify the secret reference uses the correct YAML format: `!secret secret_name`
- Check that the configuration files are in `/config` or subdirectories
- Some integrations use inline secrets that aren't detected - these must be manually added
- Restart the app to force a configuration rescan

### Viewing Logs

To access detailed logs:

1. Navigate to the app page in Home Assistant
2. Click the **Info** tab
3. Click **Logs**
4. Set log level to `debug` in Configuration for more detailed output

### Getting Help

If you can't resolve an issue:

1. Check the [GitHub Issues](https://github.com/Borales/hassio-addons/issues) for similar problems
2. Create a new issue with:
   - App version
   - Home Assistant version
   - Relevant log excerpts (remove sensitive data)
   - Steps to reproduce

## Rate Limits

⚠️ **Important**: 1Password service accounts have daily rate limits that vary by plan type.

### Rate Limit Tiers

1password has different rate limits depending on your account type:

- **Starter/Team**: 1,000 requests per day
- **Business**: 5,000 requests per day
- **Enterprise**: 50,000 requests per day

More details: [1Password Service Account Rate Limits](https://developer.1password.com/docs/service-accounts/rate-limits#daily-limits)

### What Counts as a Request?

Each API call counts toward your daily limit, including:

- Fetching vault lists
- Reading item details
- Checking for item updates
- Retrieving field values

### Managing Rate Limits

**Check Interval Calculation**:

With a 10-minute interval and 100 secrets:

- 6 syncs per hour × 24 hours = 144 syncs per day
- Each sync checks all assigned items
- ~144-300 API requests per day (depending on caching)

**Recommendations**:

1. **Start conservatively**: Use `checkIntervalMin: 15` (or higher) initially
2. **Monitor usage**: Check the Rate Limits page regularly
3. **Adjust as needed**: If approaching limits, increase the interval
4. **Be selective**: Only sync secrets that need automatic updates
5. **Skip static secrets**: Use the skip feature for secrets that rarely change

**Safe Intervals by Plan**:

- **Starter/Team (1k/day)**: 15-30 minutes recommended
- **Business (5k/day)**: 10-15 minutes recommended
- **Enterprise (50k/day)**: 5-10 minutes recommended

Please make sure the configured "Check Interval" is not too high, otherwise you might hit the rate limit and the add-on will stop working for the rest of the day.

## Home Assistant Events

The app fires custom Home Assistant events that you can use in automations, scripts, and notifications.

### Event Types

#### `onepassword_secrets_synced`

Fired when a batch sync completes successfully.

**Event Data**:

```yaml
event_type: onepassword_secrets_synced
data:
  changedCount: 2
  changedSecrets:
    - "db_password"
    - "api_key"
  changedGroups:
    - "production"
```

#### `onepassword_secret_written`

Fired when an individual secret is written to `secrets.yaml`.

**Event Data**:

```yaml
event_type: onepassword_secret_written
data:
  secretName: "ps5_token"
```

#### `onepassword_secret_assigned`

Fired when a secret is linked to a 1Password item.

**Event Data**:

```yaml
event_type: onepassword_secret_assigned
data:
  secretName: "mqtt_password"
```

#### `onepassword_secret_unassigned`

Fired when a secret assignment is removed.

**Event Data**:

```yaml
event_type: onepassword_secret_unassigned
data:
  secretName: "old_api_key"
```

#### `onepassword_item_refreshed`

Fired when a 1Password item is manually refreshed from the UI.

**Event Data**:

```yaml
event_type: onepassword_item_refreshed
data:
  itemId: "xyz789"
  vaultId: "vault123"
  affectedSecrets:
    - "db_password"
    - "db_username"
```

#### `onepassword_group_{name}_updated`

Fired when any secret in a specific group is synced. The `{name}` is replaced with your group name.

**Event Data**:

```yaml
event_type: onepassword_group_xiaomi_updated
data:
  groupName: "xiaomi"
  updatedSecrets:
    - "xiaomi_username"
    - "xiaomi_password"
    - "xiaomi_token"
```

#### `onepassword_error`

Fired when an error occurs during any operation.

**Event Data**:

```yaml
event_type: onepassword_error
data:
  errorType: "sync_failed"
  error: "Rate limit exceeded"
```

### Automation Examples

#### Restart Add-on When Secret Changes

Automatically restart an add-on when its secret is updated:

```yaml
alias: "Update PS5 Token and Restart App"
description: "Restarts the PS5 MQTT add-on when its secret is updated"
mode: single

trigger:
  - platform: event
    event_type: "onepassword_secret_written"

condition:
  - condition: template
    value_template: "{{ trigger.event.data.secretName == 'ps5_token' }}"

action:
  - service: hassio.addon_restart
    data:
      addon: "df2164f9_ps5_mqtt"
```

#### Notification for Group Update

Prompt for manual action when a group of secrets is updated:

```yaml
alias: "Notify for Xiaomi Secret Update"
description: "Prompts a manual restart when Xiaomi Cloud Map Extractor secrets are updated"
mode: single

trigger:
  - platform: event
    event_type: "onepassword_group_xiaomi_updated"

action:
  - service: notify.persistent_notification
    data:
      title: "Xiaomi Cloud Map Extractor Secrets Updated"
      message: "New Xiaomi Cloud Map Extractor secrets have been detected. Please restart Home Assistant to apply these changes to the integration."
      notification_id: "xiaomi_restart_needed"
```

#### Monitor Sync Errors

Send notifications when sync errors occur:

```yaml
alias: "Alert on 1Password Sync Errors"
description: "Sends a notification when 1Password sync encounters an error"
mode: single

trigger:
  - platform: event
    event_type: "onepassword_error"

action:
  - service: notify.persistent_notification
    data:
      title: "1Password Sync Error"
      message: "1Password error ({{ trigger.event.data.errorType }}): {{ trigger.event.data.error | default('No details available') }}"
      notification_id: "onepassword_error"
```

### Event Best Practices

1. **Use Template Conditions**: Filter events by checking `trigger.event.data` fields
2. **Group Related Secrets**: Create groups for secrets that belong to the same integration
3. **Avoid Loops**: Don't trigger syncs from sync events to prevent infinite loops
4. **Rate Limit Awareness**: Consider automation frequency to avoid exhausting API limits
5. **Error Handling**: Always monitor `onepassword_error` events for operational issues

### Viewing Event History

To see fired events in Home Assistant:

1. Go to **Developer Tools** → **Events**
2. Enter event type in "Listen to events" (e.g., `onepassword_secret_written`)
3. Click **Start Listening**
4. Trigger an action (assign a secret, run sync)
5. View the event data in real-time

## Support the Project

If you find this app helpful and want to support its development, consider buying me a coffee! ☕

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow?style=for-the-badge&logo=buy-me-a-coffee)](https://buymeacoffee.com/borales)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-red?style=for-the-badge&logo=ko-fi)](https://ko-fi.com/borales_gh)

Your support helps maintain and improve this project!

## License

This project is licensed under the [MIT License](https://github.com/Borales/hassio-addons/blob/main/LICENSE).

## Links

- **GitHub Repository**: [https://github.com/Borales/hassio-addons](https://github.com/Borales/hassio-addons)
- **Issue Tracker**: [https://github.com/Borales/hassio-addons/issues](https://github.com/Borales/hassio-addons/issues)
- **1Password Developer Documentation**: [https://developer.1password.com/](https://developer.1password.com/)
