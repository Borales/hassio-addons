'use server';

import { homeAssistantClient } from '@/service/client/homeassistant';
import { logger } from '@/service/client/logger';
import { groupService } from '@/service/group.service';
import { haSecretService } from '@/service/secret.service';
import { updateTag } from 'next/cache';

export async function toggleSkipSecret(formData: FormData) {
  const haSecretId = formData.get('haSecretId') as string;
  logger.debug('Toggling skip secret: %o', {
    haSecretId
  });

  try {
    const result = await haSecretService.toggleSkipSecret(haSecretId);

    if (result.secret) {
      // Fire HA event
      await homeAssistantClient.fireSecretSkipToggledEvent(
        haSecretId,
        result.secret.isSkipped ?? false
      );

      // Fire group events for any groups containing this secret
      const groups = await groupService.getGroupsForSecrets([haSecretId]);
      for (const group of groups) {
        await homeAssistantClient.fireGroupUpdatedEvent(
          group.name,
          group.id,
          group.secrets
        );
      }
    }
  } catch (error) {
    logger.error('Failed to toggle skip secret: %o', error);
    await homeAssistantClient.fireErrorEvent('toggle_skip_failed', {
      secretName: haSecretId,
      error: error instanceof Error ? error.message : String(error)
    });
  }

  updateTag('secrets');
  updateTag(`secret-${haSecretId}`);
  updateTag('groups'); // Skip toggle affects group displays
}
