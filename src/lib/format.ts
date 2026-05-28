import type { Channel, Placement } from "@/types";

const CHANNEL_LABEL: Record<Channel, string> = {
  chatgpt: "ChatGPT",
  claude_apps: "Claude",
  thrad_publisher: "Thrad",
  other: "Other",
};

/** Muted channel chips on dark surfaces */
export const CHANNEL_STYLE: Record<
  Channel,
  { dot: string; chip: string; line: string }
> = {
  chatgpt: {
    dot: "bg-[#4ade80]",
    chip: "bg-[#1c1c1c] text-[#a3a3a3] border-[#2a2a2a]",
    line: "from-[#4ade80]/50 to-transparent",
  },
  claude_apps: {
    dot: "bg-[#fbbf24]",
    chip: "bg-[#1c1c1c] text-[#a3a3a3] border-[#2a2a2a]",
    line: "from-[#fbbf24]/50 to-transparent",
  },
  thrad_publisher: {
    dot: "bg-[#60a5fa]",
    chip: "bg-[#1c1c1c] text-[#a3a3a3] border-[#2a2a2a]",
    line: "from-[#60a5fa]/50 to-transparent",
  },
  other: {
    dot: "bg-[#737373]",
    chip: "bg-[#1c1c1c] text-[#737373] border-[#2a2a2a]",
    line: "from-white/15 to-transparent",
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
  "border-l-[var(--purple-strong)]",
  "border-l-[var(--green)]",
  "border-l-[var(--blue)]",
] as const;
