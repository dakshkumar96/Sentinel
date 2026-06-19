interface SentinelLogoProps {
  size?: number;
  withWordmark?: boolean;
  tone?: "light" | "dark";
  className?: string;
}

/**
 * Sentinel mark — a guardian shield with a watchful pulse.
 * Minimal, geometric, gradient blue→indigo badge.
 */
export function SentinelLogo({
  size = 32,
  withWordmark = true,
  tone = "dark",
  className = "",
}: SentinelLogoProps) {
  const wordColor = tone === "dark" ? "#f1f5f9" : "#111827";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <defs>
          <linearGradient id="sentinel-badge" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill="url(#sentinel-badge)" />
        <rect
          width="39"
          height="39"
          x="0.5"
          y="0.5"
          rx="10.5"
          stroke="#ffffff"
          strokeOpacity="0.18"
        />
        {/* Shield */}
        <path
          d="M20 9.5l7.5 3v6.2c0 4.9-3.2 8.4-7.5 9.8-4.3-1.4-7.5-4.9-7.5-9.8V12.5L20 9.5z"
          stroke="#ffffff"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        {/* Watch pulse */}
        <circle cx="20" cy="19" r="3.2" fill="#ffffff" fillOpacity="0.95" />
        <circle cx="20" cy="19" r="6" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.2" />
      </svg>
      {withWordmark && (
        <span
          className="font-display text-[16px] font-bold tracking-[-0.02em]"
          style={{ color: wordColor }}
        >
          Sentinel
        </span>
      )}
    </span>
  );
}
