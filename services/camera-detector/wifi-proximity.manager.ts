/**
 * WifiProximityManager
 *
 * Type A "hunt" engine. Mirrors services/proximity/proximity.manager.ts, but
 * instead of a continuous BLE callback the data source is a periodic Wi-Fi
 * scan (wifiService.scanNearbyNetworks) filtered by a target BSSID.
 *
 * Reuses the generic path-loss math in services/proximity/rssi.converter.ts —
 * RSSI is dBm whether it comes from BLE or Wi-Fi.
 *
 * Honest constraint: Android throttles Wi-Fi scans (~4 per 2 min), so readings
 * refresh roughly every few seconds, not in real time. The UI communicates this.
 */

import {
  clearKalmanState,
  rssiToDistance,
  rssiToLevel,
} from "@/services/proximity/rssi.converter";
import { wifiService } from "@/services/wifi/wifi.service";

import type { HuntData, WifiProximityConfig } from "./camera.types";

interface WifiProximityCallbacks {
  onUpdate?: (data: HuntData) => void;
  onLevelChange?: (level: HuntData["level"]) => void;
  onSignalLost?: () => void;
  onSignalRestored?: () => void;
}

/** Map an RSSI (dBm) to a 0-100 strength for the radar/bar UI. */
function rssiToStrength(rssi: number): number {
  // -90 dBm → 0, -30 dBm → 100
  const pct = ((rssi + 90) / 60) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

const EMA_ALPHA = 0.3; // 30% new value, 70% previous — stable but responsive

class WifiProximityManager {
  private config: WifiProximityConfig;
  private callbacks: WifiProximityCallbacks;

  private targetBssid: string | null = null;
  private isMonitoring = false;

  private smoothedRssi = 0;

  private rssiHistory: number[] = [];
  private currentLevel: HuntData["level"] = "unknown";

  private scanTimer: ReturnType<typeof setInterval> | null = null;
  private signalLostTimer: ReturnType<typeof setTimeout> | null = null;

  private scanning = false;

  constructor(
    config: WifiProximityConfig,
    callbacks: WifiProximityCallbacks = {},
  ) {
    this.config = config;
    this.callbacks = callbacks;
  }

  async startMonitoring(bssid: string): Promise<void> {
    this.stopMonitoring();

    this.targetBssid = bssid.toUpperCase();
    this.isMonitoring = true;

    this.smoothedRssi = 0;
    this.rssiHistory = [];
    this.currentLevel = "unknown";
    clearKalmanState(this.targetBssid);

    // Immediate first read, then poll.
    void this.pollOnce();
    this.scanTimer = setInterval(() => {
      void this.pollOnce();
    }, this.config.scanInterval);
  }

  stopMonitoring(): void {
    this.isMonitoring = false;

    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }

    this.clearSignalLostTimer();

    if (this.targetBssid) clearKalmanState(this.targetBssid);
    this.targetBssid = null;

    this.smoothedRssi = 0;
    this.rssiHistory = [];

    this.currentLevel = "unknown";
  }

  private async pollOnce(): Promise<void> {
    if (!this.isMonitoring || !this.targetBssid || this.scanning) return;

    this.scanning = true;
    try {
      const networks = await wifiService.scanNearbyNetworks();
      if (!this.isMonitoring) return;

      const match = networks.find(
        (n) => n.bssid.toUpperCase() === this.targetBssid,
      );

      if (match) {
        this.handleRssiUpdate(match.rssi);
      }

      // If not found this cycle, we simply wait — the watchdog handles a
      // sustained loss. A single missed scan is normal with throttling.
    } catch {
      // Non-critical; keep polling.
    } finally {
      this.scanning = false;
    }
  }

  private handleRssiUpdate(rawRssi: number): void {
    if (!this.isMonitoring) return;

    this.resetSignalLostTimer();

    if (this.smoothedRssi === 0) {
      this.smoothedRssi = rawRssi;
    } else {
      this.smoothedRssi =
        EMA_ALPHA * rawRssi + (1 - EMA_ALPHA) * this.smoothedRssi;
    }

    this.rssiHistory.push(rawRssi);
    if (this.rssiHistory.length > 30) this.rssiHistory.shift();

    const level = rssiToLevel(this.smoothedRssi, this.config.rssiThresholds);
    const distance = rssiToDistance(
      this.smoothedRssi,
      this.config.txPower,
      this.config.environmentFactor,
      this.targetBssid ?? undefined,
      this.rssiHistory,
    );

    this.callbacks.onUpdate?.({
      level,
      rssi: rawRssi,
      smoothedRssi: this.smoothedRssi,
      strength: rssiToStrength(this.smoothedRssi),
      distance: distance >= 0 ? distance : null,
      lastUpdate: Date.now(),
    });

    if (level !== this.currentLevel) {
      const previous = this.currentLevel;

      this.currentLevel = level;
      this.callbacks.onLevelChange?.(level);

      if (previous === "unknown" && level !== "unknown") {
        this.callbacks.onSignalRestored?.();
      }
    }
  }

  private resetSignalLostTimer(): void {
    this.clearSignalLostTimer();

    this.signalLostTimer = setTimeout(() => {
      if (!this.isMonitoring) return;

      this.currentLevel = "unknown";
      this.callbacks.onSignalLost?.();
    }, this.config.signalLostTimeout);
  }

  private clearSignalLostTimer(): void {
    if (this.signalLostTimer) {
      clearTimeout(this.signalLostTimer);
      this.signalLostTimer = null;
    }
  }
}

export { WifiProximityManager, rssiToStrength };
