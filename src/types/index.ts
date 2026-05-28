/** Shared domain types — mock stream, guardrails, agent, UI */

export type Channel = "chatgpt" | "claude_apps" | "thrad_publisher" | "other";

export type ClientTier = "standard" | "enterprise";

export interface Client {
  id: string;
  name: string;
  tier: ClientTier;
  dailyBudgetGbp: number;
}

export interface Placement {
  id: string;
  clientId: string;
  channel: Channel;
  name: string;
  status: "active" | "paused" | "learning";
}

export type SpendEventType =
  | "spend_tick"
  | "conversion"
  | "impression"
  | "conversation_context";

export interface SpendEvent {
  id: string;
  ts: string;
  placementId: string;
  clientId: string;
  type: SpendEventType;
  spendGbp?: number;
  conversions?: number;
  conversationSnippet?: string;
  creativeId?: string;
}

export type AlertSeverity = "info" | "warning" | "critical";

export type AlertSource = "guardrail" | "agent";

export type AlertStatus =
  | "open"
  | "pending_human"
  | "approved"
  | "overridden"
  | "resolved"
  | "dismissed";

export interface Alert {
  id: string;
  ts: string;
  clientId: string;
  placementId?: string;
  source: AlertSource;
  severity: AlertSeverity;
  title: string;
  summary: string;
  status: AlertStatus;
  investigationId?: string;
  recommendedAction?: "pause" | "scale_down" | "none";
  requiresHuman: boolean;
}

export type ToolName =
  | "get_conversion_trend"
  | "get_conversation_context"
  | "get_brand_guidelines"
  | "get_historical_baseline"
  | "get_client_context";

export interface ToolCallRecord {
  tool: ToolName;
  input: Record<string, unknown>;
  outputSummary: string;
  ts: string;
}

export type InvestigationVerdict =
  | "healthy"
  | "act"
  | "escalate";

export interface Investigation {
  id: string;
  alertId: string;
  startedAt: string;
  completedAt?: string;
  signal: string;
  toolCalls: ToolCallRecord[];
  reasoning: string;
  verdict: InvestigationVerdict;
  confidence: number;
  requiresHuman: boolean;
  recommendedAction?: "pause" | "scale_down" | "none";
}

export type DemoScenarioId =
  | "healthy_spike"
  | "bad_spike"
  | "brand_safety"
  | "zero_conv_burn"
  | "guardrail_cap";
