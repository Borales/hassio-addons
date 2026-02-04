import axios, { AxiosInstance } from 'axios';
import { Logger, logger } from './logger';

type EventName = `onepassword_${string}`;

/**
 * Home Assistant API client for communicating with the Supervisor API.
 * Uses the SUPERVISOR_TOKEN automatically provided by Home Assistant addons.
 */
export class HomeAssistantClient {
  private client: AxiosInstance;

  constructor(protected logger: Logger) {
    const token = process.env.SUPERVISOR_TOKEN;

    this.client = axios.create({
      baseURL: 'http://supervisor/core/api',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
  }

  /**
   * Check if Home Assistant API is available
   */
  isAvailable(): boolean {
    return !!process.env.SUPERVISOR_TOKEN;
  }

  /**
   * Fire a custom event to Home Assistant.
   * All events prefixed with 'onepassword_' and include a timestamp.
   *
   * @param eventType - The event type (prefixed with 'onepassword_')
   * @param eventData - Additional data to include in the event
   */
  async fireEvent(
    eventType: EventName,
    eventData: Record<string, unknown> = {}
  ): Promise<boolean> {
    if (!this.isAvailable()) {
      this.logger.debug(
        'Home Assistant API not available (SUPERVISOR_TOKEN not set), skipping event: %s',
        eventType
      );
      return false;
    }

    const payload = {
      ...eventData,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.debug(
        'Firing HA event: %s with data: %o',
        eventType,
        payload
      );
      await this.client.post(`/events/${eventType}`, payload);
      this.logger.info('Successfully fired HA event: %s', eventType);
      return true;
    } catch (error) {
      this.logger.error('Failed to fire HA event %s: %o', eventType, error);
      // Fire error event (but don't recurse if error event itself fails)
      if (eventType !== 'onepassword_error') {
        await this.fireErrorEvent('event_fire_failed', {
          failedEventType: eventType,
          error: error instanceof Error ? error.message : String(error)
        });
      }
      return false;
    }
  }

  /**
   * Send a persistent notification to Home Assistant.
   *
   * @param title - Notification title
   * @param message - Notification message
   * @param notificationId - Optional ID for the notification (allows updating/dismissing)
   */
  async sendNotification(
    title: string,
    message: string,
    notificationId?: string
  ): Promise<boolean> {
    if (!this.isAvailable()) {
      this.logger.debug(
        'Home Assistant API not available (SUPERVISOR_TOKEN not set), skipping notification: %s',
        notificationId || title
      );
      return false;
    }

    try {
      const payload: Record<string, string> = { title, message };
      if (notificationId) {
        payload.notification_id = notificationId;
      }

      this.logger.debug('Sending HA notification: %s', title);
      await this.client.post(
        '/services/persistent_notification/create',
        payload
      );
      this.logger.info('Successfully sent HA notification: %s', title);
      return true;
    } catch (error) {
      this.logger.error('Failed to send HA notification: %o', error);
      await this.fireErrorEvent('notification_failed', {
        title,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Dismiss a persistent notification.
   *
   * @param notificationId - The ID of the notification to dismiss
   */
  async dismissNotification(notificationId: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.client.post('/services/persistent_notification/dismiss', {
        notification_id: notificationId
      });
      return true;
    } catch (error) {
      this.logger.error('Failed to dismiss notification: %o', error);
      return false;
    }
  }

  /**
   * Fire an error event to Home Assistant.
   */
  async fireErrorEvent(
    errorType: string,
    details: Record<string, unknown> = {}
  ): Promise<boolean> {
    return this.fireEvent('onepassword_error', {
      errorType,
      ...details
    });
  }

  /**
   * Fire event for a single secret being written.
   */
  async fireSecretWrittenEvent(
    secretName: string,
    isNew: boolean
  ): Promise<boolean> {
    return this.fireEvent('onepassword_secret_written', {
      secretName,
      isNew
    });
  }

  /**
   * Fire event for a group of secrets being updated.
   */
  async fireGroupUpdatedEvent(
    groupName: string,
    groupId: string,
    updatedSecrets: string[]
  ): Promise<boolean> {
    return this.fireEvent(`onepassword_group_${groupName}_updated`, {
      groupName,
      groupId,
      updatedSecrets
    });
  }

  /**
   * Fire event when secrets sync completes.
   */
  async fireSecretsSyncedEvent(
    changedSecrets: string[],
    changedGroups: Array<{ name: string; id: string; secrets: string[] }>
  ): Promise<boolean> {
    return this.fireEvent('onepassword_secrets_synced', {
      changedCount: changedSecrets.length,
      changedSecrets,
      changedGroups: changedGroups.map((g) => g.name)
    });
  }

  /**
   * Fire event when a secret is assigned to a 1Password item.
   */
  async fireSecretAssignedEvent(
    secretName: string,
    itemId: string,
    reference: string
  ): Promise<boolean> {
    return this.fireEvent('onepassword_secret_assigned', {
      secretName,
      itemId,
      reference
    });
  }

  /**
   * Fire event when a secret is unassigned from a 1Password item.
   */
  async fireSecretUnassignedEvent(secretName: string): Promise<boolean> {
    return this.fireEvent('onepassword_secret_unassigned', {
      secretName
    });
  }

  /**
   * Fire event when a 1Password item is refreshed.
   */
  async fireItemRefreshedEvent(
    itemId: string,
    vaultId: string,
    affectedSecrets: string[]
  ): Promise<boolean> {
    return this.fireEvent('onepassword_item_refreshed', {
      itemId,
      vaultId,
      affectedSecrets
    });
  }

  /**
   * Fire event when a secret's skip status is toggled.
   */
  async fireSecretSkipToggledEvent(
    secretName: string,
    isSkipped: boolean
  ): Promise<boolean> {
    return this.fireEvent('onepassword_secret_skip_toggled', {
      secretName,
      isSkipped
    });
  }

  /**
   * Fire group update events for all groups.
   * Handles the cycle internally to avoid repetitive code.
   *
   * @param groups - Array of groups to fire events for
   */
  async fireGroupUpdatedEventsForSecrets(
    groups: Array<{ name: string; id: string; secrets: string[] }>
  ): Promise<void> {
    if (groups.length === 0) {
      return;
    }

    try {
      await Promise.all(
        groups.map((group) =>
          this.fireGroupUpdatedEvent(group.name, group.id, group.secrets)
        )
      );
    } catch (error) {
      this.logger.error('Failed to fire group update events: %o', error);
    }
  }
}

export const homeAssistantClient = new HomeAssistantClient(logger);
