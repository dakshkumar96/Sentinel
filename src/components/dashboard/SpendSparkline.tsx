"use client";

interface SpendSparklineProps {
  data: number[];
  health: "healthy" | "warning" | "critical";
  width?: number;
  height?: number;
}

const stroke: Record<string, string> = {
  healthy: "#34d399",
  warning: "#fbbf24",
  critical: "#f87171",
};

export function SpendSparkline({
  data,
  health,
  width = 120,
  height = 36,
}: SpendSparklineProps) {
  if (data.length < 2) {
    return (
      <svg width={width} height={height} className="opacity-30">
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="#52525b"
        />
      </svg>
    );
  }

  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 2;
  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (width - pad * 2);
      const y = pad + (1 - (v - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={stroke[health]}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}
