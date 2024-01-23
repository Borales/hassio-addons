import { onePasswordService } from "@/service/1password.service";

export const dynamic = "force-dynamic";

// Call for cron-check and run the update

export async function GET() {
  await onePasswordService.syncEntries();
  return Response.json({ done: true });
}
