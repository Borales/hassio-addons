import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Logger } from '@/service/client/logger';
import type { RateLimitClient } from '@/service/client/ratelimit';

vi.mock('@/service/client/db', () => ({ prisma: {} }));
vi.mock('@/service/client/logger', () => ({
  logger: { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() }
}));
vi.mock('@/service/client/ratelimit', () => ({ rateLimitClient: {} }));

import { RateLimitService } from '@/service/ratelimit.service';

const mockClient = {
  fetchRateLimits: vi.fn(),
  detectAccountTier: vi.fn()
} as unknown as RateLimitClient;

const mockLogger = {
  info: vi.fn(),
  debug: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
} as unknown as Logger;

function createMockDb() {
  return {
    setting: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn()
    }
  } as any;
}

const mockLimits = {
  daily: { limit: 1000, used: 100, remaining: 900, reset: '2024-01-02T00:00:00Z' },
  hourlyReads: { limit: 1000, used: 50, remaining: 950, reset: '2024-01-01T01:00:00Z' }
};

const mockAccount = { tier: 'personal' as const, displayName: '1Password / Families' };

describe('RateLimitService', () => {
  let service: RateLimitService;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    service = new RateLimitService(mockClient, mockDb, mockLogger);
    vi.clearAllMocks();
  });

  describe('fetchAndStore', () => {
    it('fetches rate limits and stores them in the database', async () => {
      vi.mocked(mockClient.fetchRateLimits).mockReturnValue(mockLimits);
      vi.mocked(mockClient.detectAccountTier).mockReturnValue(mockAccount);
      mockDb.setting.upsert.mockResolvedValue({});

      const result = await service.fetchAndStore();

      expect(result.limits).toEqual(mockLimits);
      expect(result.account).toEqual(mockAccount);
      expect(result.timestamp).toBeDefined();
      expect(mockDb.setting.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'rateLimits' } })
      );
    });

    it('calls detectAccountTier with daily and hourly limits', async () => {
      const businessLimits = {
        daily: { limit: 50000, used: 0, remaining: 50000, reset: '' },
        hourlyReads: { limit: 10000, used: 0, remaining: 10000, reset: '' }
      };
      vi.mocked(mockClient.fetchRateLimits).mockReturnValue(businessLimits);
      vi.mocked(mockClient.detectAccountTier).mockReturnValue({
        tier: 'business',
        displayName: '1Password Business'
      });
      mockDb.setting.upsert.mockResolvedValue({});

      await service.fetchAndStore();

      expect(mockClient.detectAccountTier).toHaveBeenCalledWith(50000, 10000);
    });

    it('stores data as JSON in the database', async () => {
      vi.mocked(mockClient.fetchRateLimits).mockReturnValue(mockLimits);
      vi.mocked(mockClient.detectAccountTier).mockReturnValue(mockAccount);
      mockDb.setting.upsert.mockResolvedValue({});

      await service.fetchAndStore();

      const upsertCall = mockDb.setting.upsert.mock.calls[0][0];
      const storedValue = JSON.parse(upsertCall.create.value);
      expect(storedValue.limits).toEqual(mockLimits);
      expect(storedValue.account).toEqual(mockAccount);
    });
  });

  describe('getRateLimits', () => {
    it('returns null when no rate limit data is stored', async () => {
      mockDb.setting.findUnique.mockResolvedValue(null);

      const result = await service.getRateLimits();

      expect(result).toBeNull();
    });

    it('returns parsed rate limit data', async () => {
      const stored = {
        timestamp: '2024-01-01T00:00:00Z',
        limits: mockLimits,
        account: mockAccount
      };
      mockDb.setting.findUnique.mockResolvedValue({
        id: 'rateLimits',
        value: JSON.stringify(stored)
      });

      const result = await service.getRateLimits();

      expect(result).toEqual(stored);
    });

    it('migrates old format missing the account field', async () => {
      const oldData = {
        timestamp: '2024-01-01T00:00:00Z',
        limits: mockLimits
        // no account field
      };
      mockDb.setting.findUnique.mockResolvedValue({ value: JSON.stringify(oldData) });
      vi.mocked(mockClient.detectAccountTier).mockReturnValue(mockAccount);
      mockDb.setting.update.mockResolvedValue({});

      const result = await service.getRateLimits();

      expect(result?.account).toEqual(mockAccount);
      expect(mockClient.detectAccountTier).toHaveBeenCalledWith(
        mockLimits.daily.limit,
        mockLimits.hourlyReads.limit
      );
      expect(mockDb.setting.update).toHaveBeenCalled();
    });

    it('uses fallback values when old format has missing limit fields', async () => {
      const oldData = {
        timestamp: '2024-01-01T00:00:00Z',
        limits: { daily: {}, hourlyReads: {} }
      };
      mockDb.setting.findUnique.mockResolvedValue({ value: JSON.stringify(oldData) });
      vi.mocked(mockClient.detectAccountTier).mockReturnValue(mockAccount);
      mockDb.setting.update.mockResolvedValue({});

      await service.getRateLimits();

      // Falls back to 1000 when limit fields are missing
      expect(mockClient.detectAccountTier).toHaveBeenCalledWith(1000, 1000);
    });
  });

  describe('shouldShowWarning', () => {
    it('returns false when no rate limit data is stored', async () => {
      mockDb.setting.findUnique.mockResolvedValue(null);

      const result = await service.shouldShowWarning();

      expect(result).toBe(false);
    });

    it('returns false when both limits are below the threshold', async () => {
      const data = {
        limits: {
          daily: { limit: 1000, used: 100, remaining: 900, reset: '' }, // 10%
          hourlyReads: { limit: 1000, used: 100, remaining: 900, reset: '' } // 10%
        },
        account: mockAccount
      };
      mockDb.setting.findUnique.mockResolvedValue({ value: JSON.stringify(data) });

      const result = await service.shouldShowWarning();

      expect(result).toBe(false);
    });

    it('returns true when the daily limit exceeds the threshold', async () => {
      const data = {
        limits: {
          daily: { limit: 1000, used: 950, remaining: 50, reset: '' }, // 95%
          hourlyReads: { limit: 1000, used: 100, remaining: 900, reset: '' }
        },
        account: mockAccount
      };
      mockDb.setting.findUnique.mockResolvedValue({ value: JSON.stringify(data) });

      const result = await service.shouldShowWarning();

      expect(result).toBe(true);
    });

    it('returns true when the hourly read limit exceeds the threshold', async () => {
      const data = {
        limits: {
          daily: { limit: 1000, used: 100, remaining: 900, reset: '' },
          hourlyReads: { limit: 1000, used: 950, remaining: 50, reset: '' } // 95%
        },
        account: mockAccount
      };
      mockDb.setting.findUnique.mockResolvedValue({ value: JSON.stringify(data) });

      const result = await service.shouldShowWarning();

      expect(result).toBe(true);
    });

    it('respects a custom threshold', async () => {
      const data = {
        limits: {
          daily: { limit: 1000, used: 800, remaining: 200, reset: '' }, // 80%
          hourlyReads: { limit: 1000, used: 100, remaining: 900, reset: '' }
        },
        account: mockAccount
      };
      mockDb.setting.findUnique.mockResolvedValue({ value: JSON.stringify(data) });

      expect(await service.shouldShowWarning(0.9)).toBe(false);
      expect(await service.shouldShowWarning(0.75)).toBe(true);
    });
  });

  describe('getWarningLimits', () => {
    it('returns empty array when no data is stored', async () => {
      mockDb.setting.findUnique.mockResolvedValue(null);

      const result = await service.getWarningLimits();

      expect(result).toEqual([]);
    });

    it('returns empty array when no limits exceed the threshold', async () => {
      const data = {
        limits: {
          daily: { limit: 1000, used: 100, remaining: 900, reset: '' },
          hourlyReads: { limit: 1000, used: 100, remaining: 900, reset: '' }
        },
        account: mockAccount
      };
      mockDb.setting.findUnique.mockResolvedValue({ value: JSON.stringify(data) });

      const result = await service.getWarningLimits();

      expect(result).toEqual([]);
    });

    it('returns "daily" when only the daily limit is exceeded', async () => {
      const data = {
        limits: {
          daily: { limit: 1000, used: 950, remaining: 50, reset: '' },
          hourlyReads: { limit: 1000, used: 100, remaining: 900, reset: '' }
        },
        account: mockAccount
      };
      mockDb.setting.findUnique.mockResolvedValue({ value: JSON.stringify(data) });

      const result = await service.getWarningLimits();

      expect(result).toContain('daily');
      expect(result).not.toContain('hourlyReads');
    });

    it('returns "hourlyReads" when only the hourly limit is exceeded', async () => {
      const data = {
        limits: {
          daily: { limit: 1000, used: 100, remaining: 900, reset: '' },
          hourlyReads: { limit: 1000, used: 950, remaining: 50, reset: '' }
        },
        account: mockAccount
      };
      mockDb.setting.findUnique.mockResolvedValue({ value: JSON.stringify(data) });

      const result = await service.getWarningLimits();

      expect(result).toContain('hourlyReads');
      expect(result).not.toContain('daily');
    });

    it('returns both when both limits are exceeded', async () => {
      const data = {
        limits: {
          daily: { limit: 1000, used: 950, remaining: 50, reset: '' },
          hourlyReads: { limit: 1000, used: 950, remaining: 50, reset: '' }
        },
        account: mockAccount
      };
      mockDb.setting.findUnique.mockResolvedValue({ value: JSON.stringify(data) });

      const result = await service.getWarningLimits();

      expect(result).toEqual(['daily', 'hourlyReads']);
    });
  });
});
