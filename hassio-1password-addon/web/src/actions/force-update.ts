'use server';

import { onePasswordService } from '@/service/1password.service';
import { haSecretService } from '@/service/secret.service';
import { revalidatePath } from 'next/cache';

export const forceUpdateNow = async () => {
  await haSecretService.syncSecrets();
  await onePasswordService.syncItems(true);

  revalidatePath('/');
};
