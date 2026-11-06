/**
 * Exponential moving average parameterised by a time constant instead of a
 * fixed alpha, so the amount of smoothing stays the same when the sensor
 * delivers samples at irregular intervals (Android does not guarantee the
 * requested rate).
 *
 *   alpha = 1 - exp(-dt / tau)
 *
 * A larger tau means heavier smoothing. tau can change per sample, which is
 * how the magnetic field filter adapts to motion.
 */

/** Smoothing factor for a sample that arrived dtSeconds after the previous one. */
function emaAlpha(dtSeconds: number, tauSeconds: number): number {
  if (tauSeconds <= 0) return 1;
  if (dtSeconds <= 0) return 0;
  return 1 - Math.exp(-dtSeconds / tauSeconds);
}

class TimeConstantEma {
  private state: number | null = null;

  /** Feeds a sample and returns the smoothed value. The first sample seeds the filter. */
  update(value: number, dtSeconds: number, tauSeconds: number): number {
    if (this.state === null) {
      this.state = value;
      return value;
    }

    const alpha = emaAlpha(dtSeconds, tauSeconds);
    this.state += alpha * (value - this.state);
    return this.state;
  }

  get value(): number | null {
    return this.state;
  }

  reset(): void {
    this.state = null;
  }
}

export { emaAlpha, TimeConstantEma };
