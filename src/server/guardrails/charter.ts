import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

export interface CharterClient {
  tier: "standard" | "enterprise";
  daily_budget_gbp: number;
  brand_risk: string;
}

export interface Charter {
  guardrails: {
    absolute_daily_cap_gbp: number;
    blocklisted_conversation_topics: string[];
    auto_pause: { on_hard_cap: boolean };
  };
  clients: Record<string, CharterClient>;
}

const TOPIC_KEYWORDS: Record<string, string[]> = {
  self_harm: ["self-harm", "suicide", "self harm"],
  minors: ["minor", "underage", "child exploitation"],
  explicit_politics: ["election rigging", "political party", "partisan"],
};

let cached: Charter | null = null;

export function loadCharter(): Charter {
  if (cached) return cached;
  const path = join(process.cwd(), "config", "charter.yaml");
  cached = parse(readFileSync(path, "utf8")) as Charter;
  return cached;
}

export function matchBlocklistedTopic(snippet: string): string | null {
  const lower = snippet.toLowerCase();
  const topics = loadCharter().guardrails.blocklisted_conversation_topics;
  for (const topic of topics) {
    const keywords = TOPIC_KEYWORDS[topic] ?? [topic.replace(/_/g, " ")];
    if (keywords.some((k) => lower.includes(k))) return topic;
  }
  return null;
}
