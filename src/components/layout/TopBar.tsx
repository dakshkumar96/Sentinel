"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import { SentinelLogo } from "@/components/brand/SentinelLogo";
import {
  computeEscalationStats,
  filterOpenAlerts,
  useDashboardStore,
} from "@/lib/store/dashboard-store";

interface NavItem {
  href: string;
  label: string;
  badge?: boolean;
}

const NAV: NavItem[] = [
  { href: "/", label: "Overview" },
  { href: "/placements", label: "Placements" },
  { href: "/alerts", label: "Alerts", badge: true },
  { href: "/guardrails", label: "Guardrails" },
  { href: "/audit", label: "Audit Log" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TopBar() {
  const pathname = usePathname();
  const connected = useDashboardStore((s) => s.connected);
  const agentEngine = useDashboardStore((s) => s.agentEngine);
  const alerts = useDashboardStore((s) => s.alerts);
  const stats = useMemo(() => computeEscalationStats(alerts), [alerts]);
  const openAlerts = useMemo(() => filterOpenAlerts(alerts), [alerts]);

  const settingsActive = isActive(pathname, "/settings");

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.06] bg-[#0b1220]">
      <div className="flex h-[72px] w-full items-center gap-5 px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center" aria-label="Sentinel home">
          <SentinelLogo size={34} tone="dark" />
        </Link>

        <span className="hidden h-6 w-px bg-white/10 lg:block" />

        {/* Primary nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                }`}
              >
                {item.label}
                {item.badge && openAlerts.length > 0 && (
                  <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-bold text-white">
                    {openAlerts.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2.5">
          {/* Stat counters */}
          <div className="hidden items-center divide-x divide-white/10 rounded-xl border border-white/10 bg-white/[0.03] md:flex">
            <Stat label="Signals" value={stats.signals} />
            <Stat label="Escalations" value={stats.escalations} accent />
            {stats.pending > 0 && <Stat label="Pending" value={stats.pending} warn />}
          </div>

          {/* Agent engine */}
          <Chip
            tone={agentEngine === "claude" ? "indigo" : "muted"}
            icon={
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 3a4 4 0 014 4v1h1a3 3 0 010 6h-1v1a4 4 0 01-8 0v-1H7a3 3 0 010-6h1V7a4 4 0 014-4z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <circle cx="9" cy="12" r="1" fill="currentColor" />
                <circle cx="15" cy="12" r="1" fill="currentColor" />
              </svg>
            }
          >
            {agentEngine === "claude" ? "Claude API" : "Mock agent"}
          </Chip>

          {/* Live */}
          <Chip tone={connected ? "green" : "muted"}>
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connected ? "live-dot bg-[var(--green)]" : "bg-slate-500"
              }`}
            />
            {connected ? "Live" : "Connecting…"}
          </Chip>

          <span className="hidden h-6 w-px bg-white/10 sm:block" />

          {/* Settings */}
          <Link
            href="/settings"
            aria-label="Settings"
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
              settingsActive
                ? "border-white/15 bg-white/[0.10] text-white"
                : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>

          {/* Avatar */}
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[11px] font-bold text-white"
            style={{ background: "linear-gradient(135deg,#2563eb,#4f46e5)" }}
            aria-hidden
          >
            DK
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-white/[0.06] px-4 py-2 lg:hidden">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                active ? "bg-white/[0.08] text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

function Stat({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: number;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="flex flex-col items-center px-3.5 py-1.5">
      <span
        className={`font-mono-data text-[13px] font-bold leading-none ${
          warn ? "text-[var(--amber)]" : accent ? "text-[#93b4fb]" : "text-white"
        }`}
      >
        {value}
      </span>
      <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
    </div>
  );
}

function Chip({
  children,
  tone,
  icon,
}: {
  children: ReactNode;
  tone: "indigo" | "green" | "muted";
  icon?: ReactNode;
}) {
  const tones = {
    indigo: "border-indigo-400/30 bg-indigo-400/10 text-indigo-200",
    green: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    muted: "border-white/10 bg-white/[0.03] text-slate-400",
  } as const;
  return (
    <span
      className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:flex ${tones[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}
