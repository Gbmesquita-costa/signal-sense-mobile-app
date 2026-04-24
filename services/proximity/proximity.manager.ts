import { bleManager } from "@/services/scan";

import type {
  ProximityCallbacks,
  ProximityConfig,
  ProximityData,
  ProximityLevel,
} from "./proximity.types";

import {
  clearKalmanState,
  rssiToDistance,
  rssiToLevel,
} from "./rssi.converter";

class ProximityManager {
  private cleanDeviceId: string | null = null;

  private config: ProximityConfig;
  private callbacks: ProximityCallbacks;

  private isMonitoring = false;

  private rssiHistory: number[] = [];
  private currentLevel: ProximityLevel = "unknown";

  private smoothedRssi = 0;
  private startedBleScan = false;

  // Signal loss watchdog
  private signalLostTimerId: ReturnType<typeof setTimeout> | null = null;

  // UI throttling
  private lastEmitTime = 0;

  constructor(config: ProximityConfig, callbacks: ProximityCallbacks = {}) {
    this.config = config;
    this.callbacks = callbacks;
  }

  // ===============================
  // PUBLIC API
  // ===============================
  async startMonitoring(deviceId: string): Promise<void> {
    this.stopMonitoring();
    this.cleanDeviceId = deviceId.replace(/^ble_/, "");

    this.isMonitoring = true;
    this.rssiHistory = [];
    this.smoothedRssi = 0;
    this.currentLevel = "unknown";

    this.startBleMonitoring();
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    // Clear signal loss watchdog
    this.clearSignalLostTimer();
    this.lastEmitTime = 0;

    if (this.startedBleScan) {
      bleManager.stopScan();
      this.startedBleScan = false;
    }

    if (this.cleanDeviceId) {
      clearKalmanState(this.cleanDeviceId);
    }

    this.cleanDeviceId = null;
    this.rssiHistory = [];
    this.smoothedRssi = 0;
    this.currentLevel = "unknown";
  }

  updateConfig(newConfig: Partial<ProximityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getState() {
    return {
      isRttActive: false,
    };
  }

  // ===============================
  // BLE
  // ===============================
  private async startBleMonitoring() {
    try {
      const bleState = await bleManager.getState();
      if (bleState !== "powered-on") return;

      bleManager
        .startScan(
          {
            bleAllowDuplicates: true,
            bleScanDuration: 0,
          },
          {
            onDeviceUpdated: (device) => {
              if (device.id === this.cleanDeviceId) {
                this.handleRssiUpdate(device.rssi.raw);
              }
            },
            onDeviceFound: (device) => {
              if (device.id === this.cleanDeviceId) {
                this.handleRssiUpdate(device.rssi.raw);
              }
            },
          },
        )
        .then(() => {
          this.startedBleScan = true;
        })
        .catch((err) => {
          console.warn("Erro ao iniciar scan BLE:", err);
        });
    } catch (e) {
      console.warn("Erro BLE proximity:", e);
    }
  }

  // ===============================
  // SIGNAL LOSS WATCHDOG
  // ===============================
  private resetSignalLostTimer() {
    if (this.signalLostTimerId) {
      clearTimeout(this.signalLostTimerId);
    }

    this.signalLostTimerId = setTimeout(() => {
      if (!this.isMonitoring) return;

      this.currentLevel = "unknown";
      this.callbacks.onSignalLost?.();
    }, this.config.signalLostTimeout);
  }

  private clearSignalLostTimer() {
    if (this.signalLostTimerId) {
      clearTimeout(this.signalLostTimerId);
      this.signalLostTimerId = null;
    }
  }

  // ===============================
  // PROCESSING (real-time, same pattern as EnvironmentService)
  // ===============================
  private static readonly EMA_ALPHA = 0.3; // 30% new value, 70% previous — stable

  private handleRssiUpdate(rawRssi: number) {
    if (!this.isMonitoring || !this.cleanDeviceId) return;

    // Reset signal loss watchdog (we're receiving data)
    this.resetSignalLostTimer();

    // Light EMA smoothing (same approach as environment module)
    if (this.smoothedRssi === 0) {
      this.smoothedRssi = rawRssi;
    } else {
      this.smoothedRssi =
        ProximityManager.EMA_ALPHA * rawRssi +
        (1 - ProximityManager.EMA_ALPHA) * this.smoothedRssi;
    }

    // Keep raw history for distance TX Power calibration only
    this.rssiHistory.push(rawRssi);
    if (this.rssiHistory.length > 30) {
      this.rssiHistory.shift();
    }

    const level = rssiToLevel(this.smoothedRssi, this.config.rssiThresholds);

    const distance = rssiToDistance(
      this.smoothedRssi,
      this.config.txPower,
      this.config.environmentFactor,
      this.cleanDeviceId,
      this.rssiHistory,
    );

    // Lightweight throttle — bypass on level change for instant feedback
    const now = Date.now();
    const levelChanged = level !== this.currentLevel;

    if (!levelChanged && now - this.lastEmitTime < this.config.updateInterval) {
      return;
    }
    this.lastEmitTime = now;

    this.emitUpdate({
      level,
      rssi: rawRssi,
      smoothedRssi: this.smoothedRssi,
      distance: distance >= 0 ? distance : null,
    });
  }

  private emitUpdate(data: {
    level: ProximityLevel;
    rssi: number;
    smoothedRssi: number;
    distance: number | null;
  }) {
    const proximityData: ProximityData = {
      ...data,
      lastUpdate: Date.now(),
    };

    this.callbacks.onProximityChange?.(proximityData);

    if (data.level !== this.currentLevel) {
      const previous = this.currentLevel;
      this.currentLevel = data.level;

      this.callbacks.onLevelChange?.(data.level);

      if (previous === "unknown" && data.level !== "unknown") {
        this.callbacks.onSignalRestored?.();
      }
    }
  }
}

export { ProximityManager };
