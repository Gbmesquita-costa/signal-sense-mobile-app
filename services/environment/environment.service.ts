/**
 * Environment Service
 * Manages magnetometer readings and magnetic field interpretation
 *
 * No software smoothing — the raw magnitude is passed directly.
 * Visual smoothing is handled by Reanimated's withSpring on the UI thread.
 * The hysteresis in interpretMagnitude prevents status flickering.
 */

import { Magnetometer } from "expo-sensors";

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

const UPDATE_INTERVAL = 33; // ~30 FPS

class EnvironmentService {
  private subscription: any = null;
  private currentStatus: EnvironmentStatus = "stable";

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
   * Starts magnetic field monitoring
   * Raw values — Reanimated handles visual smoothing via withSpring
   */
  start(callback: (state: EnvironmentState) => void): void {
    if (this.subscription) return;

    this.currentStatus = "stable";

    Magnetometer.setUpdateInterval(UPDATE_INTERVAL);

    this.subscription = Magnetometer.addListener((data) => {
      const magnitude = this.calculateMagnitude(data.x, data.y, data.z);
      const status = this.interpretMagnitude(magnitude);

      callback({
        data: {
          x: data.x,
          y: data.y,
          z: data.z,
          magnitude,
        },
        status,
        isAvailable: true,
      });
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
  }

  /**
   * Reset state
   */
  reset(): void {
    this.currentStatus = "stable";
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
