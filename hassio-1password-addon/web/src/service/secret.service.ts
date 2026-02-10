import { Secret as HaSecret } from '@prisma-generated/client';
import { parse } from 'yaml';
import { prisma, PrismaType } from './client/db';
import {
  homeAssistantClient,
  HomeAssistantClient
} from './client/homeassistant';
import { secretHelper, SecretHelper } from './client/secret';
import { groupService, GroupService } from './group.service';

export type { HaSecret };

export class HASecretService {
  constructor(
    protected secretHelper: SecretHelper,
    protected db: PrismaType,
    protected haClient: HomeAssistantClient,
    protected groupService: GroupService
  ) {}

  /**
   * Sync secrets from the secret helper to the database
   */
  async syncSecrets() {
    const secrets = await this.secretHelper.scanForSecrets();

    await Promise.all(
      secrets.map(async (secret) => {
        await this.db.secret.upsert({
          where: { id: secret },
          create: { id: secret },
          update: {}
        });
      })
    );
  }

  /**
   * Assign 1Password secret to a Home Assistant secret
   */
  async assignSecret(
    haSecretId: string,
    opSecretId: string,
    reference: string
  ) {
    return this.db.secret.update({
      where: { id: haSecretId },
      data: { reference, itemId: opSecretId }
    });
  }

  /**
   * Unassign 1Password secret from a Home Assistant secret
   */
  async unassignSecret(haSecretId: string) {
    return this.db.secret.update({
      where: { id: haSecretId },
      data: { reference: null, itemId: null }
    });
  }

  /**
   * Get a secret by its ID
   */
  async getSecret(id: string) {
    return this.db.secret.findUnique({ where: { id } });
  }

  /**
   * Get all secrets
   */
  async getSecrets(): Promise<HaSecret[]> {
    return this.db.secret.findMany({
      orderBy: [
        // "Visible" items first
        { isSkipped: 'asc' },
        // Then assigned
        { itemId: 'desc' },
        // Then the rest
        { id: 'asc' }
      ]
    });
  }

  /**
   * Toggle the "skip" status of a secret
   */
  async toggleSkipSecret(id: string) {
    const existing = await this.db.secret.findUnique({
      where: { id },
      select: { isSkipped: true }
    });

    if (!existing) {
      return { secret: null, previousState: null };
    }

    const newState = !existing.isSkipped;
    const secret = await this.db.secret.update({
      where: { id },
      data: { isSkipped: newState }
    });

    return { secret, previousState: existing.isSkipped };
  }

  /**
   * Save secrets to the YAML file and fire events for each.
   * Returns the list of secret names that were written.
   */
  async saveSecrets(secrets: Record<string, string>) {
    const secretNames = Object.keys(secrets);

    if (secretNames.length === 0) {
      return [];
    }

    // Check which secrets are new vs updated by parsing the YAML
    const existingContent = await this.secretHelper.readSecretsFromFile();
    let existingSecrets: Record<string, unknown> = {};
    try {
      existingSecrets = existingContent ? parse(existingContent) || {} : {};
    } catch {
      // If YAML parsing fails, assume all secrets are new
      existingSecrets = {};
    }

    await this.secretHelper.save(secrets);

    // Fire events for each secret
    for (const secretName of secretNames) {
      await this.haClient.fireSecretWrittenEvent(secretName);
    }

    // Find and fire group events
    await this.fireGroupEventsForSecrets(secretNames);

    return secretNames;
  }

  /**
   * Fire events for all groups that contain any of the updated secrets.
   */
  async fireGroupEventsForSecrets(secretNames: string[]) {
    const affectedGroups =
      await this.groupService.getGroupsForSecrets(secretNames);

    await this.haClient.fireGroupUpdatedEventsForSecrets(affectedGroups);

    return affectedGroups;
  }
}

export const haSecretService = new HASecretService(
  secretHelper,
  prisma,
  homeAssistantClient,
  groupService
);
