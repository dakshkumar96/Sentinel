import { getIngestHub } from "@/server/ingest/hub";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return Response.json({ error: "id required" }, { status: 400 });
  }
  const investigation = getIngestHub().getInvestigation(id);
  if (!investigation) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json(investigation);
}
