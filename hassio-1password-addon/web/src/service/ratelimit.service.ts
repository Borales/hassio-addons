import { PrismaType, prisma } from './client/db';
import { Logger, logger } from './client/logger';
import {
  AccountInfo,
  RateLimitClient,
  RateLimitData,
  rateLimitClient
} from './client/ratelimit';

const RATE_LIMITS_KEY = 'rateLimits';

export interface StoredRateLimitData {
  timestamp: string;
  limits: RateLimitData;
  account: AccountInfo;
}

export class RateLimitService {
  constructor(
    protected client: RateLimitClient,
    protected db: PrismaType,
    protected logger: Logger
  ) {}

  /**
   * Fetch rate limits from 1Password and store in database
   */
  async fetchAndStore(): Promise<StoredRateLimitData> {
    this.logger.debug('Fetching rate limits from 1Password');

    const limits = this.client.fetchRateLimits();
    const account = this.client.detectAccountTier(
      limits.daily.limit,
      limits.hourlyReads.limit
    );

    const data: StoredRateLimitData = {
      timestamp: new Date().toISOString(),
      limits,
      account
    };

    await this.db.setting.upsert({
      where: { id: RATE_LIMITS_KEY },
      create: { id: RATE_LIMITS_KEY, value: JSON.stringify(data) },
      update: { value: JSON.stringify(data) }
    });

    this.logger.info('Rate limits updated: %o', { limits, account });
    return data;
  }

  /**
   * Get stored rate limits from database
   */
  async getRateLimits(): Promise<StoredRateLimitData | null> {
    const setting = await this.db.setting.findUnique({
      where: { id: RATE_LIMITS_KEY }
    });

    if (!setting) {
      return null;
    }

    const parsed = JSON.parse(setting.value) as any;

    // Handle old data format (migration from defaults to account)
    if (parsed.limits && !parsed.account) {
      this.logger.warn(
        'Found old rate limit data format, detecting account tier'
      );

      // Detect account tier from existing limits
      const account = this.client.detectAccountTier(
        parsed.limits.daily?.limit ?? 1000,
        parsed.limits.hourlyReads?.limit ?? 1000
      );

      const migratedData: StoredRateLimitData = {
        timestamp: parsed.timestamp,
        limits: parsed.limits,
        account
      };

      // Store migrated data back to database
      await this.db.setting.update({
        where: { id: RATE_LIMITS_KEY },
        data: { value: JSON.stringify(migratedData) }
      });

      return migratedData;
    }

    return parsed as StoredRateLimitData;
  }

  /**
   * Check if any rate limit is approaching the threshold (default 90%)
   */
  async shouldShowWarning(threshold: number = 0.9): Promise<boolean> {
    const data = await this.getRateLimits();

    if (!data) {
      return false;
    }

    const { limits } = data;

    return (
      limits.daily.used / limits.daily.limit >= threshold ||
      limits.hourlyReads.used / limits.hourlyReads.limit >= threshold
    );
  }

  /**
   * Get which limits are at or above threshold (default 90%)
   * Returns array of limit names: 'daily', 'hourlyReads'
   */
  async getWarningLimits(threshold: number = 0.9): Promise<string[]> {
    const data = await this.getRateLimits();

    if (!data) {
      return [];
    }

    const warnings: string[] = [];
    const { limits } = data;

    if (limits.daily.used / limits.daily.limit >= threshold) {
      warnings.push('daily');
    }
    if (limits.hourlyReads.used / limits.hourlyReads.limit >= threshold) {
      warnings.push('hourlyReads');
    }

    return warnings;
  }
}

export const rateLimitService = new RateLimitService(
  rateLimitClient,
  prisma,
  logger
);
