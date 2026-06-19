"use client";

import type { DemoScenarioId } from "@/types";
import { useDashboardStore } from "@/lib/store/dashboard-store";

const SCENARIOS: {
  id: DemoScenarioId;
  label: string;
  desc: string;
  outcome: string;
  color: {
    idle: string;
    hover: string;
    num: string;
    dot: string;
  };
}[] = [
  {
    id: "healthy_spike",
    label: "Healthy spike",
    desc: "Conversions track spend",
    outcome: "No gate",
    color: {
      idle: "border-[var(--green)]/20 bg-[var(--green-dim)]/50",
      hover: "hover:border-[var(--green)]/45 hover:bg-[var(--green-dim)]",
      num: "text-[var(--green)]",
      dot: "bg-[var(--green)]",
    },
  },
  {
    id: "bad_spike",
    label: "Bad spike",
    desc: "Flat conversions, 4× spend",
    outcome: "Approval gate",
    color: {
      idle: "border-[var(--danger)]/20 bg-[var(--danger-dim)]/50",
      hover: "hover:border-[var(--danger)]/45 hover:bg-[var(--danger-dim)]",
      num: "text-[var(--danger)]",
      dot: "bg-[var(--danger)]",
    },
  },
  {
    id: "brand_safety",
    label: "Brand safety",
    desc: "Layoffs context near creative",
    outcome: "Escalate",
    color: {
      idle: "border-[var(--warm)]/20 bg-[var(--warm-dim)]/50",
      hover: "hover:border-[var(--warm)]/45 hover:bg-[var(--warm-dim)]",
      num: "text-[var(--warm)]",
      dot: "bg-[var(--warm)]",
    },
  },
  {
    id: "zero_conv_burn",
    label: "Zero-conv burn",
    desc: "£340 spend, 0 conversions",
    outcome: "Pause recommended",
    color: {
      idle: "border-[var(--warm)]/18 bg-[var(--warm-dim)]/40",
      hover: "hover:border-[var(--warm)]/40 hover:bg-[var(--warm-dim)]",
      num: "text-[var(--warm)]",
      dot: "bg-[var(--warm)]",
    },
  },
  {
    id: "guardrail_cap",
    label: "Guardrail cap",
    desc: "Hard budget limit hit",
    outcome: "Instant pause",
    color: {
      idle: "border-[var(--accent)]/20 bg-[var(--accent-dim)]/50",
      hover: "hover:border-[var(--accent)]/45 hover:bg-[var(--accent-dim)]",
      num: "text-[var(--accent)]",
      dot: "bg-[var(--accent)]",
    },
  },
];

export function DemoControls() {
  const runScenario = useDashboardStore((s) => s.runScenario);
  const resetDemo = useDashboardStore((s) => s.resetDemo);
  const loading = useDashboardStore((s) => s.scenarioLoading);

  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent-dim)] ring-1 ring-[var(--accent)]/15">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--accent)" aria-hidden>
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Scenario lab
        </p>
      </div>
      <h2 className="font-display mt-2 text-[15px] font-semibold text-[var(--text-primary)]">
        Trigger a scenario
      </h2>
      <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-muted)]">
        Live feed continues in the background.
      </p>

      <div className="mt-4 space-y-2">
        {SCENARIOS.map((s, idx) => {
          const isLoading = loading === s.id;
          return (
            <button
              key={s.id}
              type="button"
              disabled={!!loading}
              onClick={() => runScenario(s.id)}
              className={`group relative flex w-full items-start gap-3 overflow-hidden rounded-xl border px-3 py-2.5 text-left transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${s.color.idle} ${s.color.hover}`}
            >
              {isLoading && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden">
                  <div className="h-full w-1/3 animate-progress-bar bg-current opacity-50" />
                </div>
              )}

              <span className={`font-mono-data text-sm font-bold leading-none mt-0.5 ${s.color.num}`}>
                {String(idx + 1).padStart(2, "0")}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${s.color.dot}`} />
                  <span className="block text-[13px] font-semibold text-[var(--text-primary)]">
                    {isLoading ? "Running…" : s.label}
                  </span>
                </span>
                <span className="mt-0.5 block text-[11px] text-[var(--text-muted)]">{s.desc}</span>
              </span>

              <span className={`shrink-0 self-center text-[9px] font-bold uppercase tracking-wide opacity-75 ${s.color.num}`}>
                {s.outcome}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => resetDemo()}
        className="btn-ghost mt-4 w-full py-2.5 text-[12px] font-medium"
      >
        ↺ Reset to calm state
      </button>
    </div>
  );
}
