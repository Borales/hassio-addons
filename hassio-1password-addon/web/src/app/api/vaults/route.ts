import { onePasswordService } from '@/service/1password.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const vaults = await onePasswordService.getVaults();
  return Response.json({ vaults });
}