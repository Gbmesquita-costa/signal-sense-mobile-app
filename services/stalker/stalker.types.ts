import type { TrackerBrand, TrackerType } from "@/services/tracker";

/** A single sighting of a device in anti-stalking mode */
interface DeviceSighting {
  deviceId: string;
  rssi: number;
  timestamp: number;
}

/** Aggregated tracking state for a single device across a time window */
interface TrackedDevice {
  deviceId: string;
  deviceName: string | null;
  trackerType: TrackerType | null;
  trackerBrand: TrackerBrand | null;
  confidence: "high" | "medium" | "low";
  firstSeen: number;
  lastSeen: number;
  sightings: DeviceSighting[];
  avgRssi: number;
  isSuspicious: boolean;
}

/** An alert generated when a device is deemed suspicious */
interface StalkerAlert {
  id: string;
  deviceId: string;
  deviceName: string | null;
  trackerType: TrackerType | null;
  trackerBrand: TrackerBrand | null;
  confidence: "high" | "medium" | "low";
  firstSeen: number;
  lastSeen: number;
  durationMs: number;
  sightingCount: number;
  avgRssi: number;
  createdAt: number;
  dismissed: boolean;
}

/** A device the user has marked as trusted (ignore in detection) */
interface TrustedDevice {
  id: string;
  deviceId: string;
  deviceName: string | null;
  addedAt: number;
}

/** Anti-stalking configuration */
interface AntiStalkingConfig {
  enabled: boolean;
  timeWindowMs: number;
  minSightings: number;
  rssiThreshold: number;
  scanIntervalMs: number;
  scanDurationMs: number;
  dismissCooldownMs: number;
}

const PROD_ANTI_STALKING_CONFIG = {
  timeWindowMs: 15 * 60 * 1000,
  minSightings: 5,
  dismissCooldownMs: 30 * 60 * 1000,
};

const DEV_ANTI_STALKING_CONFIG = {
  timeWindowMs: 1 * 60 * 1000,
  minSightings: 2,
  dismissCooldownMs: 1 * 60 * 1000,
};

const DEFAULT_ANTI_STALKING_CONFIG: AntiStalkingConfig = {
  enabled: false,
  ...(__DEV__ ? DEV_ANTI_STALKING_CONFIG : PROD_ANTI_STALKING_CONFIG),
  rssiThreshold: -85,
  scanIntervalMs: 30_000,
  scanDurationMs: 8_000,
};

type AntiStalkingState = "off" | "starting" | "monitoring" | "error";

export {
  AntiStalkingConfig,
  AntiStalkingState,
  DEFAULT_ANTI_STALKING_CONFIG,
  DeviceSighting,
  StalkerAlert,
  TrackedDevice,
  TrustedDevice,
};
