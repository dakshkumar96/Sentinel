import { getIngestHub } from "@/server/ingest/hub";

export const dynamic = "force-dynamic";

export async function POST() {
  getIngestHub().reset();
  return Response.json({ ok: true });
}
