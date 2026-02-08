'use server';

import { logger } from '@/service/client/logger';
import { rateLimitService } from '@/service/ratelimit.service';
import { updateTag } from 'next/cache';

export async function refreshRateLimits() {
  try {
    logger.debug('Manually refreshing rate limits');

    const data = await rateLimitService.fetchAndStore();

    // Invalidate cache
    updateTag('rate-limits');

    return { success: true, data };
  } catch (error) {
    logger.error('Failed to refresh rate limits: %o', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
