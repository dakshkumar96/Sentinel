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
  healthy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  act: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  escalate: "text-red-400 bg-red-500/10 border-red-500/30",
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
      <section className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-6 text-center">
        <p className="text-sm text-zinc-500">
          Agent reasoning trace appears when a scenario triggers an investigation.
        </p>
      </section>
    );
  }

  const verdictStyle = VERDICT_STYLES[investigation.verdict];

  return (
    <section
      className="rounded-xl border border-zinc-800 bg-zinc-900/60"
      aria-label="Agent reasoning trace"
    >
      <header className="border-b border-zinc-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-200">Reasoning trace</h2>
        <p className="text-xs text-zinc-500">
          Tools → evidence → verdict (scenario-tuned escalation)
        </p>
      </header>

      <ol className="space-y-0 p-4">
        {toolCalls.slice(0, visibleCount).map((call, i) => (
          <ToolRow key={`${call.tool}-${i}`} call={call} active />
        ))}
        {visibleCount < toolCalls.length &&
          toolCalls.slice(visibleCount, visibleCount + 1).map((call, i) => (
            <ToolRow key={`pending-${i}`} call={call} active={false} pending />
          ))}
      </ol>

      {showConclusion && (
        <footer className="border-t border-zinc-800 p-4 space-y-3">
          <p className="text-sm leading-relaxed text-zinc-300">
            {investigation.reasoning}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-md border px-2 py-1 text-xs font-semibold uppercase ${verdictStyle}`}
            >
              {investigation.verdict}
            </span>
            <span className="text-xs text-zinc-500">
              Confidence{" "}
              <span className="tabular-nums font-medium text-zinc-300">
                {Math.round(investigation.confidence * 100)}%
              </span>
            </span>
            {investigation.requiresHuman ? (
              <span className="text-xs font-medium text-amber-400">
                Escalated — human gate
              </span>
            ) : (
              <span className="text-xs font-medium text-emerald-400">
                No human gate — logged only
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
  active,
  pending,
}: {
  call: ToolCallRecord;
  active: boolean;
  pending?: boolean;
}) {
  return (
    <li
      className={`flex gap-3 border-l-2 py-2 pl-3 ${
        active ? "border-sky-500" : "border-zinc-700"
      } ${pending ? "opacity-60" : ""}`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
          active ? "bg-sky-500/20 text-sky-300" : "bg-zinc-800 text-zinc-600"
        }`}
      >
        {active ? "✓" : "·"}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-200">
          {TOOL_LABELS[call.tool] ?? call.tool}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
          {call.outputSummary}
        </p>
      </div>
    </li>
  );
}
