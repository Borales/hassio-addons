'use server';

import { logger } from '@/service/client/logger';
import { haSecretService } from '@/service/secret.service';
import { revalidatePath } from 'next/cache';

export const unassignSecret = async (formData: FormData) => {
  const haSecretId = formData.get('haSecretId') as string;
  logger.debug('Unassigning secret: %o', {
    haSecretId
  });

  await haSecretService.unassignSecret(haSecretId);

  revalidatePath('/');
};
