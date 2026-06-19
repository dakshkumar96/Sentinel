"use client";

import { useState, type ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useDashboardStore } from "@/lib/store/dashboard-store";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="panel overflow-hidden">
      <header className="border-b border-[var(--border-subtle)] px-5 py-4">
        <h2 className="font-display text-[15px] font-semibold text-[var(--text-primary)]">
          {title}
        </h2>
        <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{description}</p>
      </header>
      <div className="divide-y divide-[var(--divider)]">{children}</div>
    </section>
  );
}

function Row({
  label,
  hint,
  control,
}: {
  label: string;
  hint?: string;
  control: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-[var(--text-primary)]">{label}</p>
        {hint && <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{hint}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

const ACCENTS = [
  { id: "blue", value: "#2563eb" },
  { id: "indigo", value: "#4f46e5" },
  { id: "emerald", value: "#10b981" },
  { id: "slate", value: "#475569" },
];

export default function SettingsPage() {
  const agentEngine = useDashboardStore((s) => s.agentEngine);
  const resetDemo = useDashboardStore((s) => s.resetDemo);

  const [workspace, setWorkspace] = useState("Ad Operations");
  const [autoInvestigate, setAutoInvestigate] = useState(true);
  const [autoPause, setAutoPause] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [escalationsOnly, setEscalationsOnly] = useState(false);
  const [accent, setAccent] = useState("blue");
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetDemo();
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        subtitle="Manage your workspace, autonomous agent behaviour, and notifications."
      />

      <div className="grid max-w-3xl gap-6">
        <SettingsCard title="Workspace" description="Your team and operating context.">
          <Row
            label="Workspace name"
            hint="Shown across the dashboard"
            control={
              <input
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                className="w-56 rounded-lg border border-[var(--border-subtle)] bg-white px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-dim)]"
              />
            }
          />
          <Row
            label="Region"
            hint="Reporting currency & timezone"
            control={
              <select className="rounded-lg border border-[var(--border-subtle)] bg-white px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]">
                <option>United Kingdom (GBP)</option>
                <option>United States (USD)</option>
                <option>Eurozone (EUR)</option>
              </select>
            }
          />
        </SettingsCard>

        <SettingsCard
          title="Autonomous agent"
          description="Control how much the agent does without a human."
        >
          <Row
            label="Engine"
            hint={
              agentEngine === "claude"
                ? "Claude API connected"
                : "Mock agent (set ANTHROPIC_API_KEY to enable Claude)"
            }
            control={
              <span
                className={`chip border ${
                  agentEngine === "claude"
                    ? "border-[var(--indigo)]/25 bg-[var(--indigo-dim)] text-[var(--indigo)]"
                    : "border-[var(--border-strong)] bg-[var(--bg-inset)] text-[var(--text-muted)]"
                }`}
              >
                {agentEngine === "claude" ? "Claude" : "Mock"}
              </span>
            }
          />
          <Row
            label="Auto-investigate anomalies"
            hint="Run a tool loop the moment a spike or burn is detected"
            control={<Toggle checked={autoInvestigate} onChange={setAutoInvestigate} />}
          />
          <Row
            label="Auto-pause when confident"
            hint="Pause low-risk placements without a human gate"
            control={<Toggle checked={autoPause} onChange={setAutoPause} />}
          />
          <Row
            label="Human-gate confidence threshold"
            hint="Below this, always ask a human"
            control={
              <div className="flex items-center gap-3">
                <input type="range" min={50} max={99} defaultValue={85} className="accent-[var(--accent)]" />
                <span className="font-mono-data w-9 text-right text-[13px] text-[var(--text-primary)]">85%</span>
              </div>
            }
          />
        </SettingsCard>

        <SettingsCard title="Notifications" description="Where and when we reach you.">
          <Row label="Email alerts" control={<Toggle checked={emailAlerts} onChange={setEmailAlerts} />} />
          <Row label="In-app alerts" control={<Toggle checked={inAppAlerts} onChange={setInAppAlerts} />} />
          <Row
            label="Escalations only"
            hint="Mute healthy/logged signals"
            control={<Toggle checked={escalationsOnly} onChange={setEscalationsOnly} />}
          />
        </SettingsCard>

        <SettingsCard title="Appearance" description="Personalize the interface accent.">
          <Row
            label="Accent colour"
            control={
              <div className="flex items-center gap-2">
                {ACCENTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    aria-label={a.id}
                    onClick={() => setAccent(a.id)}
                    className={`h-7 w-7 rounded-full transition ${
                      accent === a.id
                        ? "ring-2 ring-offset-2 ring-[var(--text-muted)]"
                        : ""
                    }`}
                    style={{ background: a.value }}
                  />
                ))}
              </div>
            }
          />
        </SettingsCard>

        <SettingsCard title="Danger zone" description="Irreversible workspace actions.">
          <Row
            label="Reset demo data"
            hint="Clear alerts, investigations, and return to a calm state"
            control={
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="rounded-lg border border-[var(--danger)]/30 bg-[var(--danger-dim)] px-3.5 py-2 text-[12px] font-semibold text-[var(--danger)] transition hover:bg-[var(--danger)]/15 disabled:opacity-50"
              >
                {resetting ? "Resetting…" : "Reset"}
              </button>
            }
          />
        </SettingsCard>
      </div>
    </>
  );
}
