import type { SpendEvent } from "@/types";

/** Session-scoped daily spend tallies for guardrail checks. */
export class SpendAccumulator {
  private byClient = new Map<string, number>();
  private global = 0;
  private dayKey = todayKey();

  private rollDay() {
    const key = todayKey();
    if (key !== this.dayKey) {
      this.byClient.clear();
      this.global = 0;
      this.dayKey = key;
    }
  }

  ingest(event: SpendEvent): { clientTotal: number; globalTotal: number } {
    this.rollDay();
    const amount = event.spendGbp ?? 0;
    if (amount <= 0) return { clientTotal: this.byClient.get(event.clientId) ?? 0, globalTotal: this.global };

    const clientTotal = (this.byClient.get(event.clientId) ?? 0) + amount;
    this.byClient.set(event.clientId, clientTotal);
    this.global += amount;
    return { clientTotal, globalTotal: this.global };
  }

  getClientTotal(clientId: string): number {
    this.rollDay();
    return this.byClient.get(clientId) ?? 0;
  }

  getGlobalTotal(): number {
    this.rollDay();
    return this.global;
  }

  reset(): void {
    this.byClient.clear();
    this.global = 0;
    this.dayKey = todayKey();
  }
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
