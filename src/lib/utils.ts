export function formatGbp(n: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatChannel(channel: string): string {
  const labels: Record<string, string> = {
    chatgpt: "ChatGPT",
    claude_apps: "Claude Apps",
    thrad_publisher: "Thrad",
    other: "Other",
  };
  return labels[channel] ?? channel;
}
