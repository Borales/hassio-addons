import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Logger } from '@/service/client/logger';

vi.mock('@/service/client/db', () => ({ prisma: {} }));
vi.mock('@/service/client/logger', () => ({
  logger: { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() }
}));

import { GroupService } from '@/service/group.service';

const mockLogger = {
  info: vi.fn(),
  debug: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
} as unknown as Logger;

function createMockDb() {
  return {
    group: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    secretGroup: {
      create: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn()
    },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops))
  } as any;
}

describe('GroupService', () => {
  let service: GroupService;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new GroupService(mockDb, mockLogger);
    vi.clearAllMocks();
  });

  describe('createGroup', () => {
    it('creates a group with a valid name', async () => {
      const created = { id: 'uuid-1', name: 'my-group', description: null };
      mockDb.group.findUnique.mockResolvedValue(null);
      mockDb.group.create.mockResolvedValue(created);

      const result = await service.createGroup('my-group');

      expect(result).toEqual(created);
      expect(mockDb.group.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'my-group' })
        })
      );
    });

    it('throws when group name is invalid (uppercase)', async () => {
      await expect(service.createGroup('MyGroup')).rejects.toThrow();
    });

    it('throws when group name is too short', async () => {
      await expect(service.createGroup('a')).rejects.toThrow();
    });

    it('throws when group name already exists', async () => {
      mockDb.group.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(service.createGroup('my-group')).rejects.toThrow(
        'Group with name "my-group" already exists'
      );
      expect(mockDb.group.create).not.toHaveBeenCalled();
    });

    it('creates group with a description', async () => {
      const created = { id: 'uuid-1', name: 'my-group', description: 'A description' };
      mockDb.group.findUnique.mockResolvedValue(null);
      mockDb.group.create.mockResolvedValue(created);

      await service.createGroup('my-group', 'A description');

      expect(mockDb.group.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ description: 'A description' })
        })
      );
    });

    it('creates group with initial secret assignments', async () => {
      const created = { id: 'uuid-1', name: 'my-group' };
      mockDb.group.findUnique.mockResolvedValue(null);
      mockDb.group.create.mockResolvedValue(created);

      await service.createGroup('my-group', null, ['secret-1', 'secret-2']);

      expect(mockDb.group.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            secrets: {
              create: [{ secretId: 'secret-1' }, { secretId: 'secret-2' }]
            }
          })
        })
      );
    });

    it('creates group without secrets when secretIds is empty', async () => {
      mockDb.group.findUnique.mockResolvedValue(null);
      mockDb.group.create.mockResolvedValue({ id: 'uuid-1', name: 'my-group' });

      await service.createGroup('my-group', null, []);

      expect(mockDb.group.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ secrets: undefined })
        })
      );
    });
  });

  describe('updateGroup', () => {
    it('updates a group name successfully', async () => {
      const updated = { id: 'uuid-1', name: 'new-name' };
      mockDb.group.findFirst.mockResolvedValue(null);
      mockDb.group.update.mockResolvedValue(updated);

      const result = await service.updateGroup('uuid-1', { name: 'new-name' });

      expect(result).toEqual(updated);
      expect(mockDb.group.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { name: 'new-name' }
      });
    });

    it('throws when the new name already belongs to another group', async () => {
      mockDb.group.findFirst.mockResolvedValue({ id: 'other-id' });

      await expect(
        service.updateGroup('uuid-1', { name: 'existing-name' })
      ).rejects.toThrow('Group with name "existing-name" already exists');
      expect(mockDb.group.update).not.toHaveBeenCalled();
    });

    it('throws when new name is invalid', async () => {
      await expect(
        service.updateGroup('uuid-1', { name: 'INVALID NAME' })
      ).rejects.toThrow();
    });

    it('skips name validation when only description is updated', async () => {
      const updated = { id: 'uuid-1', description: 'new desc' };
      mockDb.group.update.mockResolvedValue(updated);

      await service.updateGroup('uuid-1', { description: 'new desc' });

      expect(mockDb.group.findFirst).not.toHaveBeenCalled();
      expect(mockDb.group.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { description: 'new desc' }
      });
    });
  });

  describe('deleteGroup', () => {
    it('deletes a group by id', async () => {
      mockDb.group.delete.mockResolvedValue({ id: 'uuid-1' });

      await service.deleteGroup('uuid-1');

      expect(mockDb.group.delete).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
    });
  });

  describe('getGroup', () => {
    it('returns a group with its secrets', async () => {
      const group = {
        id: 'uuid-1',
        name: 'my-group',
        secrets: [{ secretId: 'secret-1', addedAt: new Date() }]
      };
      mockDb.group.findUnique.mockResolvedValue(group);

      const result = await service.getGroup('uuid-1');

      expect(result).toEqual(group);
      expect(mockDb.group.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'uuid-1' } })
      );
    });

    it('returns null when group does not exist', async () => {
      mockDb.group.findUnique.mockResolvedValue(null);

      const result = await service.getGroup('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getGroups', () => {
    it('returns all groups ordered by name ascending', async () => {
      const groups = [
        { id: '1', name: 'alpha', secrets: [] },
        { id: '2', name: 'beta', secrets: [] }
      ];
      mockDb.group.findMany.mockResolvedValue(groups);

      const result = await service.getGroups();

      expect(result).toEqual(groups);
      expect(mockDb.group.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { name: 'asc' } })
      );
    });

    it('returns empty array when no groups exist', async () => {
      mockDb.group.findMany.mockResolvedValue([]);

      const result = await service.getGroups();

      expect(result).toEqual([]);
    });
  });

  describe('addSecretsToGroup', () => {
    it('adds each secret to a group individually', async () => {
      mockDb.secretGroup.create.mockResolvedValue({});

      await service.addSecretsToGroup('group-1', ['secret-1', 'secret-2']);

      expect(mockDb.secretGroup.create).toHaveBeenCalledTimes(2);
      expect(mockDb.secretGroup.create).toHaveBeenCalledWith({
        data: { groupId: 'group-1', secretId: 'secret-1' }
      });
      expect(mockDb.secretGroup.create).toHaveBeenCalledWith({
        data: { groupId: 'group-1', secretId: 'secret-2' }
      });
    });

    it('silently ignores duplicate secret errors', async () => {
      mockDb.secretGroup.create
        .mockRejectedValueOnce(new Error('Unique constraint violation'))
        .mockResolvedValueOnce({});

      await expect(
        service.addSecretsToGroup('group-1', ['secret-1', 'secret-2'])
      ).resolves.not.toThrow();
    });
  });

  describe('removeSecretsFromGroup', () => {
    it('removes the specified secrets from a group', async () => {
      mockDb.secretGroup.deleteMany.mockResolvedValue({ count: 2 });

      await service.removeSecretsFromGroup('group-1', ['secret-1', 'secret-2']);

      expect(mockDb.secretGroup.deleteMany).toHaveBeenCalledWith({
        where: {
          groupId: 'group-1',
          secretId: { in: ['secret-1', 'secret-2'] }
        }
      });
    });
  });

  describe('setGroupSecrets', () => {
    it('replaces all existing secrets in a group via transaction', async () => {
      mockDb.$transaction.mockResolvedValue([{ count: 1 }, { count: 2 }]);

      await service.setGroupSecrets('group-1', ['secret-1', 'secret-2']);

      expect(mockDb.$transaction).toHaveBeenCalled();
    });
  });

  describe('getGroupsForSecrets', () => {
    it('returns groups filtered to only include the requested secrets', async () => {
      mockDb.group.findMany.mockResolvedValue([
        {
          id: 'group-1',
          name: 'alpha',
          secrets: [{ secretId: 'secret-1' }, { secretId: 'secret-3' }]
        }
      ]);

      const result = await service.getGroupsForSecrets(['secret-1', 'secret-2']);

      expect(result).toEqual([
        { id: 'group-1', name: 'alpha', secrets: ['secret-1'] }
      ]);
    });

    it('returns empty array when no groups contain the secrets', async () => {
      mockDb.group.findMany.mockResolvedValue([]);

      const result = await service.getGroupsForSecrets(['secret-1']);

      expect(result).toEqual([]);
    });

    it('returns multiple groups if multiple contain the secrets', async () => {
      mockDb.group.findMany.mockResolvedValue([
        {
          id: 'group-1',
          name: 'alpha',
          secrets: [{ secretId: 'secret-1' }]
        },
        {
          id: 'group-2',
          name: 'beta',
          secrets: [{ secretId: 'secret-2' }]
        }
      ]);

      const result = await service.getGroupsForSecrets(['secret-1', 'secret-2']);

      expect(result).toHaveLength(2);
      expect(result[0].secrets).toEqual(['secret-1']);
      expect(result[1].secrets).toEqual(['secret-2']);
    });
  });
});
