"use client";

import { useActiveInvestigation } from "@/lib/store/dashboard-store";
import { PageHeader } from "@/components/layout/PageHeader";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { GuardrailAlerts } from "@/components/dashboard/GuardrailAlerts";
import { ReasoningTrace } from "@/components/agent/ReasoningTrace";

export default function AlertsPage() {
  const activeInvestigation = useActiveInvestigation();

  return (
    <>
      <PageHeader
        eyebrow="Inbox"
        title="Alerts"
        subtitle="Guardrail and agent signals, escalations awaiting your review, and the reasoning behind each call."
      />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="lg:sticky lg:top-[calc(72px+1.5rem)] lg:self-start">
          <AlertsPanel />
        </div>
        <div className="min-w-0 space-y-6">
          <GuardrailAlerts />
          <ReasoningTrace investigation={activeInvestigation} />
        </div>
      </div>
    </>
  );
}
