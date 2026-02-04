'use server';

import { logger } from '@/service/client/logger';
import { groupService } from '@/service/group.service';
import { updateTag } from 'next/cache';

export type GroupDeleteResult = {
  success: boolean;
  error?: string;
};

export async function deleteGroup(
  formData: FormData
): Promise<GroupDeleteResult> {
  const groupId = formData.get('groupId') as string;

  logger.debug('Deleting group: %s', groupId);

  if (!groupId) {
    return { success: false, error: 'Group ID is required' };
  }

  try {
    await groupService.deleteGroup(groupId);
    updateTag('groups');
    updateTag(`group-${groupId}`);
    updateTag('secrets'); // Groups affect secrets display
    return { success: true };
  } catch (error) {
    logger.error('Failed to delete group: %o', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete group'
    };
  }
}
