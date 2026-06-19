"use client";

import { useMemo } from "react";
import { CLIENT_ACCENT, formatGbp } from "@/lib/format";
import { useDashboardStore } from "@/lib/store/dashboard-store";
import { PlacementCard } from "./PlacementCard";

export function PlacementGrid() {
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

  if (clients.length === 0) {
    return (
      <div className="panel py-16 text-center">
        <p className="text-[13px] text-[var(--text-muted)]">Waiting for live feed…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {clients.map((client, clientIdx) => {
        const cards = byClient.get(client.id) ?? [];
        const spend = clientSpend.get(client.id) ?? 0;
        const budgetPct = Math.min(
          100,
          Math.round((spend / client.dailyBudgetGbp) * 100),
        );
        const accent = CLIENT_ACCENT[clientIdx % CLIENT_ACCENT.length] ?? CLIENT_ACCENT[0];

        return (
          <section key={client.id} className={`panel overflow-hidden border-l-[3px] ${accent}`}>
            <div className="flex flex-wrap items-end justify-between gap-4 px-5 pt-5 pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Client
                </p>
                <h2 className="font-display mt-1 text-[17px] font-semibold text-[var(--text-primary)]">
                  {client.name}
                </h2>
                <p className="mt-0.5 text-[13px] capitalize text-[var(--text-muted)]">
                  {client.tier} tier · {cards.length} placements
                </p>
              </div>
              <div className="min-w-[140px] text-right">
                <p className="font-mono-data text-lg font-bold text-[var(--text-primary)]">
                  {formatGbp(spend)}
                  <span className="text-[13px] font-normal text-[var(--text-muted)]">
                    {" "}
                    / {formatGbp(client.dailyBudgetGbp)}
                  </span>
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--bg-inset)]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      budgetPct >= 90
                        ? "bg-[var(--danger)]"
                        : budgetPct >= 70
                          ? "bg-[var(--warm)]"
                          : "bg-[var(--green)]"
                    }`}
                    style={{ width: `${budgetPct}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                  {budgetPct}% of daily budget
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 px-5 pb-5 md:grid-cols-2">
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
    </div>
  );
}
