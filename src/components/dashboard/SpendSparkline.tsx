"use client";

import { isOutOfBand } from "@/lib/spend/metrics";

interface SpendSparklineProps {
  buckets: number[];
  width?: number;
  height?: number;
}

export function SpendSparkline({
  buckets,
  width = 120,
  height = 36,
}: SpendSparklineProps) {
  const max = Math.max(...buckets, 1);
  const spike = isOutOfBand(buckets);
  const pad = 2;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const step = buckets.length > 1 ? innerW / (buckets.length - 1) : 0;

  const points = buckets
    .map((v, i) => {
      const x = pad + i * step;
      const y = pad + innerH - (v / max) * innerH;
      return `${x},${y}`;
    })
    .join(" ");

  const stroke = spike ? "#ef4444" : "#34d399";
  const fill = spike ? "rgba(239,68,68,0.15)" : "rgba(52,211,153,0.12)";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0"
      aria-hidden
    >
      <polyline
        points={`${pad},${height - pad} ${points} ${width - pad},${height - pad}`}
        fill={fill}
        stroke="none"
      />
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
