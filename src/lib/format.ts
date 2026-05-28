import type { Channel, Placement } from "@/types";

const CHANNEL_LABEL: Record<Channel, string> = {
  chatgpt: "ChatGPT",
  claude_apps: "Claude",
  thrad_publisher: "Thrad",
  other: "Other",
};

/** Channel chips on warm light surfaces */
export const CHANNEL_STYLE: Record<
  Channel,
  { dot: string; chip: string; line: string }
> = {
  chatgpt: {
    dot: "bg-[var(--green)]",
    chip: "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
    line: "from-[var(--green)]/45 to-transparent",
  },
  claude_apps: {
    dot: "bg-[var(--accent)]",
    chip: "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
    line: "from-[var(--accent)]/45 to-transparent",
  },
  thrad_publisher: {
    dot: "bg-[var(--blue)]",
    chip: "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
    line: "from-[var(--blue)]/45 to-transparent",
  },
  other: {
    dot: "bg-[var(--text-muted)]",
    chip: "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-subtle)]",
    line: "from-stone-400/30 to-transparent",
  },
};

export function channelLabel(channel: Channel): string {
  return CHANNEL_LABEL[channel] ?? channel;
}

export function formatGbp(amount: number): string {
  return `£${amount.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
}

export function statusLabel(status: Placement["status"]): string {
  switch (status) {
    case "active":
      return "Active";
    case "paused":
      return "Paused";
    case "learning":
      return "Learning";
  }
}

export const CLIENT_ACCENT = [
  "border-l-[var(--accent-strong)]",
  "border-l-[var(--green)]",
  "border-l-[var(--blue)]",
] as const;
