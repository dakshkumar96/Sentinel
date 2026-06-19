"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AuditExport } from "@/components/dashboard/AuditExport";

interface AuditEntry {
  id: string;
  ts: string;
  kind: string;
  summary: string;
  payload?: Record<string, unknown>;
}

interface AuditSnapshot {
  exportedAt: string;
  agentEngine: string;
  entries: AuditEntry[];
}

const KIND_STYLE: Record<string, string> = {
  alert_created: "border-[var(--accent)]/25 bg-[var(--accent-dim)] text-[var(--accent-strong)]",
  alert_resolved: "border-[var(--green)]/25 bg-[var(--green-dim)] text-[var(--green)]",
  investigation_complete: "border-[var(--indigo)]/25 bg-[var(--indigo-dim)] text-[var(--indigo)]",
  placement_paused: "border-[var(--amber)]/25 bg-[var(--amber-dim)] text-[var(--amber)]",
  auto_act: "border-[var(--indigo)]/25 bg-[var(--indigo-dim)] text-[var(--indigo)]",
  demo_reset: "border-[var(--border-strong)] bg-[var(--bg-inset)] text-[var(--text-muted)]",
};

function formatTime(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return ts;
  }
}

export default function AuditPage() {
  const [snapshot, setSnapshot] = useState<AuditSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/audit/export", { cache: "no-store" });
      if (res.ok) setSnapshot((await res.json()) as AuditSnapshot);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const entries = snapshot?.entries ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Compliance"
        title="Audit Log"
        subtitle="A complete, exportable trail of every alert, investigation, and action taken."
        actions={
          <>
            <button
              type="button"
              onClick={load}
              className="btn-ghost px-3.5 py-2 text-[12px] font-medium"
            >
              Refresh
            </button>
            <div className="w-[150px]">
              <AuditExport compact />
            </div>
          </>
        }
      />

      <div className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-3.5">
          <h2 className="font-display text-[15px] font-semibold text-[var(--text-primary)]">
            Activity
          </h2>
          <span className="text-[12px] text-[var(--text-muted)]">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        {loading ? (
          <div className="px-5 py-12 text-center text-[13px] text-[var(--text-muted)]">
            Loading audit trail…
          </div>
        ) : entries.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-[var(--text-muted)]">
            No activity yet — trigger a scenario or let the agent run.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--divider)]">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-start gap-4 px-5 py-3.5">
                <time className="font-mono-data mt-0.5 shrink-0 text-[12px] text-[var(--text-muted)]">
                  {formatTime(entry.ts)}
                </time>
                <span
                  className={`chip shrink-0 border ${
                    KIND_STYLE[entry.kind] ??
                    "border-[var(--border-strong)] bg-[var(--bg-inset)] text-[var(--text-muted)]"
                  }`}
                >
                  {entry.kind.replace(/_/g, " ")}
                </span>
                <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                  {entry.summary}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
