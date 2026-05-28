"use client";

import { useMemo } from "react";
import { useSpendStream } from "@/hooks/use-spend-stream";
import { formatGbp } from "@/lib/format";
import { useDashboardStore } from "@/lib/store/dashboard-store";
import { AlertsPanel } from "./AlertsPanel";
import { DemoControls } from "./DemoControls";
import { GuardrailAlerts } from "./GuardrailAlerts";
import { PlacementCard } from "./PlacementCard";

export function Dashboard() {
  useSpendStream();

  const connected = useDashboardStore((s) => s.connected);
  const clients = useDashboardStore((s) => s.clients);
  const placements = useDashboardStore((s) => s.placements);
  const states = useDashboardStore((s) => s.states);

  const clientSpend = useMemo(() => {
    const totals = new Map<string, number>();
    for (const p of placements) {
      const daily = states[p.id]?.dailySpendGbp ?? 0;
      totals.set(p.clientId, (totals.get(p.clientId) ?? 0) + daily);
    }
    return totals;
  }, [placements, states]);

  const byClient = useMemo(() => {
    const map = new Map<string, typeof placements>();
    for (const p of placements) {
      const list = map.get(p.clientId) ?? [];
      list.push(p);
      map.set(p.clientId, list);
    }
    return map;
  }, [placements]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Sentinel</h1>
            <p className="text-sm text-zinc-500">
              Live spend watch — AI-channel placements
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-zinc-600"}`}
            />
            <span className="text-zinc-400">
              {connected ? "Live" : "Connecting…"}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6 min-w-0">
            <GuardrailAlerts />

            {clients.map((client) => {
          const cards = byClient.get(client.id) ?? [];
          const spend = clientSpend.get(client.id) ?? 0;
          const budgetPct = Math.min(
            100,
            Math.round((spend / client.dailyBudgetGbp) * 100),
          );

          return (
            <section key={client.id} className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-lg font-medium text-zinc-100">
                    {client.name}
                  </h2>
                  <p className="text-xs text-zinc-500 capitalize">
                    {client.tier} · {cards.length} placements
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm tabular-nums text-zinc-300">
                    {formatGbp(spend)}{" "}
                    <span className="text-zinc-600">
                      / {formatGbp(client.dailyBudgetGbp)}
                    </span>
                  </p>
                  <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        budgetPct >= 90
                          ? "bg-red-500"
                          : budgetPct >= 70
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      style={{ width: `${budgetPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((placement) => (
                  <PlacementCard
                    key={placement.id}
                    placement={placement}
                    state={states[placement.id]}
                  />
                ))}
              </div>
            </section>
            );
          })}

            {clients.length === 0 && (
              <p className="text-center text-sm text-zinc-500">
                Waiting for live feed…
              </p>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <DemoControls />
            <AlertsPanel />
          </aside>
        </div>
      </main>
    </div>
  );
}
