'use server';

import { logger } from '@/service/client/logger';
import { syncService } from '@/service/sync.service';
import { getTranslations } from 'next-intl/server';
import { updateTag } from 'next/cache';

export type ForceUpdateResult =
  { success: true; changedCount: number } | { success: false; error?: string };

export const forceUpdateNow = async (): Promise<ForceUpdateResult> => {
  const t = await getTranslations('toast');
  logger.debug('Forcing update');

  try {
    const { changedSecrets } = await syncService.sync(true);

    return { success: true, changedCount: changedSecrets.length };
  } catch (error) {
    logger.error('Failed to force update: %o', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : t('syncFailed')
    };
  } finally {
    // Invalidate all data after forced sync
    updateTag('op-items');
    updateTag('op-metadata');
    updateTag('secrets');
    updateTag('groups');
    updateTag('rate-limits');
  }
};
