'use server';

import { haSecretService } from '@/service/secret.service';
import { revalidatePath } from 'next/cache';

export const assignSecret = async (formData: FormData) => {
  const haSecretId = formData.get('haSecretId') as string;
  const opSecretId = formData.get('opSecretId') as string;
  const ref = formData.get('ref') as string;

  await haSecretService.assignSecret(haSecretId, opSecretId, ref);

  revalidatePath('/');
};
