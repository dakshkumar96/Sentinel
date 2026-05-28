export type AuditKind =
  | "alert_created"
  | "alert_resolved"
  | "investigation_complete"
  | "placement_paused"
  | "demo_reset";

export interface AuditEntry {
  id: string;
  ts: string;
  kind: AuditKind;
  summary: string;
  payload: Record<string, unknown>;
}

let seq = 0;

export function createAuditEntry(
  kind: AuditKind,
  summary: string,
  payload: Record<string, unknown> = {},
): AuditEntry {
  seq += 1;
  return {
    id: `aud_${Date.now()}_${seq}`,
    ts: new Date().toISOString(),
    kind,
    summary,
    payload,
  };
}
