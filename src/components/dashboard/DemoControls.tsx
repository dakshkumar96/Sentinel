"use client";

import type { DemoScenarioId } from "@/types";
import { useDashboardStore } from "@/lib/store/dashboard-store";

const SCENARIOS: {
  id: DemoScenarioId;
  label: string;
  desc: string;
  num: string;
}[] = [
  {
    num: "①",
    id: "healthy_spike",
    label: "Healthy spike",
    desc: "Conversions track — no gate",
  },
  {
    num: "②",
    id: "bad_spike",
    label: "Bad spike",
    desc: "Flat conversions — approval",
  },
  {
    num: "③",
    id: "brand_safety",
    label: "Brand safety",
    desc: "Tone mismatch",
  },
  {
    num: "④",
    id: "zero_conv_burn",
    label: "Zero-conv burn",
    desc: "£340, 0 conv.",
  },
  {
    num: "⑤",
    id: "guardrail_cap",
    label: "Guardrail cap",
    desc: "Hard limit — no LLM",
  },
];

export function DemoControls() {
  const runScenario = useDashboardStore((s) => s.runScenario);
  const resetDemo = useDashboardStore((s) => s.resetDemo);
  const loading = useDashboardStore((s) => s.scenarioLoading);

  return (
    <div className="panel p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
        Judge demo
      </p>
      <h2 className="font-display mt-1 text-base font-semibold text-[var(--text-primary)]">
        Scenario triggers
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
        Live mock stream keeps running underneath.
      </p>

      <div className="mt-4 space-y-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={!!loading}
            onClick={() => runScenario(s.id)}
            className="group flex w-full items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inset)] px-3 py-2.5 text-left transition hover:border-[#3dbeb6]/30 hover:bg-[var(--accent-dim)] disabled:opacity-50"
          >
            <span className="font-display text-lg leading-none text-[var(--text-muted)] group-hover:text-[#3dbeb6]">
              {s.num}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-[var(--text-primary)]">
                {loading === s.id ? "Running…" : s.label}
              </span>
              <span className="block text-xs text-[var(--text-muted)]">
                {s.desc}
              </span>
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => resetDemo()}
        className="btn-ghost mt-4 w-full py-2.5 text-xs font-medium"
      >
        Reset to calm state
      </button>
    </div>
  );
}
