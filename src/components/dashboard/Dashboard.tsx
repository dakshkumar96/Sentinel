"use client";

import { useMemo } from "react";
import { useSpendStream } from "@/hooks/use-spend-stream";
import { CLIENT_ACCENT, formatGbp } from "@/lib/format";
import {
  useActiveInvestigation,
  useDashboardStore,
} from "@/lib/store/dashboard-store";
import { ApprovalGate } from "@/components/alerts/ApprovalGate";
import { ReasoningTrace } from "@/components/agent/ReasoningTrace";
import { AuditExport } from "./AuditExport";
import { AlertsPanel } from "./AlertsPanel";
import { DashboardHeader } from "./DashboardHeader";
import { DemoControls } from "./DemoControls";
import { GuardrailAlerts } from "./GuardrailAlerts";
import { PlacementCard } from "./PlacementCard";

export function Dashboard() {
  useSpendStream();
  const activeInvestigation = useActiveInvestigation();

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
    <div className="relative min-h-screen">
      <ApprovalGate />
      <DashboardHeader />

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0 space-y-8">
            <GuardrailAlerts />
            <ReasoningTrace investigation={activeInvestigation} />

            {clients.map((client, clientIdx) => {
              const cards = byClient.get(client.id) ?? [];
              const spend = clientSpend.get(client.id) ?? 0;
              const budgetPct = Math.min(
                100,
                Math.round((spend / client.dailyBudgetGbp) * 100),
              );
              const accent =
                CLIENT_ACCENT[clientIdx % CLIENT_ACCENT.length] ??
                CLIENT_ACCENT[0];

              return (
                <section
                  key={client.id}
                  className={`panel border-l-[3px] ${accent} pl-1`}
                >
                  <div className="px-5 pt-5 pb-3 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                        Client
                      </p>
                      <h2 className="font-display mt-1 text-xl font-semibold text-[var(--text-primary)]">
                        {client.name}
                      </h2>
                      <p className="mt-0.5 text-sm capitalize text-[var(--text-muted)]">
                        {client.tier} tier · {cards.length} placements
                      </p>
                    </div>
                    <div className="text-right min-w-[140px]">
                      <p className="font-mono-data text-lg font-medium text-[var(--text-primary)]">
                        {formatGbp(spend)}
                        <span className="text-sm font-normal text-[var(--text-muted)]">
                          {" "}
                          / {formatGbp(client.dailyBudgetGbp)}
                        </span>
                      </p>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--bg-inset)]">
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

                  <div className="grid gap-4 px-5 pb-5 grid-cols-1 md:grid-cols-2">
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
              <div className="panel py-16 text-center">
                <p className="text-sm text-[var(--text-muted)]">
                  Waiting for live feed…
                </p>
              </div>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <DemoControls />
            <AuditExport />
            <AlertsPanel />
          </aside>
        </div>
      </main>
    </div>
  );
}
