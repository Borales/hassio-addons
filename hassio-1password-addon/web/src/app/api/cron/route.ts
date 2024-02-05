import { onePasswordService } from '@/service/1password.service';
import { haSecretService } from '@/service/secret.service';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

// Call for cron-check and run the update

export async function GET(request: NextRequest) {
  const force = request.nextUrl.searchParams.get('force') === 'true';
  await haSecretService.syncSecrets();
  await onePasswordService.syncItems(force);
  return Response.json({ done: true });
}
