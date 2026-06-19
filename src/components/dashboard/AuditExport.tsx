"use client";

import { useState } from "react";

export function AuditExport({ compact = false }: { compact?: boolean }) {
  const [loading, setLoading] = useState(false);

  const exportLog = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/audit/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ??
        `sentinel-audit-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  const button = (
    <button
      type="button"
      disabled={loading}
      onClick={exportLog}
      className="btn-ghost flex w-full items-center justify-center gap-2 py-2.5 text-[12px] font-medium disabled:opacity-50"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3v12m0 0l4-4m-4 4l-4-4M4 19h16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {loading ? "Exporting…" : "Export audit log"}
    </button>
  );

  if (compact) return button;

  return (
    <div className="panel p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        Compliance
      </p>
      <h2 className="font-display mt-1 text-[15px] font-semibold text-[var(--text-primary)]">
        Audit export
      </h2>
      <p className="mt-1 text-[12px] text-[var(--text-muted)]">
        Download full trail — alerts, investigations, actions.
      </p>
      <div className="mt-4">{button}</div>
    </div>
  );
}
