"use client";

import { useEffect, useState } from "react";
import type { Investigation, ToolCallRecord } from "@/types";

const TOOL_LABELS: Record<string, string> = {
  get_conversion_trend: "Conversion trend",
  get_conversation_context: "Conversation context",
  get_brand_guidelines: "Brand guidelines",
  get_historical_baseline: "Historical baseline",
  get_client_context: "Client context",
};

const VERDICT_STYLES = {
  healthy:
    "text-[var(--green)] bg-[var(--green-dim)] border-[var(--green)]/30",
  act: "text-[var(--warm)] bg-[var(--warm-dim)] border-[var(--warm)]/30",
  escalate:
    "text-[var(--danger)] bg-[var(--danger-dim)] border-[var(--danger)]/30",
} as const;

const STAGE_MS = 320;

interface ReasoningTraceProps {
  investigation: Investigation | null;
}

export function ReasoningTrace({ investigation }: ReasoningTraceProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showConclusion, setShowConclusion] = useState(false);

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
      <section className="panel border-dashed py-12 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--agent-dim)] text-[var(--agent)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M9.5 8h10M9.5 12h10M9.5 16h6M5 8h.01M5 12h.01M5 16h.01"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          Agent trace appears when a scenario runs an investigation.
        </p>
      </section>
    );
  }

  const verdictStyle = VERDICT_STYLES[investigation.verdict];
  const isClaude = investigation.signal.includes("claude");

  return (
    <section className="panel overflow-hidden" aria-label="Agent reasoning trace">
      <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Agent
          </p>
          <h2 className="font-display mt-0.5 text-lg font-semibold text-[var(--text-primary)]">
            Reasoning trace
          </h2>
        </div>
        <span className="chip border border-[var(--agent)]/25 bg-[var(--agent-dim)] text-[var(--agent)]">
          {isClaude ? "Claude" : "Mock"}
        </span>
      </header>

      <ol className="space-y-0 px-5 py-4">
        {toolCalls.slice(0, visibleCount).map((call, i) => (
          <ToolRow key={`${call.tool}-${i}`} call={call} step={i + 1} active />
        ))}
        {visibleCount < toolCalls.length &&
          toolCalls.slice(visibleCount, visibleCount + 1).map((call, i) => (
            <ToolRow
              key={`pending-${i}`}
              call={call}
              step={visibleCount + 1}
              active={false}
              pending
            />
          ))}
      </ol>

      {showConclusion && (
        <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-inset)] px-5 py-4 space-y-3">
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            {investigation.reasoning}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${verdictStyle}`}
            >
              {investigation.verdict}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              Confidence{" "}
              <span className="font-mono-data font-medium text-[var(--text-primary)]">
                {Math.round(investigation.confidence * 100)}%
              </span>
            </span>
            {investigation.requiresHuman ? (
              <span className="text-xs font-medium text-[var(--warm)]">
                → Human gate
              </span>
            ) : (
              <span className="text-xs font-medium text-[var(--green)]">
                → Logged only
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
  step,
  active,
  pending,
}: {
  call: ToolCallRecord;
  step: number;
  active: boolean;
  pending?: boolean;
}) {
  return (
    <li
      className={`flex gap-4 py-3 border-b border-[var(--border-subtle)] last:border-0 ${
        pending ? "opacity-50" : ""
      }`}
    >
      <span
        className={`font-mono-data flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-medium ${
          active
            ? "bg-[var(--agent-dim)] text-[var(--agent)]"
            : "bg-[var(--bg-inset)] text-[var(--text-muted)]"
        }`}
      >
        {active ? step : "·"}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">
          {TOOL_LABELS[call.tool] ?? call.tool}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
          {call.outputSummary}
        </p>
      </div>
    </li>
  );
}
