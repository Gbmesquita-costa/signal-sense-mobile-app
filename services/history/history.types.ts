interface HistorySession {
  id: string;
  startedAt: number;
  finishedAt: number | null;
  durationMs: number;
  deviceCount: number;
}

interface DeviceProfile {
  id: string;
  rawBleId: string;
  customName: string | null;
  deviceName: string | null;
  firstSeenEver: number;
  lastSeenEver: number;
  appearanceCount: number;
  isTracker: boolean;
  trackerType: string | null;
  manufacturerData: string | null;
  serviceUuids: string[];
}

interface SessionDevice {
  id: string;
  sessionId: string;
  deviceId: string;
  rssiMin: number | null;
  rssiMax: number | null;
  rssiAvg: number | null;
  firstSeen: number;
  lastSeen: number;
  // Joined fields
  deviceName?: string | null;
  customName?: string | null;
  isTracker?: boolean;
  trackerType?: string | null;
}

interface CreateSessionInput {
  id: string;
  startedAt: number;
  finishedAt: number | null;
  durationMs: number;
  deviceCount: number;
}

interface UpsertDeviceInput {
  id: string;
  rawBleId: string;
  deviceName: string | null;
  firstSeen: number;
  lastSeen: number;
  isTracker: boolean;
  trackerType: string | null;
  manufacturerData: string | null;
  serviceUuids: string[];
}

interface RssiStats {
  min: number;
  max: number;
  avg: number;
  firstSeen: number;
  lastSeen: number;
}

interface ProximitySample {
  timestamp: number;
  rssi: number;
  smoothedRssi: number;
  distance: number | null;
}

interface DeviceSessionAppearance {
  sessionId: string;
  startedAt: number;
  durationMs: number;
  deviceCount: number;
  rssiMin: number | null;
  rssiMax: number | null;
  rssiAvg: number | null;
}

interface EnvironmentSample {
  timestamp: number;
  x: number;
  y: number;
  z: number;
  magnitude: number;
  status: string;
}

interface WifiSample {
  timestamp: number;
  ssid: string | null;
  strength: number | null;
  band: string | null;
  frequency: number | null;
}

type SessionType = "scan" | "proximity" | "environment" | "wifi";

interface UnifiedSession {
  id: string;
  type: SessionType;
  startedAt: number;
  finishedAt: number | null;
  durationMs: number;
  // Scan-specific
  deviceCount?: number;
  // Proximity-specific
  deviceId?: string;
  // Wi-Fi-specific
  ssid?: string;
}

export {
  CreateSessionInput,
  DeviceProfile,
  DeviceSessionAppearance,
  EnvironmentSample,
  HistorySession,
  ProximitySample,
  RssiStats,
  SessionDevice,
  SessionType,
  UnifiedSession,
  UpsertDeviceInput,
  WifiSample,
};
