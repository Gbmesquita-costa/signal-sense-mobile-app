/**
 * Environment Service
 * Manages magnetometer readings and magnetic field interpretation
 *
 * Raw samples go through MagneticFieldFilter (outlier rejection, median,
 * motion-aware EMA) before they reach callers, so spikes and the magnitude
 * swings caused by moving the phone do not show up as jumps on screen.
 * Rejected samples produce no callback. The hysteresis in
 * interpretMagnitude, applied to the filtered magnitude, prevents status
 * flickering at threshold boundaries.
 */

import { Magnetometer, type MagnetometerMeasurement } from "expo-sensors";

import { MagneticFieldFilter } from "@/domain/sensors";

type EnvironmentStatus = "stable" | "moderate" | "high" | "extreme";
interface MagnetometerData {
  x: number;
  y: number;
  z: number;
  magnitude: number;
}

interface EnvironmentState {
  data: MagnetometerData | null;
  status: EnvironmentStatus;
  isAvailable: boolean;
}

// 20 Hz: enough for the filter (median window of 5 = 250 ms) and half the
// JS work of the previous 30 Hz raw stream.
const UPDATE_INTERVAL = 50;

type EnvironmentCallback = (state: EnvironmentState) => void;

class EnvironmentService {
  private subscription: ReturnType<typeof Magnetometer.addListener> | null =
    null;
  private callback: EnvironmentCallback | null = null;
  private currentStatus: EnvironmentStatus = "stable";
  private readonly filter = new MagneticFieldFilter();

  /**
   * Check if the magnetometer is available in the hardware
   */
  async isAvailable(): Promise<boolean> {
    try {
      return await Magnetometer.isAvailableAsync();
    } catch {
      return false;
    }
  }

  /**
   * Starts magnetic field monitoring with filtered readings.
   * Calling it again while running only replaces the callback, so there is
   * never more than one native subscription.
   */
  start(callback: EnvironmentCallback): void {
    this.callback = callback;
    if (this.subscription) return;

    this.currentStatus = "stable";
    this.filter.reset();
    Magnetometer.setUpdateInterval(UPDATE_INTERVAL);

    this.subscription = Magnetometer.addListener((data) =>
      this.handleSample(data),
    );
  }

  private handleSample(data: MagnetometerMeasurement): void {
    const filtered = this.filter.push({
      x: data.x,
      y: data.y,
      z: data.z,
      // expo-sensors reports seconds; fall back to wall clock if missing.
      timestampMs: Number.isFinite(data.timestamp)
        ? data.timestamp * 1000
        : Date.now(),
    });

    if (!filtered || filtered.rejected) return;

    const status = this.interpretMagnitude(filtered.magnitude);

    this.callback?.({
      data: {
        x: filtered.x,
        y: filtered.y,
        z: filtered.z,
        magnitude: filtered.magnitude,
      },
      status,
      isAvailable: true,
    });
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.callback = null;
  }

  /**
   * Reset state
   */
  reset(): void {
    this.currentStatus = "stable";
    this.filter.reset();
  }

  /**
   * Calculates the total magnitude of the magnetic field (µT)
   * √(x² + y² + z²)
   */
  private calculateMagnitude(x: number, y: number, z: number): number {
    return Math.sqrt(x * x + y * y + z * z);
  }

  /**
   * Interprets magnitude with hysteresis to prevent oscillation at boundaries.
   * Rising thresholds are higher than falling thresholds, creating a dead zone
   * that prevents rapid status flickering when values hover near a boundary.
   *
   * Baseline Earth: ~25-65 µT
   *
   * Thresholds:
   *   stable ↔ moderate: rise at 70, fall at 55
   *   moderate ↔ high:   rise at 150, fall at 120
   *   high ↔ extreme:    rise at 400, fall at 330
   */
  private interpretMagnitude(magnitude: number): EnvironmentStatus {
    const current = this.currentStatus;

    let next: EnvironmentStatus;

    if (current === "stable") {
      next = magnitude >= 70 ? "moderate" : "stable";
    } else if (current === "moderate") {
      if (magnitude < 55) next = "stable";
      else if (magnitude >= 150) next = "high";
      else next = "moderate";
    } else if (current === "high") {
      if (magnitude < 120) next = "moderate";
      else if (magnitude >= 400) next = "extreme";
      else next = "high";
    } else {
      // extreme
      next = magnitude < 330 ? "high" : "extreme";
    }

    this.currentStatus = next;
    return next;
  }

  /**
   * Returns the color associated with the status
   */
  getStatusColor(status: EnvironmentStatus, theme: any): string {
    switch (status) {
      case "stable":
        return theme.success || "#10B981";
      case "moderate":
        return theme.warning || "#F59E0B";
      case "high":
        return "#EF4444";
      case "extreme":
        return "#7F1D1D";
      default:
        return theme.textSecondary || "#6B7280";
    }
  }
}

const environmentService = new EnvironmentService();
export {
  environmentService,
  EnvironmentService,
  EnvironmentState,
  EnvironmentStatus,
  MagnetometerData,
};
