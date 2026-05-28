import type { Channel, Placement } from "@/types";

const CHANNEL_LABEL: Record<Channel, string> = {
  chatgpt: "ChatGPT",
  claude_apps: "Claude Apps",
  thrad_publisher: "Thrad",
  other: "Other",
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
