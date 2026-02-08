import { onePasswordService, OnePasswordService } from './1password.service';
import {
  homeAssistantClient,
  HomeAssistantClient
} from './client/homeassistant';
import { Logger, logger } from './client/logger';
import { groupService, GroupService } from './group.service';
import { rateLimitService, RateLimitService } from './ratelimit.service';
import { haSecretService, HASecretService } from './secret.service';

export class SyncService {
  constructor(
    protected onePasswordService: OnePasswordService,
    protected haSecretService: HASecretService,
    protected groupService: GroupService,
    protected rateLimitService: RateLimitService,
    protected haClient: HomeAssistantClient,
    protected logger: Logger
  ) {}

  async sync(force?: boolean) {
    this.logger.debug('Syncing HA secrets');
    await this.haSecretService.syncSecrets();
    this.logger.debug('Syncing 1Password items');
    await this.onePasswordService.syncItems(force);

    this.logger.debug('Fetching recently updated items');
    const newlyUpdatedItems =
      await this.onePasswordService.getRecentlyUpdatedItems();

    this.logger.debug(
      'Saving updated secrets: %s',
      Object.keys(newlyUpdatedItems)
    );
    const changedSecrets =
      await this.haSecretService.saveSecrets(newlyUpdatedItems);

    // Refresh rate limits after sync to keep stats current
    this.logger.debug('Refreshing rate limits');
    await this.rateLimitService.fetchAndStore();

    if (changedSecrets.length === 0) {
      return { changedSecrets: [], changedGroups: [] };
    }

    // Get affected groups (saveSecrets already fired individual group events)
    const changedGroups = await this.getAffectedGroups(changedSecrets);

    // Fire sync completed event
    await this.haClient.fireSecretsSyncedEvent(changedSecrets, changedGroups);

    // Send notification about the changes
    await this.haClient.sendNotification(
      '1Password Secrets Updated',
      `Updated ${changedSecrets.length} secret${changedSecrets.length === 1 ? '' : 's'}: ${changedSecrets.join(', ')}`,
      'onepassword_sync_notification'
    );

    return { changedSecrets, changedGroups };
  }

  /**
   * Get groups affected by the given secrets.
   */
  private async getAffectedGroups(secretNames: string[]) {
    return this.groupService.getGroupsForSecrets(secretNames);
  }
}

export const syncService = new SyncService(
  onePasswordService,
  haSecretService,
  groupService,
  rateLimitService,
  homeAssistantClient,
  logger
);
