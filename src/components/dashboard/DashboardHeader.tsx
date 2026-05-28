"use client";

import { useDashboardStore, selectEscalationStats } from "@/lib/store/dashboard-store";
import { useShallow } from "zustand/react/shallow";

export function DashboardHeader() {
  const connected = useDashboardStore((s) => s.connected);
  const stats = useDashboardStore(useShallow(selectEscalationStats));

  return (
    <header className="relative z-10 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-4">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--purple-dim)] ring-1 ring-[var(--purple)]/25"
            aria-hidden
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[var(--purple)]"
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
          <div className="hidden sm:flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] px-4 py-2.5 text-xs">
            <span className="text-[var(--text-muted)]">
              Signals{" "}
              <span className="font-mono-data font-medium text-[var(--text-primary)]">
                {stats.signals}
              </span>
            </span>
            <span className="h-3 w-px bg-[var(--border-strong)]" />
            <span className="text-[var(--text-muted)]">
              Escalations{" "}
              <span className="font-mono-data font-medium text-[var(--purple)]">
                {stats.escalations}
              </span>
            </span>
          </div>

          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
              connected
                ? "border-[var(--purple)]/30 bg-[var(--purple-dim)] text-[var(--purple)]"
                : "border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-muted)]"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? "live-dot bg-[var(--purple)]" : "bg-[var(--text-muted)]"
              }`}
            />
            {connected ? "Live feed" : "Connecting…"}
          </div>
        </div>
      </div>
    </header>
  );
}
