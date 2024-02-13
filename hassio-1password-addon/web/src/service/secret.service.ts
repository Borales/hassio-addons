import { Secret as HaSecret } from '@prisma/client';
import { prisma, PrismaType } from './client/db';
import { secretHelper, SecretHelper } from './client/secret';

export type { HaSecret };

export class HASecretService {
  constructor(
    protected secretHelper: SecretHelper,
    protected db: PrismaType
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
      return;
    }

    return this.db.secret.update({
      where: { id },
      data: { isSkipped: !existing.isSkipped }
    });
  }

  async saveSecrets(secrets: Record<string, string>) {
    return this.secretHelper.save(secrets);
  }
}

export const haSecretService = new HASecretService(secretHelper, prisma);
