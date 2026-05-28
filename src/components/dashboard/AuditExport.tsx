"use client";

import { useState } from "react";

export function AuditExport() {
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

  return (
    <button
      type="button"
      disabled={loading}
      onClick={exportLog}
      className="btn-ghost flex w-full items-center justify-center gap-2 py-2.5 text-xs font-medium disabled:opacity-50"
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
}
