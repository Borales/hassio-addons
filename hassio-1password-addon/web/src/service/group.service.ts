import { createGroupNameSchema } from '@/lib/group-validation';
import { Group, SecretGroup } from '@prisma-generated/client';
import { prisma, PrismaType } from './client/db';
import { Logger, logger } from './client/logger';

export type GroupWithSecrets = Group & {
  secrets: Pick<SecretGroup, 'secretId' | 'addedAt'>[];
};

export type { Group };

// Create a default schema for service-level validation (English messages)
const groupNameSchema = createGroupNameSchema({
  required: 'Group name is required',
  invalid:
    'Group name must contain only lowercase letters, numbers, underscores, and hyphens',
  tooShort: 'Group name must be at least 1 character',
  tooLong: 'Group name must be at most 50 characters'
});

export class GroupService {
  constructor(
    protected db: PrismaType,
    protected logger: Logger
  ) {}

  /**
   * Create a new group.
   */
  async createGroup(
    name: string,
    description?: string | null,
    secretIds?: string[]
  ): Promise<Group> {
    const validation = groupNameSchema.safeParse(name);
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    // Check for duplicate name
    const existing = await this.db.group.findUnique({ where: { name } });
    if (existing) {
      throw new Error(`Group with name "${name}" already exists`);
    }

    this.logger.info('Creating group: %s', name);

    return this.db.group.create({
      data: {
        name,
        description,
        secrets: secretIds?.length
          ? {
              create: secretIds.map((secretId) => ({ secretId }))
            }
          : undefined
      }
    });
  }

  /**
   * Update an existing group.
   */
  async updateGroup(
    id: string,
    data: { name?: string; description?: string | null }
  ): Promise<Group> {
    if (data.name) {
      const validation = groupNameSchema.safeParse(data.name);
      if (!validation.success) {
        throw new Error(validation.error.issues[0].message);
      }

      // Check for duplicate name (excluding current group)
      const existing = await this.db.group.findFirst({
        where: { name: data.name, NOT: { id } }
      });
      if (existing) {
        throw new Error(`Group with name "${data.name}" already exists`);
      }
    }

    this.logger.info('Updating group: %s', id);

    return this.db.group.update({
      where: { id },
      data
    });
  }

  /**
   * Delete a group.
   */
  async deleteGroup(id: string) {
    this.logger.info('Deleting group: %s', id);
    await this.db.group.delete({ where: { id } });
  }

  /**
   * Get a group by ID.
   */
  async getGroup(id: string): Promise<GroupWithSecrets | null> {
    return this.db.group.findUnique({
      where: { id },
      include: {
        secrets: {
          select: { secretId: true, addedAt: true }
        }
      }
    });
  }

  /**
   * Get a group by name.
   */
  async getGroupByName(name: string): Promise<GroupWithSecrets | null> {
    return this.db.group.findUnique({
      where: { name },
      include: {
        secrets: {
          select: { secretId: true, addedAt: true }
        }
      }
    });
  }

  /**
   * Get all groups.
   */
  async getGroups(): Promise<GroupWithSecrets[]> {
    return this.db.group.findMany({
      include: {
        secrets: {
          select: { secretId: true, addedAt: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Add secrets to a group.
   */
  async addSecretsToGroup(groupId: string, secretIds: string[]) {
    this.logger.info('Adding secrets to group %s: %o', groupId, secretIds);

    // Add each secret individually, ignoring duplicates
    for (const secretId of secretIds) {
      try {
        await this.db.secretGroup.create({
          data: { groupId, secretId }
        });
      } catch {
        // Ignore duplicate key errors
      }
    }
  }

  /**
   * Remove secrets from a group.
   */
  async removeSecretsFromGroup(groupId: string, secretIds: string[]) {
    this.logger.info('Removing secrets from group %s: %o', groupId, secretIds);

    await this.db.secretGroup.deleteMany({
      where: {
        groupId,
        secretId: { in: secretIds }
      }
    });
  }

  /**
   * Set the secrets for a group (replaces all existing).
   */
  async setGroupSecrets(groupId: string, secretIds: string[]) {
    this.logger.info('Setting secrets for group %s: %o', groupId, secretIds);

    await this.db.$transaction([
      // Remove all existing
      this.db.secretGroup.deleteMany({ where: { groupId } }),
      // Add new ones
      this.db.secretGroup.createMany({
        data: secretIds.map((secretId) => ({ groupId, secretId }))
      })
    ]);
  }

  /**
   * Get all groups that contain any of the given secrets.
   */
  async getGroupsForSecrets(secretIds: string[]) {
    const groups = await this.db.group.findMany({
      where: {
        secrets: {
          some: { secretId: { in: secretIds } }
        }
      },
      include: {
        secrets: {
          select: { secretId: true }
        }
      }
    });

    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      secrets: group.secrets
        .map((s) => s.secretId)
        .filter((id) => secretIds.includes(id))
    }));
  }

  /**
   * Get groups that a specific secret belongs to.
   */
  async getGroupsForSecret(secretId: string) {
    return this.db.group.findMany({
      where: {
        secrets: {
          some: { secretId }
        }
      },
      select: { id: true, name: true }
    });
  }
}

export const groupService = new GroupService(prisma, logger);
