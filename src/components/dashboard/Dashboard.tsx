"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/lib/store/dashboard-store";
import { formatGbp } from "@/lib/utils";
import { AlertsPanel } from "./AlertsPanel";
import { DemoControls } from "./DemoControls";
import { PlacementCard } from "./PlacementCard";

export function Dashboard() {
  const connect = useDashboardStore((s) => s.connect);
  const disconnect = useDashboardStore((s) => s.disconnect);
  const connected = useDashboardStore((s) => s.connected);
  const clients = useDashboardStore((s) => s.clients);
  const placements = useDashboardStore((s) => s.placements);
  const metrics = useDashboardStore((s) => s.metrics);
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const totalSpend = Object.values(metrics).reduce(
    (sum, m) => sum + (m?.spendTodayGbp ?? 0),
    0,
  );
  const criticalCount = Object.values(metrics).filter(
    (m) => m?.health === "critical",
  ).length;
  const allHealthy = criticalCount === 0 && connected;

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900/30 px-6 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-50">
              Sentinel
            </h1>
            <p className="text-sm text-zinc-500">
              AI-channel spend guardian · agency command center
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-zinc-500">Total spend today</p>
              <p className="text-lg font-semibold tabular-nums text-zinc-100">
                {formatGbp(totalSpend)}
              </p>
            </div>
            <div
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                allHealthy
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-400"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-zinc-600"} ${connected ? "animate-pulse" : ""}`}
              />
              {connected
                ? allHealthy
                  ? "All systems normal"
                  : `${criticalCount} critical`
                : "Connecting…"}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 p-6 lg:grid-cols-[1fr_320px]">
        <main className="space-y-8">
          {clients.length === 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
              <p className="text-sm text-zinc-400">
                {connected
                  ? "Loading placements…"
                  : "Connecting to live spend stream…"}
              </p>
              <p className="mt-2 text-xs text-zinc-600">
                If this stays blank, restart the dev server (see README).
              </p>
            </div>
          )}
          {clients.map((client) => {
            const clientPlacements = placements.filter(
              (p) => p.clientId === client.id,
            );
            if (clientPlacements.length === 0) return null;

            const clientSpend = clientPlacements.reduce(
              (s, p) => s + (metrics[p.id]?.spendTodayGbp ?? 0),
              0,
            );

            return (
              <section key={client.id}>
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-sm font-semibold text-zinc-300">
                    {client.name}
                    <span className="ml-2 font-normal text-zinc-600">
                      {client.tier}
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Budget {formatGbp(client.dailyBudgetGbp)} ·{" "}
                    {formatGbp(clientSpend)} spent
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {clientPlacements.map((p) => (
                    <PlacementCard
                      key={p.id}
                      placement={p}
                      client={client}
                      metrics={metrics[p.id]}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </main>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <AlertsPanel />
          <DemoControls />
        </aside>
      </div>
    </div>
  );
}
