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
  accent: "#c96442",
  accentSoft: "rgba(201, 100, 66, 0.15)",
  grid: "rgba(28, 25, 23, 0.08)",
  axis: "#78716c",
  budget: "#ebe6de",
  spend: {
    calm: "#2d7a4f",
    elevated: "#b8860b",
    critical: "#c44c4c",
  },
} as const;

function spendColor(health: AdvertiserChartPoint["health"]): string {
  return CHART.spend[health];
}

const tooltipProps = {
  contentStyle: {
    background: "#ffffff",
    border: "1px solid rgba(28, 25, 23, 0.1)",
    borderRadius: "12px",
    fontSize: "12px",
    boxShadow: "0 4px 20px rgba(28, 25, 23, 0.08)",
  },
  labelStyle: { color: "#57534e", fontWeight: 600 },
  itemStyle: { color: "#1c1917" },
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
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Portfolio spend (today)
        </p>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          Combined £/hr across all AI placements
        </p>
        <div className="mt-4 h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={portfolioHourly}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART.accent} stopOpacity={0.35} />
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
                activeDot={{ r: 4, fill: CHART.accent }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
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
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                formatter={(value) =>
                  value === "spend" ? "Spend today" : "Daily budget"
                }
              />
              <Bar
                dataKey="budget"
                name="budget"
                fill={CHART.budget}
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
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
