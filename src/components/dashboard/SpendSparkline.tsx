"use client";

interface SpendSparklineProps {
  buckets: number[];
  width?: number;
  height?: number;
  spike?: boolean;
}

export function SpendSparkline({
  buckets,
  width = 112,
  height = 40,
  spike = false,
}: SpendSparklineProps) {
  const max = Math.max(...buckets, 1);
  const pad = 3;
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

  const stroke = spike ? "var(--warm)" : "var(--accent)";
  const fill = spike ? "var(--warm-dim)" : "var(--accent-dim)";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0 opacity-90"
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
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
