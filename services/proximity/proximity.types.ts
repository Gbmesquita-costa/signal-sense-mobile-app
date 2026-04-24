/**
 * Proximity module types
 * Monitoring the proximity of a specific device
 */

// Proximity levels based on RSSI
type ProximityLevel = "near" | "medium" | "far" | "unknown";

// Status of proximity monitoring
type ProximityState =
  | "idle" // No devices selected
  | "initializing" // Initializing sensors/searching for initial signal
  | "monitoring" // Monitoring device
  | "signal-lost" // Signal lost (device not responding)
  | "error"; // Monitoring error

// Processed proximity data
interface ProximityData {
  level: ProximityLevel; // Proximity level
  rssi: number; // Current RSSI
  smoothedRssi: number; // Smoothed RSSI
  distance: number | null; // Estimated distance in meters (may be null)
  lastUpdate: number; // Timestamp of the last update
}

// Proximity Configuration
interface ProximityConfig {
  // Update interval in ms
  updateInterval: number;

  // Timeout to consider signal lost (ms)
  signalLostTimeout: number;

  // RSSI thresholds for proximity levels
  rssiThresholds: {
    near: number; // >= This value is "near" (e.g., -60)
    medium: number; // >= This value is "medium" (e.g., -80)
    // < medium is "far"
  };

  // Window size for RSSI smoothing
  smoothingWindow: number;

  // TX Power for distance calculation (dBm at 1 meter)
  // Typical value: -59 dBm
  txPower: number;

  // Environment propagation factor
  // 2.0 = free space
  // 2.7-3.5 = typical indoor environment
  // 4.0 = environment with many obstacles
  environmentFactor: number;
}

// Default configuration
const DEFAULT_PROXIMITY_CONFIG: ProximityConfig = {
  updateInterval: 300, // 300ms — aligned with animation duration to prevent overlapping
  signalLostTimeout: 5000, // 5 seconds
  rssiThresholds: {
    near: -60,
    medium: -80,
  },
  smoothingWindow: 5,
  txPower: -59, // Typical BLE TX Power at 1 meter
  environmentFactor: 3.0, // Typical indoor environment
};

// Proximity Error
interface ProximityError {
  code: string;
  message: string;
  recoverable: boolean;
}

// Proximity Callbacks
interface ProximityCallbacks {
  onProximityChange?: (data: ProximityData) => void;
  onLevelChange?: (level: ProximityLevel) => void;
  onSignalLost?: () => void;
  onSignalRestored?: () => void;
  onError?: (error: ProximityError) => void;
}

// useProximity hook interface
interface UseProximityReturn {
  // State
  state: ProximityState;
  proximityData: ProximityData | null;
  error: ProximityError | null;

  // Device monitored
  deviceId: string | null;
  deviceName: string | null;

  // Actions
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => void;

  // Settings
  config: ProximityConfig;
  updateConfig: (config: Partial<ProximityConfig>) => void;

  // Metadata
  isMonitoring: boolean;
  isRttActive: boolean;
}

export {
  DEFAULT_PROXIMITY_CONFIG,
  ProximityCallbacks,
  ProximityConfig,
  ProximityData,
  ProximityError,
  ProximityLevel,
  ProximityState,
  UseProximityReturn,
};
