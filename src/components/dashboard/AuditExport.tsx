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
      className="w-full rounded-lg border border-zinc-700 py-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50"
    >
      {loading ? "Exporting…" : "Export audit log (JSON)"}
    </button>
  );
}
