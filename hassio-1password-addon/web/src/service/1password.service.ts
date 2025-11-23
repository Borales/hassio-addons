import { Field, URL } from '@1password/op-js';
import { Prisma } from '@prisma-generated/client';
import {
  OnePasswordClient,
  OpClientItem,
  onePasswordClient
} from './client/1password';
import {
  HaSecret,
  OpVault,
  OpItem as PrismaOpItem,
  PrismaType,
  prisma
} from './client/db';
import { Logger, logger } from './client/logger';

type OpItem = Omit<PrismaOpItem, 'urls' | 'fields'> & {
  urls: URL[];
  fields: Field[];
};

export type { HaSecret, OpItem, OpVault };

const NEXT_UPDATE_KEY = 'nextUpdate';

type Pagination = {
  limit: number;
  page: number;
};

type ListParams = {
  pagination?: Pagination;
};

// Replace the middle part of the password with asterisks
// leaving the first and the last X characters visible
const maskPassword = (password: string, numChars: number = 2): string => {
  if (!password) {
    return password;
  }
  if (password.length <= 2 * numChars) {
    return '***';
  }
  return `${password.slice(0, numChars)}***${password.slice(-numChars)}`;
};

export class OnePasswordService {
  constructor(
    protected ttr: number,
    protected client: OnePasswordClient,
    protected db: PrismaType,
    protected logger: Logger
  ) {}

  /**
   * Sync fields of a secret from 1Password to the database
   */
  async syncItem(id: string, vaultId: string) {
    const item = this.client.getItem(id, vaultId);

    if (!item) {
      return;
    }

    const data = this.convertOpToDbSecret(item);
    // TODO: mask the fields

    await this.db.item.upsert({
      where: { id },
      create: {
        ...data,
        vault: {
          connectOrCreate: {
            where: { id: vaultId },
            create: { id: vaultId, name: item.vault.name }
          }
        }
      },
      update: { ...data }
    });
  }

  /**
   * Sync all entries (secrets and vaults) from 1Password to the database if needed.
   */
  async syncItems(force: boolean = false) {
    const syncNeeded = await this.isSyncNeeded();

    if (!syncNeeded && !force) {
      return;
    }

    try {
      const opItems = this.client.getItems();

      const syncedItemIds: string[] = [];
      const syncedVaultIds: string[] = [];

      await Promise.all(
        opItems.map(async (item) => {
          if (!syncedItemIds.includes(item.id)) {
            syncedItemIds.push(item.id);
          }
          if (!syncedVaultIds.includes(item.vault.id)) {
            syncedVaultIds.push(item.vault.id);
          }

          await this.db.item.upsert({
            where: { id: item.id },
            create: {
              ...this.convertOpToDbSecret(item),
              vault: {
                connectOrCreate: {
                  where: { id: item.vault.id },
                  create: { id: item.vault.id, name: item.vault.name }
                }
              }
            },
            update: this.convertOpToDbSecret(item)
          });
        })
      );

      // Clean up any items that no longer accessible in 1Password.
      await this.db.item.deleteMany({
        where: { NOT: { id: { in: syncedItemIds } } }
      });
      // Clean up any vaults that no longer accessible in 1Password.
      await this.db.vault.deleteMany({
        where: { NOT: { id: { in: syncedVaultIds } } }
      });

      // TODO: check for updated assigned fields

      await this.updateNextSync();
    } catch (e) {
      this.logger.error('Error syncing items', e);
    }
  }

  /**
   * Get items from DB that were updated after the last sync.
   */
  async getRecentlyUpdatedItems() {
    const lastSync = this.getLastUpdate();

    this.logger.debug(
      'Getting recently updated items for the past %d minutes',
      this.ttr
    );

    const items = await this.db.secret.findMany({
      where: {
        reference: { not: null },
        itemId: { not: null },
        isSkipped: false,
        OR: [
          { updatedAt: { gt: lastSync } },
          { item: { updatedAt: { gt: lastSync } } }
        ]
      }
    });

    if (!items.length) {
      return {};
    }

    const result: Record<string, string> = {};

    items.forEach((item) => {
      const secret = this.client.readItemByReference(item.reference as string);
      result[item.id] = secret;
    });

    return result;
  }

  /**
   * Check if a sync is needed
   */
  async isSyncNeeded() {
    const nextUpdate = await this.getNextUpdate();

    if (!nextUpdate) {
      return true;
    }

    return new Date() > new Date(nextUpdate);
  }

  /**
   * Get the next update time from the database.
   */
  async getNextUpdate() {
    const nextUpdate = await this.db.setting.findUnique({
      where: { id: NEXT_UPDATE_KEY }
    });

    return nextUpdate?.value;
  }

  /**
   * Get the last update time (approx TTR minutes ago)
   */
  getLastUpdate() {
    return new Date(
      new Date().getTime() - (this.ttr || 1) * 60000
    ).toISOString();
  }

  /**
   * Update the NEXT_UPDATE_KEY to the current time + TTR.
   */
  async updateNextSync() {
    const nextUpdateDate = new Date(
      new Date().getTime() + (this.ttr || 1) * 60000
    ).toISOString();

    await this.db.setting.upsert({
      where: { id: NEXT_UPDATE_KEY },
      create: { id: NEXT_UPDATE_KEY, value: nextUpdateDate },
      update: { value: nextUpdateDate }
    });
  }

  /**
   * Get all items.
   */
  async getItems(params: ListParams & { vault?: string; search?: string }) {
    const where: Prisma.ItemWhereInput = {};
    if (params.vault) {
      where.vaultId = params.vault;
    }
    if (params.search) {
      where.OR = [
        { title: { contains: params.search } },
        { additionalInfo: { contains: params.search } },
        { urls: { contains: params.search } },
        { fields: { contains: params.search } }
      ];
    }

    return this.db.item
      .paginate({
        where,
        include: { vault: true },
        orderBy: { updatedAt: 'desc' }
      })
      .withPages({
        includePageCount: true,
        limit: params.pagination?.limit || 20,
        page: params.pagination?.page || 1
      });
  }

  /**
   * Masking all the secrets directly in the service
   * to avoid exposing the secrets to the client-side.
   */
  async getItemsSecurely(
    params: ListParams & { vault?: string; search?: string }
  ): ReturnType<OnePasswordService['getItems']> {
    const [items, pagination] = await this.getItems(params);
    const secureItems = items.map((item) => this.maskSecrets(item));

    return [secureItems, pagination];
  }

  async getItem(id: string, vaultId: string) {
    return this.db.item.findUnique({ where: { id, vaultId } });
  }

  /**
   * Get all vaults.
   */
  async getVaults() {
    return this.db.vault.findMany();
  }

  /**
   * Get a vault by its ID.
   */
  async getVault(id: string) {
    return this.db.vault.findUnique({ where: { id } });
  }

  /**
   * Convert an 1Password item to a database secret.
   */
  protected convertOpToDbSecret(
    item: OpClientItem
  ): Omit<PrismaOpItem, 'vaultId'> {
    return {
      id: item.id,
      title: item.title,
      category: item.category,
      additionalInfo: item.additional_information as string,
      urls: JSON.stringify(item.urls),
      fields: JSON.stringify(item.fields),
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    };
  }

  protected maskSecrets<T>(item: T & { fields?: Field[] }) {
    const { fields, ...rest } = item;

    const secureFields: Field[] =
      fields?.map((field) => ({
        ...field,
        value:
          field.type === 'CONCEALED' ? maskPassword(field.value) : field.value
      })) || [];

    return {
      ...rest,
      fields: secureFields
    };
  }
}

export const onePasswordService = new OnePasswordService(
  parseInt(process.env.OP_TTR as any),
  onePasswordClient,
  prisma,
  logger
);
