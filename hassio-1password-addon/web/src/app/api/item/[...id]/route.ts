import { onePasswordService } from "@/service/1password.service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string[] } }
) {
  const [vaultId, itemId] = params.id;

  if (!itemId || !vaultId) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const item = await onePasswordService.getItem(itemId!, vaultId!);

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json({ item });
}
