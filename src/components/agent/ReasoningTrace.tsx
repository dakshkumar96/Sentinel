"use client";

import { useEffect, useState } from "react";
import type { Investigation, ToolCallRecord } from "@/types";
import { useDashboardStore } from "@/lib/store/dashboard-store";

const TOOL_LABELS: Record<string, string> = {
  get_conversion_trend: "Conversion trend",
  get_conversation_context: "Conversation context",
  get_brand_guidelines: "Brand guidelines",
  get_historical_baseline: "Historical baseline",
  get_client_context: "Client context",
};

const TOOL_ICONS: Record<string, string> = {
  get_conversion_trend: "M3 17l4-8 4 4 4-6 4 6",
  get_conversation_context: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  get_brand_guidelines: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  get_historical_baseline: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  get_client_context: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
};

const VERDICT_STYLES = {
  healthy: {
    text: "text-[var(--green)]",
    bg: "bg-[var(--green-dim)] border-[var(--green)]/30",
    bar: "bg-[var(--green)]",
  },
  act: {
    text: "text-[var(--warm)]",
    bg: "bg-[var(--warm-dim)] border-[var(--warm)]/30",
    bar: "bg-[var(--warm)]",
  },
  escalate: {
    text: "text-[var(--danger)]",
    bg: "bg-[var(--danger-dim)] border-[var(--danger)]/30",
    bar: "bg-[var(--danger)]",
  },
} as const;

const STAGE_MS = 340;

interface ReasoningTraceProps {
  investigation: Investigation | null;
}

export function ReasoningTrace({ investigation }: ReasoningTraceProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showConclusion, setShowConclusion] = useState(false);
  const investigating = useDashboardStore((s) => s.investigating);

  const toolCalls = investigation?.toolCalls ?? [];

  useEffect(() => {
    if (!investigation) {
      setVisibleCount(0);
      setShowConclusion(false);
      return;
    }

    setVisibleCount(0);
    setShowConclusion(false);

    if (toolCalls.length === 0) {
      const t = setTimeout(() => setShowConclusion(true), STAGE_MS);
      return () => clearTimeout(t);
    }

    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      setVisibleCount(step);
      if (step >= toolCalls.length) {
        clearInterval(timer);
        setTimeout(() => setShowConclusion(true), STAGE_MS);
      }
    }, STAGE_MS);

    return () => clearInterval(timer);
  }, [investigation?.id, toolCalls.length]);

  if (!investigation) {
    return (
      <section className="panel border border-dashed border-[var(--border-strong)] py-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--agent-dim)] ring-1 ring-[var(--agent)]/15">
          {investigating ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[var(--agent)] animate-spin" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[var(--agent)]" aria-hidden>
              <path d="M9.5 8h10M9.5 12h10M9.5 16h6M5 8h.01M5 12h.01M5 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <p className="text-[14px] font-medium text-[var(--text-secondary)]">
          {investigating ? "Running investigation…" : "Agent reasoning trace"}
        </p>
        <p className="mt-1 text-[13px] text-[var(--text-muted)]">
          {investigating
            ? "Gathering tool evidence before reaching a verdict."
            : "Autonomous agent investigations appear here from the live feed."}
        </p>
        {investigating && (
          <div className="mx-auto mt-4 flex items-center justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-[var(--agent)]"
                style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  const verdictStyle = VERDICT_STYLES[investigation.verdict];
  const isClaude = investigation.signal.includes("claude");
  const pct = Math.round(investigation.confidence * 100);

  return (
    <section className="panel overflow-hidden animate-fade-up" aria-label="Agent reasoning trace">
      <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Agent
          </p>
          <h2 className="font-display mt-0.5 text-[17px] font-semibold text-[var(--text-primary)]">
            Reasoning trace
          </h2>
        </div>
        <span
          className={`chip border ${
            isClaude
              ? "border-[var(--agent)]/25 bg-[var(--agent-dim)] text-[var(--agent)]"
              : "border-[var(--border-subtle)] bg-[var(--bg-inset)] text-[var(--text-muted)]"
          }`}
        >
          {isClaude ? "Claude" : "Mock"}
        </span>
      </header>

      <ol className="space-y-0 px-5 py-2">
        {toolCalls.slice(0, visibleCount).map((call, i) => (
          <ToolRow key={`${call.tool}-${i}`} call={call} state="done" />
        ))}
        {visibleCount < toolCalls.length &&
          toolCalls.slice(visibleCount, visibleCount + 1).map((call, i) => (
            <ToolRow key={`pending-${i}`} call={call} state="running" />
          ))}
      </ol>

      {showConclusion && (
        <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-inset)]/60 px-5 py-4 space-y-4">
          <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
            {investigation.reasoning}
          </p>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              <span>Confidence</span>
              <span className={`font-mono-data text-xs ${verdictStyle.text}`}>{pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white">
              <div
                className={`h-full rounded-full transition-all duration-700 ${verdictStyle.bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-lg border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${verdictStyle.bg} ${verdictStyle.text}`}
            >
              {investigation.verdict}
            </span>
            {investigation.requiresHuman ? (
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--warm)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Human gate required
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--green)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Logged only — no gate
              </span>
            )}
          </div>
        </footer>
      )}
    </section>
  );
}

function ToolRow({
  call,
  state,
}: {
  call: ToolCallRecord;
  state: "done" | "running";
}) {
  const iconPath = TOOL_ICONS[call.tool] ?? "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
  const isRunning = state === "running";

  return (
    <li className="flex gap-3 border-b border-[var(--border-subtle)] py-3.5 last:border-0">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isRunning
            ? "bg-[var(--agent-dim)] text-[var(--agent)]"
            : "bg-[var(--green-dim)] text-[var(--green)]"
        }`}
      >
        {isRunning ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-spin" aria-hidden>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="14 42" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>

      <div className="flex min-w-0 gap-3 flex-1">
        <span className={`mt-0.5 shrink-0 ${isRunning ? "text-[var(--agent)] opacity-70" : "text-[var(--agent)]"}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d={iconPath} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-[14px] font-medium ${isRunning ? "text-[var(--text-muted)]" : "text-[var(--text-primary)]"}`}>
            {TOOL_LABELS[call.tool] ?? call.tool}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-muted)]">
            {isRunning ? "Fetching data…" : call.outputSummary}
          </p>
        </div>
      </div>
    </li>
  );
}
