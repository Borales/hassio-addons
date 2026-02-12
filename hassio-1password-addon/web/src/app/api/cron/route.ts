import { homeAssistantClient } from '@/service/client/homeassistant';
import { logger } from '@/service/client/logger';
import { syncService } from '@/service/sync.service';
import { revalidateTag } from 'next/cache';
import { connection } from 'next/server';

// Call for cron-check and run the update

export async function GET() {
  // The next line is needed for Docker build
  await connection();

  try {
    const result = await syncService.sync();

    if (
      result.changedSecrets.length === 0 &&
      result.changedGroups.length === 0
    ) {
      logger.debug(
        'No secrets or groups changed, skipping notification and cache invalidation'
      );
      return Response.json({
        done: true,
        changedSecrets: [],
        changedGroups: []
      });
    }

    logger.info(
      'Sync completed: %d secrets updated, %d groups affected',
      result.changedSecrets.length,
      result.changedGroups.length
    );

    // Invalidate caches after successful sync (using 'max' profile for stale-while-revalidate)
    revalidateTag('op-items', 'max');
    revalidateTag('op-metadata', 'max');
    revalidateTag('secrets', 'max');
    revalidateTag('rate-limits', 'max');

    // Only invalidate groups if they were actually changed
    if (result.changedGroups.length > 0) {
      revalidateTag('groups', 'max');
    }

    return Response.json({
      done: true,
      changedSecrets: result.changedSecrets,
      changedGroups: result.changedGroups.map((g) => g.name)
    });
  } catch (error) {
    logger.error('Sync failed: %o', error);

    // Fire error event to HA
    await homeAssistantClient.fireErrorEvent('sync_failed', {
      error: error instanceof Error ? error.message : String(error)
    });

    return Response.json(
      {
        done: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
