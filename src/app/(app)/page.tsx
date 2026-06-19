"use client";

import { useActiveInvestigation } from "@/lib/store/dashboard-store";
import { AgentWatchBanner } from "@/components/agent/AgentWatchBanner";
import { ReasoningTrace } from "@/components/agent/ReasoningTrace";
import { DaySummary } from "@/components/dashboard/DaySummary";
import { GuardrailAlerts } from "@/components/dashboard/GuardrailAlerts";
import { PlacementGrid } from "@/components/dashboard/PlacementGrid";
import { DemoControls } from "@/components/dashboard/DemoControls";
import { AuditExport } from "@/components/dashboard/AuditExport";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";

export default function OverviewPage() {
  const activeInvestigation = useActiveInvestigation();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:gap-7">
      <div className="min-w-0 space-y-6">
        <AgentWatchBanner />
        <DaySummary />
        <GuardrailAlerts />
        <ReasoningTrace investigation={activeInvestigation} />
        <PlacementGrid />
      </div>

      <aside className="space-y-4 lg:sticky lg:top-[calc(72px+1.5rem)] lg:self-start">
        <DemoControls />
        <AuditExport />
        <AlertsPanel />
      </aside>
    </div>
  );
}
