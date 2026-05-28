import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { DemoScenarioId, ToolName } from "@/types";

interface BrandGuidelines {
  never_associate_with: string[];
  tone: string;
}

const brandCache = new Map<string, BrandGuidelines>();

function loadBrand(clientId: string): BrandGuidelines {
  if (brandCache.has(clientId)) return brandCache.get(clientId)!;
  const path = join(process.cwd(), "config", "brands", `${clientId}.yaml`);
  try {
    const doc = parse(readFileSync(path, "utf8")) as BrandGuidelines;
    brandCache.set(clientId, doc);
    return doc;
  } catch {
    const fallback = { never_associate_with: [], tone: "neutral" };
    brandCache.set(clientId, fallback);
    return fallback;
  }
}

export function runTool(
  tool: ToolName,
  input: Record<string, unknown>,
  scenarioId?: DemoScenarioId,
): string {
  const placementId = String(input.placementId ?? "");
  const clientId = String(input.clientId ?? "");

  switch (tool) {
    case "get_conversion_trend":
      if (scenarioId === "healthy_spike") {
        return "Last 6h: conversions +38% vs prior window; CPA improved 12%.";
      }
      if (scenarioId === "bad_spike" || scenarioId === "zero_conv_burn") {
        return "Last 6h: conversions flat (0–1) despite spend +320%.";
      }
      return "Last 6h: conversions within normal band.";
    case "get_client_context":
      if (scenarioId === "healthy_spike") {
        return "Spring promo live until Sunday; expected traffic lift on ChatGPT placements.";
      }
      return "No launch or promo on calendar for this placement in the next 14 days.";
    case "get_historical_baseline":
      if (scenarioId === "healthy_spike") {
        return "Spend velocity 4.1× baseline but conversion rate 3.8× — within promo tolerance.";
      }
      if (scenarioId === "bad_spike") {
        return "Spend velocity 4.2× baseline; conversion rate unchanged — outside tolerance.";
      }
      return "Spend £340 in 6h with 0 conversions; baseline expects ≥8 conversions.";
    case "get_conversation_context":
      if (scenarioId === "brand_safety") {
        return 'Snippet: "…mass layoffs and job loss fears…" — ad creative: upbeat sale banner.';
      }
      return `No sensitive topics flagged near ${placementId}.`;
    case "get_brand_guidelines": {
      const brand = loadBrand(clientId);
      if (scenarioId === "brand_safety") {
        return `Tone: ${brand.tone}. Conflict: layoffs_and_job_loss in never_associate_with list.`;
      }
      return `Tone: ${brand.tone}. No guideline conflicts detected.`;
    }
    default:
      return "No data.";
  }
}
