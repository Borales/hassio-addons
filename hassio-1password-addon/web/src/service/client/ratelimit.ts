import { execSync } from 'child_process';
import { Logger, logger } from './logger';

export interface RateLimitMetric {
  limit: number;
  used: number;
  remaining: number;
  reset: string; // ISO timestamp when limit resets
}

export interface RateLimitData {
  daily: RateLimitMetric;
  hourlyReads: RateLimitMetric;
}

export type AccountTier = 'business' | 'teams' | 'personal' | 'families';

export interface AccountInfo {
  tier: AccountTier;
  displayName: string;
}

export class RateLimitClient {
  constructor(
    protected serviceAccountToken: string,
    protected logger: Logger
  ) {}

  /**
   * Fetch rate limits using op CLI service-account ratelimit command
   */
  fetchRateLimits(): RateLimitData {
    try {
      this.logger.debug('Fetching rate limits from 1Password CLI');

      // Execute: op service-account ratelimit --format json
      const output = execSync('op service-account ratelimit --format json', {
        env: {
          ...process.env,
          OP_SERVICE_ACCOUNT_TOKEN: this.serviceAccountToken
        },
        encoding: 'utf-8',
        timeout: 10000 // 10 second timeout
      });

      const data = JSON.parse(output);
      this.logger.debug('Raw CLI output: %o', data);

      // Transform CLI output to our standard format
      return this.transformCliOutput(data);
    } catch (error) {
      this.logger.error('Failed to fetch rate limits: %o', error);
      throw error;
    }
  }

  /**
   * Detect account tier based on rate limits
   * Business: 50k daily, 10k hourly reads
   * Teams: 5k daily, 1k hourly reads
   * Personal/Families: 1k daily, 1k hourly reads
   */
  detectAccountTier(dailyLimit: number, hourlyReadLimit: number): AccountInfo {
    if (dailyLimit >= 50000) {
      return { tier: 'business', displayName: '1Password Business' };
    } else if (dailyLimit >= 5000) {
      return { tier: 'teams', displayName: '1Password Teams' };
    } else if (hourlyReadLimit >= 1000) {
      // Could be Personal or Families (same limits)
      return { tier: 'personal', displayName: '1Password / Families' };
    } else {
      // Fallback
      return { tier: 'personal', displayName: '1Password' };
    }
  }

  /**
   * Transform CLI output to our standard format
   * CLI returns an array of rate limit objects with type and action
   */
  private transformCliOutput(cliData: any): RateLimitData {
    this.logger.debug('Parsing CLI data structure: %o', cliData);

    const now = Date.now();

    if (!Array.isArray(cliData)) {
      this.logger.error(
        'Expected CLI data to be an array, got: %o',
        typeof cliData
      );
      const fallbackReset = new Date(now + 3600000).toISOString(); // 1 hour from now
      return {
        daily: { limit: 1000, used: 0, remaining: 1000, reset: fallbackReset },
        hourlyReads: {
          limit: 1000,
          used: 0,
          remaining: 1000,
          reset: fallbackReset
        }
      };
    }

    // Find daily limit (account-level, read_write)
    const dailyData = cliData.find(
      (item: any) => item.type === 'account' && item.action === 'read_write'
    );

    // Find hourly read limit (token-level, read)
    const hourlyReadData = cliData.find(
      (item: any) => item.type === 'token' && item.action === 'read'
    );

    const daily: RateLimitMetric = {
      limit: dailyData?.limit ?? 1000,
      used: dailyData?.used ?? 0,
      remaining:
        dailyData?.remaining ??
        (dailyData?.limit ?? 1000) - (dailyData?.used ?? 0),
      reset: dailyData?.reset
        ? new Date(now + dailyData.reset * 1000).toISOString()
        : new Date(now + 86400000).toISOString() // 24 hours from now
    };

    const hourlyReads: RateLimitMetric = {
      limit: hourlyReadData?.limit ?? 1000,
      used: hourlyReadData?.used ?? 0,
      remaining:
        hourlyReadData?.remaining ??
        (hourlyReadData?.limit ?? 1000) - (hourlyReadData?.used ?? 0),
      reset: hourlyReadData?.reset
        ? new Date(now + hourlyReadData.reset * 1000).toISOString()
        : new Date(now + 3600000).toISOString() // 1 hour from now
    };

    this.logger.debug('Transformed rate limits: %o', { daily, hourlyReads });

    return { daily, hourlyReads };
  }
}

export const rateLimitClient = new RateLimitClient(
  process.env.OP_SERVICE_ACCOUNT_TOKEN || '',
  logger
);
