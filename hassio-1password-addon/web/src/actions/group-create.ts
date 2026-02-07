'use server';

import { createTranslatedGroupNameSchema } from '@/lib/group-validation';
import { logger } from '@/service/client/logger';
import { groupService } from '@/service/group.service';
import { getTranslations } from 'next-intl/server';
import { updateTag } from 'next/cache';

export type GroupCreateResult = {
  success: boolean;
  error?: string;
  groupId?: string;
};

export async function createGroup(
  formData: FormData
): Promise<GroupCreateResult> {
  const t = await getTranslations('errors.actions');
  const tValidation = await getTranslations('validation.groupName');
  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const secretIds = formData.getAll('secretIds') as string[];

  logger.debug('Creating group: %o', { name, description, secretIds });

  const groupNameSchema = createTranslatedGroupNameSchema(tValidation);

  // Validate name
  const validation = groupNameSchema.safeParse(name);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  try {
    const group = await groupService.createGroup(name, description, secretIds);
    updateTag('groups');
    updateTag('secrets'); // Groups affect secrets display
    return { success: true, groupId: group.id };
  } catch (error) {
    logger.error('Failed to create group: %o', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t('createGroupFailed')
    };
  }
}
