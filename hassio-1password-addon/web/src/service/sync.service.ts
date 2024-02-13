import { onePasswordService, OnePasswordService } from './1password.service';
import { Logger, logger } from './client/logger';
import { haSecretService, HASecretService } from './secret.service';

export class SyncService {
  constructor(
    protected onePasswordService: OnePasswordService,
    protected haSecretService: HASecretService,
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

    this.logger.debug('Saving updated secrets');
    await this.haSecretService.saveSecrets(newlyUpdatedItems);
  }
}

export const syncService = new SyncService(
  onePasswordService,
  haSecretService,
  logger
);
