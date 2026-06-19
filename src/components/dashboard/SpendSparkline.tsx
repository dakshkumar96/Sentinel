"use client";

import { useId } from "react";

interface SpendSparklineProps {
  buckets: number[];
  width?: number;
  height?: number;
  spike?: boolean;
}

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  return points.reduce((path, pt, i) => {
    if (i === 0) return `M ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`;
    const prev = points[i - 1]!;
    const cpx = ((prev.x + pt.x) / 2).toFixed(2);
    return `${path} C ${cpx} ${prev.y.toFixed(2)}, ${cpx} ${pt.y.toFixed(2)}, ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`;
  }, "");
}

export function SpendSparkline({
  buckets,
  width = 120,
  height = 44,
  spike = false,
}: SpendSparklineProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `sg-${uid}`;
  const glowId = `gw-${uid}`;
  const clipId = `cl-${uid}`;

  const pad = { top: 4, right: 2, bottom: 4, left: 2 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const max = Math.max(...buckets, 1);
  const points = buckets.map((v, i) => ({
    x: pad.left + (i / Math.max(buckets.length - 1, 1)) * innerW,
    y: pad.top + innerH - (v / max) * innerH,
  }));

  const linePath = smoothPath(points);
  const first = points[0]!;
  const last = points[points.length - 1]!;
  const areaPath = `${linePath} L ${last.x.toFixed(2)} ${(pad.top + innerH).toFixed(2)} L ${first.x.toFixed(2)} ${(pad.top + innerH).toFixed(2)} Z`;

  const calmColor = "#2563eb";
  const spikeColor = "#f59e0b";
  const lineColor = spike ? spikeColor : calmColor;
  const areaTop = spike ? "rgba(245,158,11,0.22)" : "rgba(37,99,235,0.18)";
  const areaBot = spike ? "rgba(245,158,11,0.02)" : "rgba(37,99,235,0.02)";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={areaTop} />
          <stop offset="100%" stopColor={areaBot} />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id={clipId}>
          <rect x={pad.left} y={pad.top} width={innerW} height={innerH} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth={spike ? 1.75 : 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={spike ? `url(#${glowId})` : undefined}
          style={{ transition: "stroke 0.4s ease" }}
        />
        {points.length > 0 && (
          <circle
            cx={last.x}
            cy={last.y}
            r={spike ? 2.5 : 2}
            fill={lineColor}
            opacity={0.9}
          />
        )}
      </g>
    </svg>
  );
}
