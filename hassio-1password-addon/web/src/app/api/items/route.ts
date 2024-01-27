import { onePasswordService } from "@/service/1password.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await onePasswordService.getItems();
  return Response.json({ items });
}
