import { emptyHourlyBuckets, healthTone, HOURLY_BUCKETS } from "@/lib/spend/metrics";
import type { Alert, Client, Placement } from "@/types";
import type { PlacementLiveState } from "@/types/stream";

export type AdvertiserHealth = "calm" | "elevated" | "critical";

export interface AdvertiserDayRow {
  clientId: string;
  name: string;
  tier: Client["tier"];
  spendGbp: number;
  budgetGbp: number;
  budgetPct: number;
  placementsTotal: number;
  placementsActive: number;
  placementsPaused: number;
  openAlerts: number;
  health: AdvertiserHealth;
}

export interface HourlyPortfolioPoint {
  label: string;
  spendGbp: number;
}

export interface AdvertiserChartPoint {
  name: string;
  shortName: string;
  spend: number;
  budget: number;
  budgetPct: number;
  health: AdvertiserHealth;
}

export interface DaySummary {
  dateLabel: string;
  totalSpendGbp: number;
  totalBudgetGbp: number;
  budgetPct: number;
  activePlacements: number;
  pausedPlacements: number;
  learningPlacements: number;
  openAlerts: number;
  pendingHuman: number;
  advertisers: AdvertiserDayRow[];
  portfolioHourly: HourlyPortfolioPoint[];
  advertiserChart: AdvertiserChartPoint[];
  headline: string;
  subline: string;
}

export function aggregatePortfolioHourly(
  placements: Placement[],
  states: Record<string, PlacementLiveState>,
): HourlyPortfolioPoint[] {
  const totals = emptyHourlyBuckets();
  for (const p of placements) {
    const buckets = states[p.id]?.hourlyBuckets ?? [];
    for (let i = 0; i < HOURLY_BUCKETS; i++) {
      totals[i] += buckets[i] ?? 0;
    }
  }

  const nowHour = new Date().getHours();
  return totals.map((spendGbp, i) => {
    const hoursAgo = HOURLY_BUCKETS - 1 - i;
    const hour = (nowHour - hoursAgo + 24) % 24;
    const label = `${hour.toString().padStart(2, "0")}:00`;
    return { label, spendGbp: Math.round(spendGbp * 10) / 10 };
  });
}

function shortAdvertiserName(name: string): string {
  const first = name.split(/\s+/)[0] ?? name;
  return first.length > 12 ? `${first.slice(0, 11)}…` : first;
}

const HEALTH_RANK: Record<AdvertiserHealth, number> = {
  calm: 0,
  elevated: 1,
  critical: 2,
};

function maxHealth(a: AdvertiserHealth, b: AdvertiserHealth): AdvertiserHealth {
  return HEALTH_RANK[a] >= HEALTH_RANK[b] ? a : b;
}

function toneToAdvertiserHealth(
  tone: ReturnType<typeof healthTone>,
): AdvertiserHealth {
  if (tone === "critical") return "critical";
  if (tone === "elevated") return "elevated";
  return "calm";
}

export function computeDaySummary(
  clients: Client[],
  placements: Placement[],
  states: Record<string, PlacementLiveState>,
  alerts: Alert[],
): DaySummary {
  const openAlerts = alerts.filter(
    (a) => a.status === "open" || a.status === "pending_human",
  );
  const pendingHuman = alerts.filter((a) => a.status === "pending_human").length;

  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const advertisers: AdvertiserDayRow[] = clients.map((client) => {
    const clientPlacements = placements.filter((p) => p.clientId === client.id);
    let spendGbp = 0;
    let health: AdvertiserHealth = "calm";

    for (const p of clientPlacements) {
      const st = states[p.id];
      spendGbp += st?.dailySpendGbp ?? 0;
      const tone = healthTone(st?.hourlyBuckets ?? [], p.status);
      health = maxHealth(health, toneToAdvertiserHealth(tone));
    }

    const budgetPct = client.dailyBudgetGbp
      ? Math.min(100, Math.round((spendGbp / client.dailyBudgetGbp) * 100))
      : 0;

    return {
      clientId: client.id,
      name: client.name,
      tier: client.tier,
      spendGbp,
      budgetGbp: client.dailyBudgetGbp,
      budgetPct,
      placementsTotal: clientPlacements.length,
      placementsActive: clientPlacements.filter((p) => p.status === "active").length,
      placementsPaused: clientPlacements.filter((p) => p.status === "paused").length,
      openAlerts: openAlerts.filter((a) => a.clientId === client.id).length,
      health,
    };
  });

  const totalSpendGbp = advertisers.reduce((s, a) => s + a.spendGbp, 0);
  const totalBudgetGbp = clients.reduce((s, c) => s + c.dailyBudgetGbp, 0);
  const budgetPct = totalBudgetGbp
    ? Math.min(100, Math.round((totalSpendGbp / totalBudgetGbp) * 100))
    : 0;

  const activePlacements = placements.filter((p) => p.status === "active").length;
  const pausedPlacements = placements.filter((p) => p.status === "paused").length;
  const learningPlacements = placements.filter((p) => p.status === "learning").length;

  const needsAttention =
    pendingHuman > 0 ||
    advertisers.some((a) => a.health !== "calm" || a.openAlerts > 0);

  const headline = needsAttention
    ? `${pendingHuman > 0 ? pendingHuman : openAlerts.length} item${(pendingHuman || openAlerts.length) === 1 ? "" : "s"} need attention across the book`
    : "All advertisers within normal guardrails today";

  const subline = `${clients.length} advertisers · ${placements.length} AI placements · ${budgetPct}% of combined daily budget used`;

  const portfolioHourly = aggregatePortfolioHourly(placements, states);
  const advertiserChart: AdvertiserChartPoint[] = advertisers.map((a) => ({
    name: a.name,
    shortName: shortAdvertiserName(a.name),
    spend: Math.round(a.spendGbp),
    budget: a.budgetGbp,
    budgetPct: a.budgetPct,
    health: a.health,
  }));

  return {
    dateLabel,
    totalSpendGbp,
    totalBudgetGbp,
    budgetPct,
    activePlacements,
    pausedPlacements,
    learningPlacements,
    openAlerts: openAlerts.length,
    pendingHuman,
    advertisers,
    portfolioHourly,
    advertiserChart,
    headline,
    subline,
  };
}
