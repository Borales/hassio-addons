'use server';

import { onePasswordService } from '@/service/1password.service';
import { prisma } from '@/service/client/db';
import { homeAssistantClient } from '@/service/client/homeassistant';
import { logger } from '@/service/client/logger';
import { groupService } from '@/service/group.service';
import { rateLimitService } from '@/service/ratelimit.service';
import { getTranslations } from 'next-intl/server';
import { updateTag } from 'next/cache';

/**
 * Fetch fresh fields for a specific 1Password item
 */
export const fetchOpItemFields = async (
  opSecretId: string,
  opVaultId: string
) => {
  const t = await getTranslations('errors.actions');
  try {
    await onePasswordService.syncItem(opSecretId, opVaultId);

    // Fetch rate limits in background (non-blocking)
    rateLimitService.fetchAndStore().catch((err) => {
      logger.error('Failed to fetch rate limits in background: %o', err);
    });

    updateTag('op-items');
    updateTag('rate-limits');

    // Return the updated item (serialize to plain object for client component)
    const item = await prisma.item.findUnique({
      where: { id: opSecretId, vaultId: opVaultId }
    });

    return {
      success: true,
      item: item ? JSON.parse(JSON.stringify(item)) : null
    };
  } catch (error) {
    logger.error('Failed to fetch 1Password item fields: %o', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : t('refreshItemFailed')
    };
  }
};

export const refreshOpSecret = async (formData: FormData) => {
  const t = await getTranslations('errors.actions');
  const opSecretId = formData.get('opSecretId') as string;
  const opVaultId = formData.get('opVaultId') as string;
  logger.debug('Refreshing 1Password secret: %o', {
    opSecretId,
    opVaultId
  });

  try {
    await onePasswordService.syncItem(opSecretId, opVaultId);

    // Fetch rate limits in background (non-blocking)
    rateLimitService.fetchAndStore().catch((err) => {
      logger.error('Failed to fetch rate limits in background: %o', err);
    });

    // Find secrets affected by this item refresh
    const affectedSecrets = await prisma.secret.findMany({
      where: { itemId: opSecretId },
      select: { id: true }
    });
    const affectedSecretIds = affectedSecrets.map((s) => s.id);

    // Fire HA event
    await homeAssistantClient.fireItemRefreshedEvent(
      opSecretId,
      opVaultId,
      affectedSecretIds
    );

    // Fire group events for any groups containing affected secrets
    const groups = await groupService.getGroupsForSecrets(affectedSecretIds);
    await homeAssistantClient.fireGroupUpdatedEventsForSecrets(groups);
  } catch (error) {
    logger.error('Failed to refresh 1Password secret: %o', error);
    await homeAssistantClient.fireErrorEvent('refresh_item_failed', {
      itemId: opSecretId,
      vaultId: opVaultId,
      error: error instanceof Error ? error.message : t('refreshItemFailed')
    });
  }

  updateTag('op-items');
  updateTag('secrets');
  updateTag('groups'); // Refresh affects group displays
  updateTag('rate-limits');
};
