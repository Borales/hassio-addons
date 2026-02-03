import { homeAssistantClient } from '@/service/client/homeassistant';
import { logger } from '@/service/client/logger';
import { syncService } from '@/service/sync.service';
import { updateTag } from 'next/cache';
import { NextRequest } from 'next/server';

// Call for cron-check and run the update

export async function GET(request: NextRequest) {
  const force = request.nextUrl.searchParams.get('force') === 'true';

  try {
    const result = await syncService.sync(force);

    logger.info(
      'Sync completed: %d secrets updated, %d groups affected',
      result.changedSecrets.length,
      result.changedGroups.length
    );

    // Invalidate caches after successful sync
    updateTag('op-items');
    updateTag('op-metadata');
    updateTag('secrets');

    // Only invalidate groups if they were actually changed
    if (result.changedGroups.length > 0) {
      updateTag('groups');
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
      error: error instanceof Error ? error.message : String(error),
      forced: force
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
