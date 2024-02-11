'use server';

import { syncService } from '@/service/sync.service';
import { revalidatePath } from 'next/cache';

export const forceUpdateNow = async () => {
  await syncService.sync(true);

  revalidatePath('/');
};
