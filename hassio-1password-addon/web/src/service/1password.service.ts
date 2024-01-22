import {
  onePasswordClient,
  OnePasswordClient,
  OpClientItem,
} from "./client/1password";
import { prisma, PrismaType, OpVault, HaSecret, OpItem } from "./client/db";

export type { OpVault, HaSecret, OpItem };

const NEXT_UPDATE_KEY = "nextUpdate";

export class OnePasswordService {
  constructor(
    public ttr: number,
    public client: OnePasswordClient,
    public db: PrismaType
  ) {}

  /**
   * Sync all entries (secrets and vaults) from 1Password to the database.
   */
  async syncEntries(force: boolean = false) {
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
                  create: { id: item.vault.id, name: item.vault.name },
                },
              },
            },
            update: this.convertOpToDbSecret(item),
          });
        })
      );

      // Clean up any items that no longer accessible in 1Password.
      await this.db.item.deleteMany({
        where: { NOT: { id: { in: syncedItemIds } } },
      });
      // Clean up any vaults that no longer accessible in 1Password.
      await this.db.vault.deleteMany({
        where: { NOT: { id: { in: syncedVaultIds } } },
      });

      await this.updateNextSync();
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Check NEXT_UPDATE_KEY to see if a sync is needed.
   */
  async isSyncNeeded() {
    const nextUpdate = await this.db.setting.findUnique({
      where: { id: NEXT_UPDATE_KEY },
    });

    if (!nextUpdate) {
      return true;
    }

    return new Date() > new Date(nextUpdate.value);
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
      update: { value: nextUpdateDate },
    });
  }

  /**
   * Get all items.
   */
  async getItems() {
    return this.db.item.findMany({
      include: { vault: true },
      orderBy: { updatedAt: "desc" },
    });
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

  protected convertOpToDbSecret(
    item: OpClientItem
  ): Omit<OpItem, "vaultId" | "icon"> {
    return {
      id: item.id,
      title: item.title,
      category: item.category,
      additionalInfo: item.additional_information as string,
      urls: JSON.stringify(item.urls),
      fields: JSON.stringify(item.fields),
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    };
  }
}

export const onePasswordService = new OnePasswordService(
  parseInt(process.env.OP_TTR as any),
  onePasswordClient,
  prisma
);
