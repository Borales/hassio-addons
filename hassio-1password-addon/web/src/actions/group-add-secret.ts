'use server';

import { logger } from '@/service/client/logger';
import { groupService } from '@/service/group.service';
import { updateTag } from 'next/cache';

export type GroupAddSecretResult = {
  success: boolean;
  error?: string;
};

export async function addSecretToGroup(
  formData: FormData
): Promise<GroupAddSecretResult> {
  const groupId = formData.get('groupId') as string;
  const secretId = formData.get('secretId') as string;

  logger.debug('Adding secret %s to group %s', secretId, groupId);

  if (!groupId || !secretId) {
    return { success: false, error: 'Group ID and Secret ID are required' };
  }

  try {
    await groupService.addSecretsToGroup(groupId, [secretId]);
    updateTag('groups');
    updateTag(`group-${groupId}`);
    updateTag('secrets'); // Groups affect secrets display
    return { success: true };
  } catch (error) {
    logger.error('Failed to add secret to group: %o', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to add secret to group'
    };
  }
}
