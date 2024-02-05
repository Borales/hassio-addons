'use server';

import { haSecretService } from '@/service/secret.service';
import { revalidatePath } from 'next/cache';

export async function toggleSkipSecret(formData: FormData) {
  const id = formData.get('haSecretId') as string;

  await haSecretService.toggleSkipSecret(id);

  revalidatePath('/');
}
