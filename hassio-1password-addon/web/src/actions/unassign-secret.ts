'use server';

import { haSecretService } from '@/service/secret.service';
import { revalidatePath } from 'next/cache';

export const unassignSecret = async (formData: FormData) => {
  const haSecretId = formData.get('haSecretId') as string;

  await haSecretService.unassignSecret(haSecretId);

  revalidatePath('/');
};
