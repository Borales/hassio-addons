'use server';

import { homeAssistantClient } from '@/service/client/homeassistant';
import { logger } from '@/service/client/logger';
import { groupService } from '@/service/group.service';
import { haSecretService } from '@/service/secret.service';
import { updateTag } from 'next/cache';

export const unassignSecret = async (formData: FormData) => {
  const haSecretId = formData.get('haSecretId') as string;
  logger.debug('Unassigning secret: %o', {
    haSecretId
  });

  try {
    await haSecretService.unassignSecret(haSecretId);

    // Fire HA event
    await homeAssistantClient.fireSecretUnassignedEvent(haSecretId);

    // Fire group events for any groups containing this secret
    const groups = await groupService.getGroupsForSecrets([haSecretId]);
    await homeAssistantClient.fireGroupUpdatedEventsForSecrets(groups);
  } catch (error) {
    logger.error('Failed to unassign secret: %o', error);
    await homeAssistantClient.fireErrorEvent('unassign_secret_failed', {
      secretName: haSecretId,
      error: error instanceof Error ? error.message : String(error)
    });
  }

  updateTag('secrets');
  updateTag(`secret-${haSecretId}`);
  updateTag('groups'); // Unassignment affects group displays
};
