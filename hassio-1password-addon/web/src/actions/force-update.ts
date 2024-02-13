'use server';

import { logger } from '@/service/client/logger';
import { syncService } from '@/service/sync.service';
import { revalidatePath } from 'next/cache';

export const forceUpdateNow = async () => {
  logger.debug('Forcing update');
  await syncService.sync(true);

  revalidatePath('/');
};
