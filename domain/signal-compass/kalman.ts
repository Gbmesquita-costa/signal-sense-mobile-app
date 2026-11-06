/**
 * One-dimensional Kalman filter for RSSI (dBm).
 *
 * The signal is modelled as a random walk: its variance grows by
 * processNoisePerSecond for every second between readings, so a reading
 * that arrives after a long gap (Wi-Fi scans can be 30 s apart under
 * Android throttling) is trusted more than one that arrives 100 ms after
 * the previous BLE advertisement.
 */

interface RssiKalmanOptions {
  /** Variance (dB^2) the true signal may drift per second. */
  processNoisePerSecond?: number;
  /** Variance (dB^2) of a single reading. */
  measurementNoise?: number;
}

class RssiKalmanFilter {
  private estimate: number | null = null;
  private variance = 0;
  private lastTimestampMs = 0;

  private readonly processNoisePerSecond: number;
  private readonly measurementNoise: number;

  constructor(options: RssiKalmanOptions = {}) {
    this.processNoisePerSecond = options.processNoisePerSecond ?? 2;
    this.measurementNoise = options.measurementNoise ?? 16;
  }

  /** Feeds one reading and returns the filtered RSSI. */
  update(rssi: number, timestampMs: number): number {
    if (this.estimate === null) {
      this.estimate = rssi;
      this.variance = this.measurementNoise;
      this.lastTimestampMs = timestampMs;
      return rssi;
    }

    const dtSeconds = Math.max(0, (timestampMs - this.lastTimestampMs) / 1000);
    this.lastTimestampMs = timestampMs;

    // Predict: the signal may have drifted since the last reading.
    this.variance += this.processNoisePerSecond * dtSeconds;

    // Correct.
    const gain = this.variance / (this.variance + this.measurementNoise);
    this.estimate += gain * (rssi - this.estimate);
    this.variance *= 1 - gain;

    return this.estimate;
  }

  get value(): number | null {
    return this.estimate;
  }

  reset(): void {
    this.estimate = null;
    this.variance = 0;
    this.lastTimestampMs = 0;
  }
}

export { RssiKalmanFilter, type RssiKalmanOptions };
