'use server';

import { onePasswordService } from '@/service/1password.service';
import { revalidatePath } from 'next/cache';

export const refreshOpSecret = async (formData: FormData) => {
  const opSecretId = formData.get('opSecretId') as string;
  const opVaultId = formData.get('opVaultId') as string;

  await onePasswordService.syncItem(opSecretId, opVaultId);

  revalidatePath('/');
};
