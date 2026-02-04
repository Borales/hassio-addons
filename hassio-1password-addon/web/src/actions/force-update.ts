'use server';

import { logger } from '@/service/client/logger';
import { syncService } from '@/service/sync.service';
import { updateTag } from 'next/cache';

export const forceUpdateNow = async () => {
  logger.debug('Forcing update');
  await syncService.sync(true);

  // Invalidate all data after forced sync
  updateTag('op-items');
  updateTag('op-metadata');
  updateTag('secrets');
  updateTag('groups');
};
