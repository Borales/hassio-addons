import { onePasswordService } from '@/service/1password.service';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id?: string[] } }
) {
  const vaultId = params.id?.[0];

  const items = await onePasswordService.getItems(vaultId);
  return Response.json({ items });
}
