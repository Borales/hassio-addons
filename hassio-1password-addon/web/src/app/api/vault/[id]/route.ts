import { onePasswordService } from '@/service/1password.service';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const vaultId = params.id;

  if (!vaultId) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const vault = await onePasswordService.getVault(vaultId!);

  if (!vault) {
    return NextResponse.json({ error: 'Vault not found' }, { status: 404 });
  }

  return NextResponse.json({ vault });
}
