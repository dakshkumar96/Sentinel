"use client";

import type { DemoScenarioId } from "@/types";
import { useDashboardStore } from "@/lib/store/dashboard-store";

const SCENARIOS: { id: DemoScenarioId; label: string; desc: string }[] = [
  {
    id: "healthy_spike",
    label: "Healthy spike",
    desc: "4× spend, conversions track",
  },
  {
    id: "bad_spike",
    label: "Bad spike",
    desc: "4× spend, flat conversions",
  },
  {
    id: "brand_safety",
    label: "Brand safety",
    desc: "Tone mismatch flag",
  },
  {
    id: "zero_conv_burn",
    label: "Zero conv. burn",
    desc: "£340, 0 conversions",
  },
  {
    id: "guardrail_cap",
    label: "Guardrail cap",
    desc: "Hard budget auto-pause",
  },
];

export function DemoControls() {
  const runScenario = useDashboardStore((s) => s.runScenario);
  const resetDemo = useDashboardStore((s) => s.resetDemo);
  const loading = useDashboardStore((s) => s.scenarioLoading);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <h2 className="text-sm font-semibold text-zinc-200">Demo scenarios</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Trigger events for judges — live mock stream keeps running.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={!!loading}
            onClick={() => runScenario(s.id)}
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-left transition hover:border-zinc-600 hover:bg-zinc-800 disabled:opacity-50"
          >
            <span className="block text-xs font-medium text-zinc-200">
              {loading === s.id ? "Running…" : s.label}
            </span>
            <span className="block text-[10px] text-zinc-500">{s.desc}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => resetDemo()}
        className="mt-3 w-full rounded-lg border border-zinc-700 py-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
      >
        Reset to calm state
      </button>
    </div>
  );
}
