'use server';

import { logger } from '@/service/client/logger';
import { groupService } from '@/service/group.service';
import { updateTag } from 'next/cache';

export type GroupRemoveSecretResult = {
  success: boolean;
  error?: string;
};

export async function removeSecretFromGroup(
  formData: FormData
): Promise<GroupRemoveSecretResult> {
  const groupId = formData.get('groupId') as string;
  const secretId = formData.get('secretId') as string;

  logger.debug('Removing secret %s from group %s', secretId, groupId);

  if (!groupId || !secretId) {
    return { success: false, error: 'Group ID and Secret ID are required' };
  }

  try {
    await groupService.removeSecretsFromGroup(groupId, [secretId]);
    updateTag('groups');
    updateTag(`group-${groupId}`);
    updateTag('secrets'); // Groups affect secrets display
    return { success: true };
  } catch (error) {
    logger.error('Failed to remove secret from group: %o', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to remove secret from group'
    };
  }
}
