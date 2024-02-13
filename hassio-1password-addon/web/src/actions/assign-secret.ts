'use server';

import { logger } from '@/service/client/logger';
import { haSecretService } from '@/service/secret.service';
import { revalidatePath } from 'next/cache';

export const assignSecret = async (formData: FormData) => {
  const haSecretId = formData.get('haSecretId') as string;
  const opSecretId = formData.get('opSecretId') as string;
  const ref = formData.get('ref') as string;

  logger.debug('Assigning secret: %o', {
    haSecretId,
    opSecretId,
    ref
  });

  await haSecretService.assignSecret(haSecretId, opSecretId, ref);

  revalidatePath('/');
};
