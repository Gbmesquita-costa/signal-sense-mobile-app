/**
 * Step detector over the magnitude of linear acceleration (gravity removed,
 * m/s^2), as delivered by DeviceMotion's `acceleration` on Android.
 *
 * A step is counted when the magnitude rises above `riseThreshold` after
 * having fallen below `resetThreshold`, and at least `minIntervalMs` after
 * the previous step. The hysteresis stops one footfall from counting twice;
 * the minimum interval caps the cadence at a fast walk.
 */

interface LinearAcceleration {
  x: number;
  y: number;
  z: number;
  timestampMs: number;
}

interface StepDetectorOptions {
  riseThreshold?: number;
  resetThreshold?: number;
  minIntervalMs?: number;
}

class StepDetector {
  private armed = true;
  private lastStepMs = -Infinity;
  private count = 0;

  private readonly riseThreshold: number;
  private readonly resetThreshold: number;
  private readonly minIntervalMs: number;

  constructor(options: StepDetectorOptions = {}) {
    this.riseThreshold = options.riseThreshold ?? 1.3;
    this.resetThreshold = options.resetThreshold ?? 0.6;
    this.minIntervalMs = options.minIntervalMs ?? 300;
  }

  /** Feeds one sample; returns true when it completes a step. */
  push(sample: LinearAcceleration): boolean {
    const magnitude = Math.sqrt(
      sample.x * sample.x + sample.y * sample.y + sample.z * sample.z,
    );

    if (magnitude < this.resetThreshold) {
      this.armed = true;
      return false;
    }

    if (
      this.armed &&
      magnitude >= this.riseThreshold &&
      sample.timestampMs - this.lastStepMs >= this.minIntervalMs
    ) {
      this.armed = false;
      this.lastStepMs = sample.timestampMs;
      this.count++;
      return true;
    }

    return false;
  }

  get steps(): number {
    return this.count;
  }

  reset(): void {
    this.armed = true;
    this.lastStepMs = -Infinity;
    this.count = 0;
  }
}

export { type LinearAcceleration, StepDetector, type StepDetectorOptions };
