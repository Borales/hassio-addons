'use server';

import { createGroupNameSchema } from '@/lib/group-validation';
import { logger } from '@/service/client/logger';
import { groupService } from '@/service/group.service';
import { getTranslations } from 'next-intl/server';
import { updateTag } from 'next/cache';

export type GroupUpdateResult = {
  success: boolean;
  error?: string;
};

export async function updateGroup(
  formData: FormData
): Promise<GroupUpdateResult> {
  const t = await getTranslations('errors.actions');
  const tValidation = await getTranslations('validation.groupName');
  const groupId = formData.get('groupId') as string;
  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const secretIds = formData.getAll('secretIds') as string[];

  logger.debug('Updating group: %o', { groupId, name, description, secretIds });

  if (!groupId) {
    return { success: false, error: 'Group ID is required' };
  }

  // Validate name if provided
  if (name) {
    // Create schema with translated messages
    const groupNameSchema = createGroupNameSchema({
      required: tValidation('required'),
      invalid: tValidation('invalid'),
      tooShort: tValidation('tooShort'),
      tooLong: tValidation('tooLong')
    });

    const validation = groupNameSchema.safeParse(name);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }
  }

  try {
    // Update group metadata - only include fields that should be updated
    const updateData: { name?: string; description?: string | null } = {};
    if (name) {
      updateData.name = name;
    }
    // Always allow description updates (including clearing it by passing null)
    updateData.description = description;

    await groupService.updateGroup(groupId, updateData);

    // Update secrets association
    await groupService.setGroupSecrets(groupId, secretIds);

    updateTag('groups');
    updateTag(`group-${groupId}`);
    updateTag('secrets'); // Groups affect secrets display
    return { success: true };
  } catch (error) {
    logger.error('Failed to update group: %o', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t('updateGroupFailed')
    };
  }
}
