/**
 * RSSI converter for proximity and distance levels
 *
 * - Automatic TX Power calibration
 * - Dynamic environment compensation
 */

import type { ProximityConfig, ProximityLevel } from "./proximity.types";

/**
 * Automatically calibrates TX Power based on history.
 * Uses median instead of mean for robustness against outliers.
 */
let cachedTxPower: number | null = null;
let samplesSinceCal = 0;
const CAL_INTERVAL = 30; // Recalibrate every 30 new samples (not every update)

function calibrateTxPower(
  rssiHistory: number[],
  knownDistance: number = 1.0,
): number {
  if (rssiHistory.length < 10) {
    return cachedTxPower ?? -59;
  }

  samplesSinceCal++;
  if (cachedTxPower !== null && samplesSinceCal < CAL_INTERVAL) {
    return cachedTxPower;
  }
  samplesSinceCal = 0;

  // Use median for robustness
  const sorted = [...rssiHistory].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const medianRssi =
    sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];

  const environmentFactor = 3.0;
  const calibratedTxPower =
    medianRssi + 10 * environmentFactor * Math.log10(knownDistance);

  cachedTxPower = Math.max(-70, Math.min(-50, calibratedTxPower));
  return cachedTxPower;
}

/**
 * Converts RSSI to proximity level
 */
function rssiToLevel(
  rssi: number,
  thresholds: ProximityConfig["rssiThresholds"],
): ProximityLevel {
  if (rssi >= thresholds.near) {
    return "near";
  }

  if (rssi >= thresholds.medium) {
    return "medium";
  }

  return "far";
}

/**
 * Converts RSSI to estimated distance (in meters)
 *
 * Uses the signal propagation formula:
 * distance = 10 ^ ((txPower - rssi) / (10 * n))
 *
 * With automatic TX Power calibration and dynamic environment compensation.
 *
 * IMPORTANT: Even with improvements, this is an estimate!
 *
 * @param rssi - Already-smoothed RSSI value in dBm
 * @param txPower - TX Power in dBm (typical: -59)
 * @param environmentFactor - Propagation factor (2.0-4.0)
 * @param rssiHistory - RSSI history (for TX Power calibration)
 * @returns Estimated distance in meters
 */
// Smoothed distance output — prevents jitter in displayed value
let smoothedDistance = 0;
const DISTANCE_EMA_ALPHA = 0.2; // Very smooth — 20% new, 80% previous

// Environment factor with hysteresis — prevents bracket-jumping oscillation
let currentEnvFactor = 3.0;

function rssiToDistance(
  rssi: number,
  txPower: number,
  environmentFactor: number,
  _deviceId?: string,
  rssiHistory?: number[],
): number {
  if (rssi === 0 || rssi > 0) {
    return -1.0;
  }

  // 1. TX Power calibration (now cached, recalibrates every 30 samples)
  let calibratedTxPower = txPower;

  if (rssiHistory && rssiHistory.length >= 10) {
    calibratedTxPower = calibrateTxPower(rssiHistory);
  }

  // 2. Environment factor with hysteresis (smooth transitions, no bracket jumps)
  const roughDistance = Math.pow(
    10,
    (calibratedTxPower - rssi) / (10 * currentEnvFactor),
  );

  let targetFactor = environmentFactor;
  if (roughDistance < 1.5) {
    targetFactor = Math.max(2.0, environmentFactor - 0.5);
  } else if (roughDistance > 12) {
    targetFactor = Math.min(4.0, environmentFactor + 0.5);
  }
  // Smooth transition instead of instant jump
  currentEnvFactor = 0.95 * currentEnvFactor + 0.05 * targetFactor;

  // 3. Calculate raw distance
  const ratio = (calibratedTxPower - rssi) / (10 * currentEnvFactor);
  let distance = Math.pow(10, ratio);

  // 4. Non-linear correction for short distances
  if (distance < 1) {
    distance = distance * 0.9;
  }

  // 5. Limit to 100 meters
  distance = Math.max(0, Math.min(distance, 100));

  // 6. Smooth the final distance output (EMA)
  if (smoothedDistance === 0) {
    smoothedDistance = distance;
  } else {
    smoothedDistance =
      DISTANCE_EMA_ALPHA * distance +
      (1 - DISTANCE_EMA_ALPHA) * smoothedDistance;
  }

  return smoothedDistance;
}

/**
 * Clears state cache for a device
 */
function clearKalmanState(_deviceId: string): void {
  // Reset cached state for fresh monitoring sessions
  cachedTxPower = null;
  samplesSinceCal = 0;
  smoothedDistance = 0;
  currentEnvFactor = 3.0;
}

/**
 * Obtains color associated with proximity level
 */
function getLevelColor(level: ProximityLevel): string {
  switch (level) {
    case "near":
      return "#10B981"; // Green
    case "medium":
      return "#F59E0B"; // Yellow/Orange
    case "far":
      return "#EF4444"; // Red
    case "unknown":
      return "#6B7280"; // Gray
  }
}

/**
 * Format distance for display (no translation - numbers only)
 */
function formatDistance(distance: number | null): string {
  if (distance === null || distance < 0) {
    return "—";
  }

  if (distance < 1) {
    return `${(distance * 100).toFixed(0)} cm`;
  }

  if (distance < 10) {
    return `${distance.toFixed(1)} m`;
  }

  return `${distance.toFixed(0)} m`;
}

/**
 * RSSI format for display
 */
function formatRssi(rssi: number): string {
  return `${rssi} dBm`;
}

export {
  clearKalmanState,
  formatDistance,
  formatRssi,
  getLevelColor,
  rssiToDistance,
  rssiToLevel,
};
