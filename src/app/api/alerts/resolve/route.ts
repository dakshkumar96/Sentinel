import { getIngestHub } from "@/server/ingest/hub";
import type { AlertStatus } from "@/types";

export const dynamic = "force-dynamic";

const VALID: AlertStatus[] = [
  "approved",
  "overridden",
  "resolved",
  "dismissed",
];

export async function POST(request: Request) {
  let body: { id?: string; status?: AlertStatus };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id || !body.status || !VALID.includes(body.status)) {
    return Response.json(
      { error: "id and status required", valid: VALID },
      { status: 400 },
    );
  }

  getIngestHub().resolveAlert(body.id, body.status);
  return Response.json({ ok: true, id: body.id, status: body.status });
}
