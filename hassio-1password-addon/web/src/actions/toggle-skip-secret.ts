'use server';

import { logger } from '@/service/client/logger';
import { haSecretService } from '@/service/secret.service';
import { revalidatePath } from 'next/cache';

export async function toggleSkipSecret(formData: FormData) {
  const haSecretId = formData.get('haSecretId') as string;
  logger.debug('Toggling skip secret: %o', {
    haSecretId
  });

  await haSecretService.toggleSkipSecret(haSecretId);

  revalidatePath('/');
}
