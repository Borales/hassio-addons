'use server';

import { onePasswordService } from '@/service/1password.service';
import { logger } from '@/service/client/logger';
import { revalidatePath } from 'next/cache';

export const refreshOpSecret = async (formData: FormData) => {
  const opSecretId = formData.get('opSecretId') as string;
  const opVaultId = formData.get('opVaultId') as string;
  logger.debug('Refreshing 1Password secret: %o', {
    opSecretId,
    opVaultId
  });

  await onePasswordService.syncItem(opSecretId, opVaultId);

  revalidatePath('/');
};
