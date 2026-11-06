/**
 * Sliding-window budget for WifiManager.startScan().
 *
 * Android 9+ lets a foreground app start 4 scans per 2-minute window; extra
 * requests are rejected and only return cached results. Tracking the budget
 * in the app avoids wasting requests the system would refuse anyway, and
 * the minimum gap spreads the allowed scans out instead of spending all
 * four in the first seconds.
 */

interface ScanBudgetOptions {
  maxScans?: number;
  windowMs?: number;
  minGapMs?: number;
}

class ScanBudget {
  private readonly requests: number[] = [];

  private readonly maxScans: number;
  private readonly windowMs: number;
  private readonly minGapMs: number;

  constructor(options: ScanBudgetOptions = {}) {
    this.maxScans = options.maxScans ?? 4;
    this.windowMs = options.windowMs ?? 120_000;
    this.minGapMs = options.minGapMs ?? 15_000;
  }

  /** True when a fresh scan may be requested at `nowMs`. */
  canScan(nowMs: number): boolean {
    this.prune(nowMs);

    const last = this.requests[this.requests.length - 1];
    if (last !== undefined && nowMs - last < this.minGapMs) return false;

    return this.requests.length < this.maxScans;
  }

  /** Records a request (call it whether or not the system accepted it). */
  record(nowMs: number): void {
    this.requests.push(nowMs);
  }

  /** Milliseconds until canScan() would return true. */
  waitMs(nowMs: number): number {
    if (this.canScan(nowMs)) return 0;

    const last = this.requests[this.requests.length - 1] ?? nowMs;
    const gapWait = this.minGapMs - (nowMs - last);
    const windowWait =
      this.requests.length >= this.maxScans
        ? this.requests[0] + this.windowMs - nowMs
        : 0;

    return Math.max(0, gapWait, windowWait);
  }

  private prune(nowMs: number): void {
    while (
      this.requests.length > 0 &&
      nowMs - this.requests[0] >= this.windowMs
    ) {
      this.requests.shift();
    }
  }
}

export { ScanBudget, type ScanBudgetOptions };
