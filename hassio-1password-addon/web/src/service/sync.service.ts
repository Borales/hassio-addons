import { onePasswordService, OnePasswordService } from './1password.service';
import { haSecretService, HASecretService } from './secret.service';

export class SyncService {
  constructor(
    protected onePasswordService: OnePasswordService,
    protected haSecretService: HASecretService
  ) {}

  async sync(force?: boolean) {
    await this.haSecretService.syncSecrets();
    await this.onePasswordService.syncItems(force);
  }
}

export const syncService = new SyncService(onePasswordService, haSecretService);
