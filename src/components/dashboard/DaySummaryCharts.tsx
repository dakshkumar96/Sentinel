"use client";

import type { AdvertiserChartPoint, HourlyPortfolioPoint } from "@/lib/spend/day-summary";
import { formatGbp } from "@/lib/format";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART = {
  accent: "#2563eb",
  accentSoft: "rgba(37, 99, 235, 0.15)",
  grid: "#eef2f7",
  axis: "#9ca3af",
  budget: "#cbd5e1",
  spend: {
    calm: "#10b981",
    elevated: "#f59e0b",
    critical: "#ef4444",
  },
} as const;

function spendColor(health: AdvertiserChartPoint["health"]): string {
  return CHART.spend[health];
}

const tooltipProps = {
  contentStyle: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "12px",
    fontFamily: "var(--font-inter), sans-serif",
    boxShadow: "0 4px 12px rgba(17, 24, 39, 0.06)",
  },
  labelStyle: { color: "#6b7280", fontWeight: 600 },
  itemStyle: { color: "#111827", fontFamily: "var(--font-inter), sans-serif" },
};

interface DaySummaryChartsProps {
  portfolioHourly: HourlyPortfolioPoint[];
  advertiserChart: AdvertiserChartPoint[];
}

export function DaySummaryCharts({
  portfolioHourly,
  advertiserChart,
}: DaySummaryChartsProps) {
  return (
    <div className="grid gap-4 border-t border-[var(--border-subtle)] p-4 sm:grid-cols-2 sm:p-5">
      <div
        className="relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-white p-4"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="card-shimmer" />
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Portfolio spend (today)
        </p>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          Combined £/hr across all AI placements
        </p>
        <div className="mt-4 h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioHourly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART.accent} stopOpacity={0.30} />
                  <stop offset="100%" stopColor={CHART.accent} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: CHART.axis, fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: CHART.grid }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: CHART.axis, fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `£${v}`}
                width={44}
              />
              <Tooltip
                {...tooltipProps}
                formatter={(value) => [formatGbp(Number(value)), "Spend"]}
                labelFormatter={(label) => `Hour ${label}`}
              />
              <Area
                type="monotone"
                dataKey="spendGbp"
                stroke={CHART.accent}
                strokeWidth={2}
                fill="url(#spendGradient)"
                dot={false}
                activeDot={{ r: 4, fill: CHART.accent, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-white p-4"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="card-shimmer" />
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Spend vs daily budget
        </p>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          By advertiser · bar colour = health
        </p>
        <div className="mt-4 h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={advertiserChart}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              barGap={4}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
              <XAxis
                dataKey="shortName"
                tick={{ fill: CHART.axis, fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: CHART.grid }}
              />
              <YAxis
                tick={{ fill: CHART.axis, fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  const n = Number(v);
                  if (n >= 1000) return `£${(n / 1000).toFixed(1)}k`;
                  return `£${n}`;
                }}
                width={40}
              />
              <Tooltip
                {...tooltipProps}
                formatter={(value, name) => [
                  formatGbp(Number(value)),
                  name === "spend" ? "Spend today" : "Daily budget",
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px", color: CHART.axis }}
                formatter={(value) =>
                  value === "spend" ? "Spend today" : "Daily budget"
                }
              />
              <Bar dataKey="budget" name="budget" fill={CHART.budget} radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="spend" name="spend" radius={[4, 4, 0, 0]} maxBarSize={32}>
                {advertiserChart.map((entry) => (
                  <Cell key={entry.name} fill={spendColor(entry.health)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
