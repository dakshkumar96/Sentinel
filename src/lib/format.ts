import type { Channel, Placement } from "@/types";

const CHANNEL_LABEL: Record<Channel, string> = {
  chatgpt: "ChatGPT",
  claude_apps: "Claude",
  thrad_publisher: "Thrad",
  other: "Other",
};

/** Per-channel accent for cards and chips */
export const CHANNEL_STYLE: Record<
  Channel,
  { dot: string; chip: string; line: string }
> = {
  chatgpt: {
    dot: "bg-[#10a37f]",
    chip: "bg-[#10a37f]/15 text-[#6ee7b7] border-[#10a37f]/25",
    line: "from-[#10a37f]/80 to-transparent",
  },
  claude_apps: {
    dot: "bg-[#d97757]",
    chip: "bg-[#d97757]/15 text-[#f5c4a8] border-[#d97757]/25",
    line: "from-[#d97757]/70 to-transparent",
  },
  thrad_publisher: {
    dot: "bg-[#5ba4e6]",
    chip: "bg-[#5ba4e6]/15 text-[#93c5fd] border-[#5ba4e6]/25",
    line: "from-[#5ba4e6]/70 to-transparent",
  },
  other: {
    dot: "bg-[#8b949e]",
    chip: "bg-white/5 text-[#b8c0cc] border-white/10",
    line: "from-white/20 to-transparent",
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
  "border-l-[#3dbeb6]",
  "border-l-[#e8a54b]",
  "border-l-[#9b8fd9]",
] as const;
