import type { HomeAssistantClient } from '@/service/client/homeassistant';
import type { SecretHelper } from '@/service/client/secret';
import type { GroupService } from '@/service/group.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/service/client/db', () => ({ prisma: {} }));
vi.mock('@/service/client/homeassistant', () => ({ homeAssistantClient: {} }));
vi.mock('@/service/client/secret', () => ({ secretHelper: {} }));
vi.mock('@/service/group.service', () => ({
  groupService: {},
  GroupService: vi.fn()
}));

import { HASecretService } from '@/service/secret.service';

const mockSecretHelper = {
  scanForSecrets: vi.fn(),
  readSecretsFromFile: vi.fn(),
  save: vi.fn()
} as unknown as SecretHelper;

const mockHaClient = {
  fireSecretWrittenEvent: vi.fn(),
  fireGroupUpdatedEventsForSecrets: vi.fn()
} as unknown as HomeAssistantClient;

const mockGroupService = {
  getGroupsForSecrets: vi.fn()
} as unknown as GroupService;

function createMockDb() {
  return {
    secret: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn()
    }
  } as any;
}

describe('HASecretService', () => {
  let service: HASecretService;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new HASecretService(
      mockSecretHelper,
      mockDb,
      mockHaClient,
      mockGroupService
    );
    vi.clearAllMocks();
  });

  describe('syncSecrets', () => {
    it('upserts each discovered secret into the database', async () => {
      vi.mocked(mockSecretHelper.scanForSecrets).mockResolvedValue([
        'db_password',
        'api_key'
      ]);
      mockDb.secret.upsert.mockResolvedValue({});

      await service.syncSecrets();

      expect(mockDb.secret.upsert).toHaveBeenCalledTimes(2);
      expect(mockDb.secret.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'db_password' } })
      );
      expect(mockDb.secret.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'api_key' } })
      );
    });

    it('does nothing when there are no secrets to sync', async () => {
      vi.mocked(mockSecretHelper.scanForSecrets).mockResolvedValue([]);

      await service.syncSecrets();

      expect(mockDb.secret.upsert).not.toHaveBeenCalled();
    });
  });

  describe('assignSecret', () => {
    it('links a 1Password item to a Home Assistant secret', async () => {
      const updated = {
        id: 'db_password',
        itemId: 'op-item-1',
        reference: 'op://My Vault/Login/password'
      };
      mockDb.secret.update.mockResolvedValue(updated);

      const result = await service.assignSecret(
        'db_password',
        'op-item-1',
        'op://My Vault/Login/password'
      );

      expect(result).toEqual(updated);
      expect(mockDb.secret.update).toHaveBeenCalledWith({
        where: { id: 'db_password' },
        data: { reference: 'op://My Vault/Login/password', itemId: 'op-item-1' }
      });
    });
  });

  describe('unassignSecret', () => {
    it('clears the 1Password reference from a Home Assistant secret', async () => {
      const updated = { id: 'db_password', itemId: null, reference: null };
      mockDb.secret.update.mockResolvedValue(updated);

      const result = await service.unassignSecret('db_password');

      expect(result).toEqual(updated);
      expect(mockDb.secret.update).toHaveBeenCalledWith({
        where: { id: 'db_password' },
        data: { reference: null, itemId: null }
      });
    });
  });

  describe('getSecret', () => {
    it('returns a secret by its id', async () => {
      const secret = {
        id: 'db_password',
        itemId: 'op-1',
        reference: 'op://v/i/f'
      };
      mockDb.secret.findUnique.mockResolvedValue(secret);

      const result = await service.getSecret('db_password');

      expect(result).toEqual(secret);
      expect(mockDb.secret.findUnique).toHaveBeenCalledWith({
        where: { id: 'db_password' }
      });
    });

    it('returns null when the secret does not exist', async () => {
      mockDb.secret.findUnique.mockResolvedValue(null);

      const result = await service.getSecret('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getSecrets', () => {
    it('returns all secrets ordered correctly', async () => {
      const secrets = [
        { id: 'db_password', isSkipped: false, itemId: 'op-1' },
        { id: 'api_key', isSkipped: false, itemId: null }
      ];
      mockDb.secret.findMany.mockResolvedValue(secrets);

      const result = await service.getSecrets();

      expect(result).toEqual(secrets);
      expect(mockDb.secret.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expect.arrayContaining([{ isSkipped: 'asc' }])
        })
      );
    });
  });

  describe('toggleSkipSecret', () => {
    it('toggles isSkipped from false to true', async () => {
      mockDb.secret.findUnique.mockResolvedValue({ isSkipped: false });
      mockDb.secret.update.mockResolvedValue({
        id: 'db_password',
        isSkipped: true
      });

      const result = await service.toggleSkipSecret('db_password');

      expect(result.previousState).toBe(false);
      expect(result.secret?.isSkipped).toBe(true);
      expect(mockDb.secret.update).toHaveBeenCalledWith({
        where: { id: 'db_password' },
        data: { isSkipped: true }
      });
    });

    it('toggles isSkipped from true to false', async () => {
      mockDb.secret.findUnique.mockResolvedValue({ isSkipped: true });
      mockDb.secret.update.mockResolvedValue({
        id: 'db_password',
        isSkipped: false
      });

      const result = await service.toggleSkipSecret('db_password');

      expect(result.previousState).toBe(true);
      expect(result.secret?.isSkipped).toBe(false);
    });

    it('returns null values when the secret does not exist', async () => {
      mockDb.secret.findUnique.mockResolvedValue(null);

      const result = await service.toggleSkipSecret('nonexistent');

      expect(result.secret).toBeNull();
      expect(result.previousState).toBeNull();
      expect(mockDb.secret.update).not.toHaveBeenCalled();
    });
  });

  describe('saveSecrets', () => {
    it('returns an empty array when no secrets are provided', async () => {
      const result = await service.saveSecrets({});

      expect(result).toEqual([]);
      expect(mockSecretHelper.save).not.toHaveBeenCalled();
    });

    it('saves secrets to file and returns the secret names', async () => {
      vi.mocked(mockSecretHelper.readSecretsFromFile).mockResolvedValue('');
      vi.mocked(mockSecretHelper.save).mockResolvedValue(undefined);
      vi.mocked(mockHaClient.fireSecretWrittenEvent).mockResolvedValue(true);
      vi.mocked(mockGroupService.getGroupsForSecrets).mockResolvedValue([]);
      vi.mocked(
        mockHaClient.fireGroupUpdatedEventsForSecrets
      ).mockResolvedValue(undefined);

      const result = await service.saveSecrets({
        db_password: 'secret1',
        api_key: 'secret2'
      });

      expect(result).toEqual(['db_password', 'api_key']);
      expect(mockSecretHelper.save).toHaveBeenCalledWith({
        db_password: 'secret1',
        api_key: 'secret2'
      });
    });

    it('fires a written event for each saved secret', async () => {
      vi.mocked(mockSecretHelper.readSecretsFromFile).mockResolvedValue('');
      vi.mocked(mockSecretHelper.save).mockResolvedValue(undefined);
      vi.mocked(mockHaClient.fireSecretWrittenEvent).mockResolvedValue(true);
      vi.mocked(mockGroupService.getGroupsForSecrets).mockResolvedValue([]);
      vi.mocked(
        mockHaClient.fireGroupUpdatedEventsForSecrets
      ).mockResolvedValue(undefined);

      await service.saveSecrets({ db_password: 'val1', api_key: 'val2' });

      expect(mockHaClient.fireSecretWrittenEvent).toHaveBeenCalledTimes(2);
      expect(mockHaClient.fireSecretWrittenEvent).toHaveBeenCalledWith(
        'db_password'
      );
      expect(mockHaClient.fireSecretWrittenEvent).toHaveBeenCalledWith(
        'api_key'
      );
    });

    it('fires group events for groups containing the updated secrets', async () => {
      vi.mocked(mockSecretHelper.readSecretsFromFile).mockResolvedValue('');
      vi.mocked(mockSecretHelper.save).mockResolvedValue(undefined);
      vi.mocked(mockHaClient.fireSecretWrittenEvent).mockResolvedValue(true);

      const affectedGroups = [
        { id: 'group-1', name: 'prod', secrets: ['db_password'] }
      ];
      vi.mocked(mockGroupService.getGroupsForSecrets).mockResolvedValue(
        affectedGroups
      );
      vi.mocked(
        mockHaClient.fireGroupUpdatedEventsForSecrets
      ).mockResolvedValue(undefined);

      await service.saveSecrets({ db_password: 'val' });

      expect(mockGroupService.getGroupsForSecrets).toHaveBeenCalledWith([
        'db_password'
      ]);
      expect(
        mockHaClient.fireGroupUpdatedEventsForSecrets
      ).toHaveBeenCalledWith(affectedGroups);
    });

    it('handles malformed YAML in the existing secrets file gracefully', async () => {
      vi.mocked(mockSecretHelper.readSecretsFromFile).mockResolvedValue(
        '{ unclosed: ['
      );
      vi.mocked(mockSecretHelper.save).mockResolvedValue(undefined);
      vi.mocked(mockHaClient.fireSecretWrittenEvent).mockResolvedValue(true);
      vi.mocked(mockGroupService.getGroupsForSecrets).mockResolvedValue([]);
      vi.mocked(
        mockHaClient.fireGroupUpdatedEventsForSecrets
      ).mockResolvedValue(undefined);

      await expect(
        service.saveSecrets({ db_password: 'val' })
      ).resolves.not.toThrow();
    });
  });

  describe('fireGroupEventsForSecrets', () => {
    it('fires group updated events for all affected groups', async () => {
      const groups = [
        { id: 'group-1', name: 'prod', secrets: ['db_password'] }
      ];
      vi.mocked(mockGroupService.getGroupsForSecrets).mockResolvedValue(groups);
      vi.mocked(
        mockHaClient.fireGroupUpdatedEventsForSecrets
      ).mockResolvedValue(undefined);

      const result = await service.fireGroupEventsForSecrets(['db_password']);

      expect(result).toEqual(groups);
      expect(mockGroupService.getGroupsForSecrets).toHaveBeenCalledWith([
        'db_password'
      ]);
      expect(
        mockHaClient.fireGroupUpdatedEventsForSecrets
      ).toHaveBeenCalledWith(groups);
    });

    it('returns empty array when no groups are affected', async () => {
      vi.mocked(mockGroupService.getGroupsForSecrets).mockResolvedValue([]);
      vi.mocked(
        mockHaClient.fireGroupUpdatedEventsForSecrets
      ).mockResolvedValue(undefined);

      const result = await service.fireGroupEventsForSecrets(['db_password']);

      expect(result).toEqual([]);
    });
  });
});
