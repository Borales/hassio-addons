import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Logger } from '@/service/client/logger';
import type { OnePasswordClient } from '@/service/client/1password';

vi.mock('@/service/client/db', () => ({ prisma: {} }));
vi.mock('@/service/client/logger', () => ({
  logger: { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() }
}));
vi.mock('@/service/client/1password', () => ({ onePasswordClient: {} }));

import { OnePasswordService } from '@/service/1password.service';

// Expose the protected convertOpToDbSecret method for testing
class TestOnePasswordService extends OnePasswordService {
  public exposeConvertOpToDbSecret(item: any) {
    return this.convertOpToDbSecret(item);
  }
}

const mockClient = {
  getItem: vi.fn(),
  getItems: vi.fn(),
  readItemByReference: vi.fn()
} as unknown as OnePasswordClient;

const mockLogger = {
  info: vi.fn(),
  debug: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
} as unknown as Logger;

function createMockDb() {
  return {
    item: {
      upsert: vi.fn(),
      deleteMany: vi.fn(),
      paginate: vi.fn()
    },
    vault: {
      deleteMany: vi.fn()
    },
    secret: {
      findMany: vi.fn()
    },
    setting: {
      findUnique: vi.fn(),
      upsert: vi.fn()
    }
  } as any;
}

const baseOpItem = {
  id: 'item-1',
  title: 'Test Login',
  category: 'LOGIN',
  additional_information: 'john@example.com',
  urls: [],
  fields: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
  vault: { id: 'vault-1', name: 'My Vault' }
};

describe('OnePasswordService', () => {
  let service: TestOnePasswordService;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new TestOnePasswordService(5, mockClient, mockDb, mockLogger);
    vi.clearAllMocks();
  });

  describe('convertOpToDbSecret – field masking', () => {
    it('converts basic item properties correctly', () => {
      const result = service.exposeConvertOpToDbSecret(baseOpItem);

      expect(result.id).toBe('item-1');
      expect(result.title).toBe('Test Login');
      expect(result.category).toBe('LOGIN');
      expect(result.additionalInfo).toBe('john@example.com');
    });

    it('stores dates as Date objects', () => {
      const result = service.exposeConvertOpToDbSecret(baseOpItem);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('stores urls as a JSON string', () => {
      const item = {
        ...baseOpItem,
        urls: [{ href: 'https://example.com', primary: true }]
      };

      const result = service.exposeConvertOpToDbSecret(item);

      expect(result.urls).toBe(JSON.stringify(item.urls));
    });

    it('masks CONCEALED field values, keeping first and last 3 chars', () => {
      const item = {
        ...baseOpItem,
        fields: [{ type: 'CONCEALED', value: 'password', label: 'password' }]
      };

      const result = service.exposeConvertOpToDbSecret(item);
      const fields = JSON.parse(result.fields ?? '[]');

      // 'password' (8 chars): 'pas' + '**' + 'ord'
      expect(fields[0].value).toBe('pas**ord');
    });

    it('masks short CONCEALED values (<=6 chars) entirely with asterisks', () => {
      const item = {
        ...baseOpItem,
        fields: [{ type: 'CONCEALED', value: 'abc', label: 'pin' }]
      };

      const result = service.exposeConvertOpToDbSecret(item);
      const fields = JSON.parse(result.fields ?? '[]');

      expect(fields[0].value).toBe('***');
    });

    it('returns empty CONCEALED values unchanged', () => {
      const item = {
        ...baseOpItem,
        fields: [{ type: 'CONCEALED', value: '', label: 'empty' }]
      };

      const result = service.exposeConvertOpToDbSecret(item);
      const fields = JSON.parse(result.fields ?? '[]');

      expect(fields[0].value).toBe('');
    });

    it('does not mask non-CONCEALED field values', () => {
      const item = {
        ...baseOpItem,
        fields: [{ type: 'STRING', value: 'john@example.com', label: 'username' }]
      };

      const result = service.exposeConvertOpToDbSecret(item);
      const fields = JSON.parse(result.fields ?? '[]');

      expect(fields[0].value).toBe('john@example.com');
    });

    it('strips password_details from CONCEALED fields', () => {
      const item = {
        ...baseOpItem,
        fields: [
          {
            type: 'CONCEALED',
            value: 'mysecret',
            label: 'password',
            password_details: { entropy: 85, generated: true }
          }
        ]
      };

      const result = service.exposeConvertOpToDbSecret(item);
      const fields = JSON.parse(result.fields ?? '[]');

      expect(fields[0].password_details).toBeUndefined();
    });

    it('handles items with an empty fields array', () => {
      const result = service.exposeConvertOpToDbSecret({ ...baseOpItem, fields: [] });
      const fields = JSON.parse(result.fields ?? '[]');
      expect(fields).toEqual([]);
    });
  });

  describe('isSyncNeeded', () => {
    it('returns true when no next-update timestamp is stored', async () => {
      mockDb.setting.findUnique.mockResolvedValue(null);

      const result = await service.isSyncNeeded();

      expect(result).toBe(true);
    });

    it('returns true when the stored next-update is in the past', async () => {
      const pastDate = new Date(Date.now() - 60_000).toISOString();
      mockDb.setting.findUnique.mockResolvedValue({ value: pastDate });

      const result = await service.isSyncNeeded();

      expect(result).toBe(true);
    });

    it('returns false when the stored next-update is in the future', async () => {
      const futureDate = new Date(Date.now() + 60_000).toISOString();
      mockDb.setting.findUnique.mockResolvedValue({ value: futureDate });

      const result = await service.isSyncNeeded();

      expect(result).toBe(false);
    });
  });

  describe('getLastUpdate', () => {
    it('returns an ISO string approximately TTR minutes in the past', () => {
      const now = Date.now();
      const result = service.getLastUpdate();
      const resultTime = new Date(result).getTime();
      const expectedTime = now - 5 * 60_000;

      // Allow 1 second of tolerance for test execution time
      expect(Math.abs(resultTime - expectedTime)).toBeLessThan(1000);
    });

    it('returns an ISO-formatted string', () => {
      const result = service.getLastUpdate();
      expect(() => new Date(result)).not.toThrow();
      expect(typeof result).toBe('string');
    });
  });

  describe('syncItem', () => {
    it('does nothing when the item is not found in 1Password', async () => {
      vi.mocked(mockClient.getItem).mockReturnValue(undefined as unknown as ReturnType<OnePasswordClient['getItem']>);

      await service.syncItem('item-1', 'vault-1');

      expect(mockDb.item.upsert).not.toHaveBeenCalled();
    });

    it('upserts the item when found', async () => {
      vi.mocked(mockClient.getItem).mockReturnValue(baseOpItem as any);
      mockDb.item.upsert.mockResolvedValue({});

      await service.syncItem('item-1', 'vault-1');

      expect(mockDb.item.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'item-1' } })
      );
    });

    it('includes vault connection in the create payload', async () => {
      vi.mocked(mockClient.getItem).mockReturnValue(baseOpItem as any);
      mockDb.item.upsert.mockResolvedValue({});

      await service.syncItem('item-1', 'vault-1');

      const call = mockDb.item.upsert.mock.calls[0][0];
      expect(call.create.vault).toBeDefined();
      expect(call.create.vault.connectOrCreate.create.id).toBe('vault-1');
    });
  });

  describe('syncItems', () => {
    it('skips syncing when the next update is in the future and force is false', async () => {
      const futureDate = new Date(Date.now() + 60_000).toISOString();
      mockDb.setting.findUnique.mockResolvedValue({ value: futureDate });

      await service.syncItems(false);

      expect(mockClient.getItems).not.toHaveBeenCalled();
    });

    it('runs sync when forced, even if next update is in the future', async () => {
      const futureDate = new Date(Date.now() + 60_000).toISOString();
      mockDb.setting.findUnique.mockResolvedValue({ value: futureDate });
      vi.mocked(mockClient.getItems).mockReturnValue([]);
      mockDb.secret.findMany.mockResolvedValue([]);
      mockDb.item.deleteMany.mockResolvedValue({});
      mockDb.vault.deleteMany.mockResolvedValue({});
      mockDb.setting.upsert.mockResolvedValue({});

      await service.syncItems(true);

      expect(mockClient.getItems).toHaveBeenCalled();
    });

    it('upserts all items from 1Password when sync is needed', async () => {
      mockDb.setting.findUnique.mockResolvedValue(null); // no next update → sync needed
      vi.mocked(mockClient.getItems).mockReturnValue([baseOpItem as any]);
      mockDb.secret.findMany.mockResolvedValue([]);
      mockDb.item.upsert.mockResolvedValue({});
      mockDb.item.deleteMany.mockResolvedValue({});
      mockDb.vault.deleteMany.mockResolvedValue({});
      mockDb.setting.upsert.mockResolvedValue({});

      await service.syncItems();

      expect(mockDb.item.upsert).toHaveBeenCalled();
    });

    it('fetches full item details for assigned secrets', async () => {
      mockDb.setting.findUnique.mockResolvedValue(null);
      vi.mocked(mockClient.getItems).mockReturnValue([baseOpItem as any]);
      mockDb.secret.findMany.mockResolvedValue([{ itemId: 'item-1' }]);
      vi.mocked(mockClient.getItem).mockReturnValue(baseOpItem as any);
      mockDb.item.upsert.mockResolvedValue({});
      mockDb.item.deleteMany.mockResolvedValue({});
      mockDb.vault.deleteMany.mockResolvedValue({});
      mockDb.setting.upsert.mockResolvedValue({});

      await service.syncItems();

      // getItem should be called for the assigned item to get full field data
      expect(mockClient.getItem).toHaveBeenCalledWith('item-1', 'vault-1');
    });

    it('cleans up stale items and vaults after sync', async () => {
      mockDb.setting.findUnique.mockResolvedValue(null);
      vi.mocked(mockClient.getItems).mockReturnValue([baseOpItem as any]);
      mockDb.secret.findMany.mockResolvedValue([]);
      mockDb.item.upsert.mockResolvedValue({});
      mockDb.item.deleteMany.mockResolvedValue({});
      mockDb.vault.deleteMany.mockResolvedValue({});
      mockDb.setting.upsert.mockResolvedValue({});

      await service.syncItems();

      expect(mockDb.item.deleteMany).toHaveBeenCalledWith({
        where: { NOT: { id: { in: ['item-1'] } } }
      });
      expect(mockDb.vault.deleteMany).toHaveBeenCalledWith({
        where: { NOT: { id: { in: ['vault-1'] } } }
      });
    });
  });
});
