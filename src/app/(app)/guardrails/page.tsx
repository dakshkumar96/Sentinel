"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { GuardrailAlerts } from "@/components/dashboard/GuardrailAlerts";
import { formatGbp } from "@/lib/format";
import { useDashboardStore } from "@/lib/store/dashboard-store";

const HARD_LIMITS = [
  {
    title: "Absolute daily cap",
    value: "£10,000",
    desc: "Global ceiling across all clients. Cannot be overridden by the agent.",
  },
  {
    title: "Blocklisted topics",
    value: "3 topics",
    desc: "self-harm · minors · explicit politics — instant pause on match.",
  },
  {
    title: "Auto-pause on breach",
    value: "Enabled",
    desc: "Hard-cap breaches pause placements immediately, then notify.",
  },
];

const BLOCKLIST = ["self_harm", "minors", "explicit_politics"];

export default function GuardrailsPage() {
  const clients = useDashboardStore((s) => s.clients);

  return (
    <>
      <PageHeader
        eyebrow="Deterministic policy"
        title="Guardrails"
        subtitle="Hard limits enforced in code — never by an LLM. Predictable, auditable, always on."
      />

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {HARD_LIMITS.map((rule) => (
            <div key={rule.title} className="panel p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                {rule.title}
              </p>
              <p className="font-mono-data mt-2 text-2xl font-bold text-[var(--text-primary)]">
                {rule.value}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">
                {rule.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="panel overflow-hidden">
            <header className="border-b border-[var(--border-subtle)] px-5 py-4">
              <h2 className="font-display text-[15px] font-semibold text-[var(--text-primary)]">
                Per-client budgets
              </h2>
              <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">
                Daily spend ceilings by advertiser
              </p>
            </header>
            <ul className="divide-y divide-[var(--divider)]">
              {clients.length === 0 ? (
                <li className="px-5 py-6 text-center text-[13px] text-[var(--text-muted)]">
                  Waiting for live feed…
                </li>
              ) : (
                clients.map((client) => (
                  <li key={client.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                        {client.name}
                      </p>
                      <p className="text-[11px] capitalize text-[var(--text-muted)]">
                        {client.tier} tier
                      </p>
                    </div>
                    <span className="font-mono-data text-[14px] font-bold text-[var(--text-primary)]">
                      {formatGbp(client.dailyBudgetGbp)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="panel overflow-hidden">
            <header className="border-b border-[var(--border-subtle)] px-5 py-4">
              <h2 className="font-display text-[15px] font-semibold text-[var(--text-primary)]">
                Blocked conversation topics
              </h2>
              <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">
                Brand-safety hard stops
              </p>
            </header>
            <div className="flex flex-wrap gap-2 p-5">
              {BLOCKLIST.map((topic) => (
                <span
                  key={topic}
                  className="chip border border-[var(--danger)]/25 bg-[var(--danger-dim)] text-[var(--danger)]"
                >
                  {topic.replace(/_/g, " ")}
                </span>
              ))}
            </div>
            <p className="px-5 pb-5 text-[13px] leading-relaxed text-[var(--text-muted)]">
              Any placement whose conversation context matches a blocked topic is paused
              instantly and routed to the audit log — no agent judgment required.
            </p>
          </div>
        </div>

        <GuardrailAlerts />
      </div>
    </>
  );
}
