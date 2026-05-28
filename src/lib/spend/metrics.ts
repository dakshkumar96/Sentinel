/** Pure spend metrics — shared by client UI and server ingest. */

export const HOURLY_BUCKETS = 12;

export function emptyHourlyBuckets(): number[] {
  return Array.from({ length: HOURLY_BUCKETS }, () => 0);
}

/** Map timestamp to bucket index (rolling last N hours). */
export function hourBucketIndex(ts: string, bucketCount = HOURLY_BUCKETS): number {
  const hour = new Date(ts).getHours();
  return hour % bucketCount;
}

export function pushSpendToBuckets(
  buckets: number[],
  ts: string,
  amount: number,
): number[] {
  const next = [...buckets];
  const i = hourBucketIndex(ts, buckets.length);
  next[i] = (next[i] ?? 0) + amount;
  return next;
}

export function bucketMean(buckets: number[]): number {
  if (buckets.length === 0) return 0;
  return buckets.reduce((a, b) => a + b, 0) / buckets.length;
}

/** Peak bucket exceeds rolling mean × multiplier → visual spike. */
export function isOutOfBand(buckets: number[], multiplier = 2.5): boolean {
  const mean = bucketMean(buckets);
  if (mean <= 0) return false;
  const peak = Math.max(...buckets);
  return peak > mean * multiplier && peak > 5;
}

/** £/hr from recent window (demo: last bucket as hourly proxy). */
export function spendVelocityGbpPerHr(
  buckets: number[],
  recentMinutes = 60,
): number {
  const idx = hourBucketIndex(new Date().toISOString(), buckets.length);
  const recent = buckets[idx] ?? 0;
  return recentMinutes >= 60 ? recent : (recent / recentMinutes) * 60;
}

export type HealthTone = "calm" | "elevated" | "critical";

export function healthTone(
  buckets: number[],
  status: "active" | "paused" | "learning",
): HealthTone {
  if (status === "paused") return "critical";
  if (isOutOfBand(buckets)) return "elevated";
  return "calm";
}
