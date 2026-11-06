/**
 * Hampel-style outlier gate for a scalar signal.
 *
 * A sample is rejected when it deviates from the median of the recently
 * accepted samples by more than `threshold` robust standard deviations
 * (1.4826 * MAD). Two guards keep the gate from misbehaving:
 *
 * - `minDeviation`: when the signal is very steady the MAD collapses towards
 *   zero and ordinary noise would be rejected; deviations below this floor
 *   are always accepted.
 * - `maxConsecutiveRejections`: a real, sustained change (bringing a magnet
 *   close) looks like an outlier at first. After this many rejections in a
 *   row the gate accepts the new level and re-seeds its history from it.
 */

import { medianAbsoluteDeviation, RollingWindow } from "./median";

interface OutlierGateOptions {
  /** Number of accepted samples used as reference. */
  windowSize: number;
  /** Samples needed before the gate starts rejecting anything. */
  minSamples: number;
  /** Allowed deviation in robust standard deviations. */
  threshold: number;
  /** Deviations smaller than this (signal units) are always accepted. */
  minDeviation: number;
  /** Consecutive rejections after which the new level is accepted. */
  maxConsecutiveRejections: number;
}

const MAD_TO_SIGMA = 1.4826;

const DEFAULT_OUTLIER_OPTIONS: OutlierGateOptions = {
  windowSize: 9,
  minSamples: 5,
  threshold: 3.5,
  minDeviation: 8,
  maxConsecutiveRejections: 4,
};

class OutlierGate {
  private readonly options: OutlierGateOptions;
  private readonly history: RollingWindow;
  private consecutiveRejections = 0;

  constructor(options: Partial<OutlierGateOptions> = {}) {
    this.options = { ...DEFAULT_OUTLIER_OPTIONS, ...options };
    this.history = new RollingWindow(this.options.windowSize);
  }

  /** Returns true when the sample should be used, false when it is an outlier. */
  accept(value: number): boolean {
    if (!Number.isFinite(value)) return false;

    const { minSamples, threshold, minDeviation, maxConsecutiveRejections } =
      this.options;

    if (this.history.length < minSamples) {
      this.history.push(value);
      return true;
    }

    const center = this.history.median();
    const sigma =
      MAD_TO_SIGMA * medianAbsoluteDeviation(this.history.toArray(), center);
    const limit = Math.max(threshold * sigma, minDeviation);

    if (Math.abs(value - center) <= limit) {
      this.consecutiveRejections = 0;
      this.history.push(value);
      return true;
    }

    this.consecutiveRejections += 1;
    if (this.consecutiveRejections > maxConsecutiveRejections) {
      // Sustained change: adopt the new level instead of fighting it.
      this.consecutiveRejections = 0;
      this.history.clear();
      this.history.push(value);
      return true;
    }

    return false;
  }

  reset(): void {
    this.history.clear();
    this.consecutiveRejections = 0;
  }
}

export { DEFAULT_OUTLIER_OPTIONS, OutlierGate, OutlierGateOptions };
