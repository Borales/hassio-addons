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
// leaving the first and the last 3 characters visible
const maskConcealedValue = (value: string): string => {
  const numChars = 3;
  if (!value) {
    return value;
  }
  if (value.length <= 2 * numChars) {
    return '*'.repeat(value.length || 3);
  }
  const maskedLength = value.length - 2 * numChars;
  return `${value.slice(0, numChars)}${'*'.repeat(maskedLength)}${value.slice(-numChars)}`;
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
    const item = this.client.getItem(id, vaultId) as OpClientItem | undefined;

    if (!item) {
      return;
    }

    const data = this.convertOpToDbSecret(item);

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

      // Get all assigned item IDs to fetch fresh field data for them
      const assignedItems = await this.db.secret.findMany({
        where: {
          itemId: { not: null },
          reference: { not: null }
        },
        select: { itemId: true }
      });
      const assignedItemIds = new Set(assignedItems.map((s) => s.itemId));

      await Promise.all(
        opItems.map(async (item) => {
          if (!syncedItemIds.includes(item.id)) {
            syncedItemIds.push(item.id);
          }
          if (!syncedVaultIds.includes(item.vault.id)) {
            syncedVaultIds.push(item.vault.id);
          }

          // For assigned items, fetch fresh field data from 1Password
          // (list API doesn't include detailed field information)
          let itemData;
          if (assignedItemIds.has(item.id)) {
            const fullItem = this.client.getItem(item.id, item.vault.id) as
              | OpClientItem
              | undefined;
            itemData = fullItem
              ? this.convertOpToDbSecret(fullItem)
              : this.convertOpToDbSecret(item);
          } else {
            itemData = this.convertOpToDbSecret(item);
          }

          await this.db.item.upsert({
            where: { id: item.id },
            create: {
              ...itemData,
              vault: {
                connectOrCreate: {
                  where: { id: item.vault.id },
                  create: { id: item.vault.id, name: item.vault.name }
                }
              }
            },
            update: itemData
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
   * CONCEALED field values are masked when stored in the database.
   */
  protected convertOpToDbSecret(
    item: OpClientItem
  ): Omit<PrismaOpItem, 'vaultId'> {
    // Mask CONCEALED field values before storing in the database
    // skip "password_details" prop from being stored which contains JSON with password metadata
    const maskedFields = item.fields?.map((field) => ({
      ...field,
      password_details: undefined,
      value:
        field.type === 'CONCEALED'
          ? maskConcealedValue(field.value)
          : field.value
    }));

    return {
      id: item.id,
      title: item.title,
      category: item.category,
      additionalInfo: item.additional_information as string,
      urls: JSON.stringify(item.urls),
      fields: JSON.stringify(maskedFields),
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    };
  }
}

export const onePasswordService = new OnePasswordService(
  parseInt(process.env.OP_TTR as any),
  onePasswordClient,
  prisma,
  logger
);
