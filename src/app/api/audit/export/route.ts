import { getIngestHub } from "@/server/ingest/hub";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = getIngestHub().getAuditSnapshot();
  const body = JSON.stringify(snapshot, null, 2);

  return new Response(body, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="sentinel-audit-${Date.now()}.json"`,
    },
  });
}
