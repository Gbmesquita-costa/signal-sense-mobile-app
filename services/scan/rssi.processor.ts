/**
 * RSSI Processor
 * Responsible for smoothing RSSI values ​​and classifying intensity
 *
 * RSSI (Received Signal Strength Indicator):
 * - Typical values: -100 dBm (very weak) to -30 dBm (very strong)
 * - Values ​​closer to 0 = stronger signal
 * - Values ​​vary greatly due to interference and movement
 */

import type { RssiData, ScanConfig, SignalStrength } from "./scan.types";

class RssiProcessor {
  private historySize: number;
  private smoothingWindow: number;

  private thresholds: { strong: number; medium: number };

  constructor(config: Partial<ScanConfig> = {}) {
    this.historySize = config.rssiHistorySize ?? 10;
    this.smoothingWindow = config.rssiSmoothingWindow ?? 5;

    this.thresholds = config.rssiThresholds ?? { strong: -50, medium: -70 };
  }

  /**
   * Update configuration at runtime
   */
  updateConfig(config: Partial<ScanConfig>): void {
    if (config.rssiHistorySize !== undefined) {
      this.historySize = config.rssiHistorySize;
    }

    if (config.rssiSmoothingWindow !== undefined) {
      this.smoothingWindow = config.rssiSmoothingWindow;
    }

    if (config.rssiThresholds !== undefined) {
      this.thresholds = config.rssiThresholds;
    }
  }

  /**
   * Creates initial RSSI data for a new device
   */
  createInitial(rawRssi: number): RssiData {
    return {
      raw: rawRssi,
      smoothed: rawRssi,
      strength: this.classifyStrength(rawRssi),
      history: [rawRssi],
      lastUpdated: Date.now(),
    };
  }

  /**
   * Update RSSI data with new value.
   * It keeps historical data and calculates moving averages
   */
  update(current: RssiData, newRaw: number): RssiData {
    // Add to history
    const newHistory = [...current.history, newRaw];

    // It retains only the last N values
    if (newHistory.length > this.historySize) {
      newHistory.shift();
    }

    // Calculates the moving average using the last N values ​​from the window
    const smoothed = this.calculateMovingAverage(newHistory);

    return {
      raw: newRaw,
      smoothed,
      strength: this.classifyStrength(smoothed),
      history: newHistory,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Calculates exponential moving average (EMA)
   * More responsive to recent changes than a simple moving average
   */
  private calculateMovingAverage(history: number[]): number {
    if (history.length === 0) return 0;
    if (history.length === 1) return history[0];

    // Use the last N values ​​from the smoothing window
    const windowValues = history.slice(-this.smoothingWindow);

    // Exponential moving average
    // Higher alpha = more weight given to recent values
    const alpha = 2 / (windowValues.length + 1);

    let ema = windowValues[0];
    for (let i = 1; i < windowValues.length; i++) {
      ema = alpha * windowValues[i] + (1 - alpha) * ema;
    }

    return Math.round(ema);
  }

  /**
   * Classifies signal intensity based on thresholds.
   */
  classifyStrength(rssi: number): SignalStrength {
    if (rssi >= this.thresholds.strong) {
      return "strong";
    }

    if (rssi >= this.thresholds.medium) {
      return "medium";
    }

    return "weak";
  }

  /**
   * Calculates signal quality percentage (0-100)
   * Useful for progress bars and visualizations
   */
  toPercentage(rssi: number): number {
    // Typical RSSI: -100 (0%) to -30 (100%)
    const min = -100;
    const max = -30;

    const clamped = Math.max(min, Math.min(max, rssi));
    return Math.round(((clamped - min) / (max - min)) * 100);
  }

  /**
   * Calculates approximate distance based on RSSI
   * VERY approximate - use with caution
   *
   * Formula: d = 10^((TxPower - RSSI) / (10 * n))
   * - TxPower: transmission power at 1 meter (~-59 dBm typical)
   * - n: propagation constant (2-4, depends on the environment)
   */
  estimateDistance(rssi: number, txPower: number = -59, n: number = 2): number {
    if (rssi === 0) return -1; // Unknown

    const ratio = (txPower - rssi) / (10 * n);
    const distance = Math.pow(10, ratio);

    return Math.round(distance * 10) / 10; // 1 decimal place
  }

  /**
   * Checks if the signal is stable
   * (low variation in recent history)
   */
  isStable(rssiData: RssiData, maxVariation: number = 10): boolean {
    if (rssiData.history.length < 3) return false;

    const recent = rssiData.history.slice(-5);
    const min = Math.min(...recent);

    const max = Math.max(...recent);
    return max - min <= maxVariation;
  }

  /**
   * Calculates the trend of the signal
   * Positive = improving, Negative = worsening
   */
  getTrend(rssiData: RssiData): "improving" | "stable" | "degrading" {
    if (rssiData.history.length < 3) return "stable";

    const recent = rssiData.history.slice(-5);
    const older = recent.slice(0, Math.floor(recent.length / 2));

    const newer = recent.slice(Math.floor(recent.length / 2));

    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    const newerAvg = newer.reduce((a, b) => a + b, 0) / newer.length;

    const diff = newerAvg - olderAvg;

    if (diff > 3) return "improving";
    if (diff < -3) return "degrading";

    return "stable";
  }
}

// Singleton instance for global use
const rssiProcessor = new RssiProcessor();
export { RssiProcessor, rssiProcessor };
