import { trackerDetector } from "@/services/tracker";

import { stalkerRepository } from "./stalker.repository";
import type {
  AntiStalkingConfig,
  DeviceSighting,
  StalkerAlert,
  TrackedDevice,
} from "./stalker.types";
import { DEFAULT_ANTI_STALKING_CONFIG } from "./stalker.types";

interface DetectInput {
  id: string;
  name: string | null;
  localName: string | null;
  rssi: number;
  manufacturerData: string | null;
  serviceUUIDs: string[] | null;
}

class StalkerDetectionService {
  private trackedDevices: Map<string, TrackedDevice> = new Map();
  private trustedDeviceIds: Set<string> = new Set();

  private config: AntiStalkingConfig = { ...DEFAULT_ANTI_STALKING_CONFIG };

  private alertedDeviceIds: Set<string> = new Set();
  private dismissedAt: Map<string, number> = new Map();

  /** Load trusted devices from DB at startup */
  async initialize(): Promise<void> {
    try {
      const trusted = await stalkerRepository.getTrustedDevices();
      this.trustedDeviceIds = new Set(trusted.map((d) => d.deviceId));
    } catch {
      // DB may not be ready yet — will retry on next initialize call
      this.trustedDeviceIds = new Set();
    }
  }

  /** Update config */
  setConfig(config: Partial<AntiStalkingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): AntiStalkingConfig {
    return this.config;
  }

  /**
   * Feed a discovered BLE device into the detection engine.
   * Returns a StalkerAlert if this device has just crossed the threshold.
   */
  processDevice(device: DetectInput): StalkerAlert | null {
    // Skip trusted devices
    if (this.trustedDeviceIds.has(device.id)) return null;

    // Skip devices we already alerted about — unless the user dismissed
    // that alert and the cooldown has expired, in which case we free
    // the device to be re-evaluated and possibly re-alerted.
    if (this.alertedDeviceIds.has(device.id)) {
      const dismissedAt = this.dismissedAt.get(device.id);

      if (dismissedAt === undefined) return null;
      if (Date.now() - dismissedAt < this.config.dismissCooldownMs) return null;

      this.alertedDeviceIds.delete(device.id);
      this.dismissedAt.delete(device.id);
    }

    // Check if it's a known tracker type (for metadata enrichment)
    const tracker = trackerDetector.detect({
      name: device.name,
      localName: device.localName,
      manufacturerData: device.manufacturerData,
      serviceUUIDs: device.serviceUUIDs,
    });

    const now = Date.now();
    const sighting: DeviceSighting = {
      deviceId: device.id,
      rssi: device.rssi,
      timestamp: now,
    };

    // Get or create tracked device entry
    let tracked = this.trackedDevices.get(device.id);
    if (!tracked) {
      tracked = {
        deviceId: device.id,
        deviceName: device.name ?? device.localName,
        trackerType: tracker.isTracker ? tracker.type : null,
        trackerBrand: tracker.isTracker ? tracker.brand : null,
        confidence: tracker.isTracker ? tracker.confidence : "low",
        firstSeen: now,
        lastSeen: now,
        sightings: [],
        avgRssi: device.rssi,
        isSuspicious: false,
      };

      this.trackedDevices.set(device.id, tracked);
    }

    // Add sighting
    tracked.sightings.push(sighting);

    tracked.lastSeen = now;
    tracked.deviceName = device.name ?? device.localName ?? tracked.deviceName;

    // Prune old sightings
    this.pruneSightings(tracked);

    // Recalculate average RSSI
    if (tracked.sightings.length > 0) {
      const sum = tracked.sightings.reduce((acc, s) => acc + s.rssi, 0);
      tracked.avgRssi = sum / tracked.sightings.length;
    }

    // Evaluate
    const suspicious = this.evaluateDevice(tracked);
    tracked.isSuspicious = suspicious;

    if (suspicious) {
      return this.createAlert(tracked);
    }

    return null;
  }

  /** Prune sightings outside the time window (keeps firstSeen intact) */
  private pruneSightings(tracked: TrackedDevice): void {
    const cutoff = Date.now() - this.config.timeWindowMs;
    tracked.sightings = tracked.sightings.filter((s) => s.timestamp >= cutoff);
    // firstSeen is NOT updated here — it records the absolute first encounter
    // so that evaluateDevice can correctly measure total tracking duration.
  }

  /** Evaluate whether a tracked device is suspicious */
  private evaluateDevice(tracked: TrackedDevice): boolean {
    // Use the span from absolute first sighting to now — not the pruned window.
    // The pruned sightings are only used for counting; the original firstSeen
    // (set once on first encounter) tracks how long the device has been around.
    const now = Date.now();
    const totalDuration = now - tracked.firstSeen;

    const hasSufficientDuration = totalDuration >= this.config.timeWindowMs;
    const hasSufficientSightings =
      tracked.sightings.length >= this.config.minSightings;

    const hasStrongEnoughSignal = tracked.avgRssi >= this.config.rssiThreshold;
    return (
      hasSufficientDuration && hasSufficientSightings && hasStrongEnoughSignal
    );
  }

  /** Create and persist an alert */
  private createAlert(tracked: TrackedDevice): StalkerAlert {
    const alert: StalkerAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      deviceId: tracked.deviceId,
      deviceName: tracked.deviceName,
      trackerType: tracked.trackerType,
      trackerBrand: tracked.trackerBrand,
      confidence: tracked.confidence,
      firstSeen: tracked.firstSeen,
      lastSeen: tracked.lastSeen,
      durationMs: tracked.lastSeen - tracked.firstSeen,
      sightingCount: tracked.sightings.length,
      avgRssi: tracked.avgRssi,
      createdAt: Date.now(),
      dismissed: false,
    };

    // Mark as alerted to prevent duplicates
    this.alertedDeviceIds.add(tracked.deviceId);

    // Persist asynchronously (fire-and-forget)
    stalkerRepository
      .createAlert(alert)
      .then((id) => {
        alert.id = id;
      })
      .catch(() => {});

    return alert;
  }

  /** Mark device as trusted */
  async trustDevice(
    deviceId: string,
    deviceName: string | null,
  ): Promise<void> {
    this.trustedDeviceIds.add(deviceId);
    this.trackedDevices.delete(deviceId);

    this.alertedDeviceIds.delete(deviceId);
    this.dismissedAt.delete(deviceId);

    await stalkerRepository.addTrustedDevice(deviceId, deviceName);
  }

  /**
   * Record that the user dismissed the active alert for a device.
   * After `config.dismissCooldownMs` has elapsed, if the device is still
   * around and still suspicious, a new alert will be emitted.
   */
  markDismissed(deviceId: string): void {
    this.dismissedAt.set(deviceId, Date.now());
  }

  /** Remove device from trusted list */
  async untrustDevice(deviceId: string): Promise<void> {
    this.trustedDeviceIds.delete(deviceId);
    await stalkerRepository.removeTrustedDevice(deviceId);
  }

  /** Reset tracking state */
  reset(): void {
    this.trackedDevices.clear();
    this.alertedDeviceIds.clear();

    this.dismissedAt.clear();
  }

  /** Get all currently tracked devices */
  getTrackedDevices(): TrackedDevice[] {
    return Array.from(this.trackedDevices.values());
  }

  /** Get active (non-dismissed) alerts */
  async getActiveAlerts(): Promise<StalkerAlert[]> {
    return stalkerRepository.getActiveAlerts();
  }
}

export const stalkerDetectionService = new StalkerDetectionService();
