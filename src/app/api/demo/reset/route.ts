import { resetToHealthy } from "@/server/mock/state";

export const dynamic = "force-dynamic";

export async function POST() {
  resetToHealthy();
  return Response.json({ ok: true });
}
