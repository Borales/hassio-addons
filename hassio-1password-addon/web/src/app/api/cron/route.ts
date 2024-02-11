import { syncService } from '@/service/sync.service';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

// Call for cron-check and run the update

export async function GET(request: NextRequest) {
  const force = request.nextUrl.searchParams.get('force') === 'true';
  await syncService.sync(force);
  return Response.json({ done: true });
}
