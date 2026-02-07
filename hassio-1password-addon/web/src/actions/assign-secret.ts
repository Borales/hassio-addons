'use server';

import { homeAssistantClient } from '@/service/client/homeassistant';
import { logger } from '@/service/client/logger';
import { groupService } from '@/service/group.service';
import { haSecretService } from '@/service/secret.service';
import { getTranslations } from 'next-intl/server';
import { updateTag } from 'next/cache';

export type AssignSecretResult = {
  success: boolean;
  error?: string;
};

export const assignSecret = async (
  formData: FormData
): Promise<AssignSecretResult> => {
  const t = await getTranslations('errors.actions');
  const haSecretId = formData.get('haSecretId') as string;
  const opSecretId = formData.get('opSecretId') as string;
  const ref = formData.get('ref') as string;

  logger.debug('Assigning secret: %o', {
    haSecretId,
    opSecretId,
    ref
  });

  try {
    await haSecretService.assignSecret(haSecretId, opSecretId, ref);

    // Fire HA event
    await homeAssistantClient.fireSecretAssignedEvent(
      haSecretId,
      opSecretId,
      ref
    );

    // Fire group events for any groups containing this secret
    const groups = await groupService.getGroupsForSecrets([haSecretId]);
    await homeAssistantClient.fireGroupUpdatedEventsForSecrets(groups);

    updateTag('secrets');
    updateTag(`secret-${haSecretId}`);
    updateTag('groups');

    return { success: true };
  } catch (error) {
    logger.error('Failed to assign secret: %o', error);
    await homeAssistantClient.fireErrorEvent('assign_secret_failed', {
      secretName: haSecretId,
      error: error instanceof Error ? error.message : t('assignSecretFailed')
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : t('assignSecretFailed')
    };
  }
};
