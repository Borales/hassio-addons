'use server';

import { homeAssistantClient } from '@/service/client/homeassistant';
import { logger } from '@/service/client/logger';
import { groupService } from '@/service/group.service';
import { haSecretService } from '@/service/secret.service';
import { getTranslations } from 'next-intl/server';
import { updateTag } from 'next/cache';

export type UnassignSecretResult = {
  success: boolean;
  error?: string;
};

export const unassignSecret = async (
  formData: FormData
): Promise<UnassignSecretResult> => {
  const t = await getTranslations('errors.actions');
  const haSecretId = formData.get('haSecretId') as string;

  logger.debug('Unassigning secret: %s', haSecretId);

  let result: UnassignSecretResult = { success: true };

  try {
    await haSecretService.unassignSecret(haSecretId);

    // Fire HA event
    await homeAssistantClient.fireSecretUnassignedEvent(haSecretId);

    // Fire group events for any groups containing this secret
    const groups = await groupService.getGroupsForSecrets([haSecretId]);
    await homeAssistantClient.fireGroupUpdatedEventsForSecrets(groups);
  } catch (error) {
    logger.error('Failed to unassign secret: %o', error);
    const message =
      error instanceof Error ? error.message : t('unassignSecretFailed');
    await homeAssistantClient.fireErrorEvent('unassign_secret_failed', {
      secretName: haSecretId,
      error: message
    });
    result = { success: false, error: message };
  }

  updateTag('secrets');
  updateTag(`secret-${haSecretId}`);
  updateTag('groups'); // Unassignment affects group displays

  return result;
};
