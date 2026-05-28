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

  const barW = Math.max(4, step * 0.55);
  const gap = step - barW;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0"
      aria-hidden
    >
      {buckets.map((v, i) => {
        const barH = Math.max(2, (v / max) * innerH);
        const x = pad + i * step + gap / 2;
        const y = pad + innerH - barH;
        const fill = spike
          ? "url(#spikeGrad)"
          : "url(#calmGrad)";
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={barH}
            rx={2}
            fill={fill}
            opacity={spike ? 1 : 0.85}
          />
        );
      })}
      <defs>
        <linearGradient id="calmGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="spikeGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
    </svg>
  );
}
