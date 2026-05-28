"use client";

import { useDashboardStore, selectEscalationStats } from "@/lib/store/dashboard-store";
import { useShallow } from "zustand/react/shallow";

export function DashboardHeader() {
  const connected = useDashboardStore((s) => s.connected);
  const stats = useDashboardStore(useShallow(selectEscalationStats));

  return (
    <header className="relative z-10 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-4">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#3dbeb6]/25 to-[#2a6f6a]/10 ring-1 ring-[#3dbeb6]/30"
            aria-hidden
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[#3dbeb6]"
            >
              <path
                d="M12 2L4 6v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V6l-8-4z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="11" r="2.5" fill="currentColor" opacity="0.9" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              Sentinel
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Spend guardian for AI-channel placements
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inset)] px-4 py-2 text-xs">
            <span className="text-[var(--text-muted)]">
              Signals{" "}
              <span className="font-mono-data font-medium text-[var(--text-secondary)]">
                {stats.signals}
              </span>
            </span>
            <span className="h-3 w-px bg-[var(--border-strong)]" />
            <span className="text-[var(--text-muted)]">
              Escalations{" "}
              <span className="font-mono-data font-medium text-[var(--warm)]">
                {stats.escalations}
              </span>
            </span>
          </div>

          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
              connected
                ? "border-[#3dbeb6]/30 bg-[var(--accent-dim)] text-[#3dbeb6]"
                : "border-[var(--border-subtle)] bg-[var(--bg-inset)] text-[var(--text-muted)]"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? "live-dot bg-[#3dbeb6]" : "bg-[var(--text-muted)]"
              }`}
            />
            {connected ? "Live feed" : "Connecting…"}
          </div>
        </div>
      </div>
    </header>
  );
}
