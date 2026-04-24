/**
 * Core Scan Module Types
 * Used by BLE and UI
 */

// Actual scan states - reflect what is happening
type ScanState =
  | "idle" // Awaiting user action
  | "checking-permissions" // Checking required permissions
  | "requesting-permissions" // Requesting permissions from the user
  | "checking-bluetooth" // Checking Bluetooth status
  | "initializing" // Initializing sensors
  | "scanning" // Active scan
  | "processing" // Processing collected data
  | "stopped" // Scan stopped by user
  | "finished" // Scan completed successfully
  | "error"; // Error during the process

// Signal strength classification
type SignalStrength = "weak" | "medium" | "strong";

// Device type detected
type DeviceType = "ble";

// RSSI processed with history
interface RssiData {
  raw: number; // Current gross value
  smoothed: number; // Smoothed value (moving average)
  strength: SignalStrength; // Classification
  history: number[]; // Historical values (last N)
  lastUpdated: number; // Timestamp of the last update
}

// BLE device detected
interface BleDevice {
  id: string; // Unique ID (MAC address or UUID)
  name: string | null; // Device name (can be null)
  localName: string | null; // Local name announced
  rssi: RssiData; // RSSI data processed
  isConnectable: boolean | null; // If connection is allowed
  serviceUUIDs: string[] | null; // UUIDs of advertised services
  manufacturerData: string | null; // Manufacturer data (base64)
  firstSeen: number; // Timestamp of first detection
  lastSeen: number; // Timestamp of the last detection
}

// Tracker detection info
interface TrackerInfo {
  isTracker: boolean;
  type: string | null;
  brand: string | null;
  confidence: "high" | "medium";
}

// Unified device for the UI
interface ScannedDevice {
  id: string;
  type: DeviceType;
  name: string | null;
  rssi: RssiData;
  firstSeen: number;
  lastSeen: number;
  // Type-specific data
  bleData?: Omit<BleDevice, "id" | "name" | "rssi" | "firstSeen" | "lastSeen">;
  // Tracker detection
  trackerInfo?: TrackerInfo;
}

// Scan error with context
interface ScanError {
  code: string;
  message: string;
  recoverable: boolean; // If the user can try again
  action?:
    | "enable-bluetooth"
    | "enable-location"
    | "grant-permissions"
    | "retry";
}

// Permissions status
interface PermissionStatus {
  bluetooth: "granted" | "denied" | "undetermined" | "unavailable";
  location: "granted" | "denied" | "undetermined" | "unavailable";
}

// Scan Settings
interface ScanConfig {
  // BLE
  bleEnabled: boolean;
  bleScanDuration: number; // ms, 0 = continuous until stop
  bleAllowDuplicates: boolean; // Receive updates from the same device

  // RSSI
  rssiHistorySize: number; // How many values to keep in the history
  rssiSmoothingWindow: number; // Window size for moving average

  // Intensity thresholds
  rssiThresholds: {
    strong: number; // >= this value is strong (e.g., -50)
    medium: number; // >= this value is average (e.g., -70)
    // < medium is weak
  };
}

// Default configuration
const DEFAULT_SCAN_CONFIG: ScanConfig = {
  bleEnabled: true,
  bleScanDuration: 0, // Continuous
  bleAllowDuplicates: true, // Receive RSSI updates
  rssiHistorySize: 10,
  rssiSmoothingWindow: 5,
  rssiThresholds: {
    strong: -50,
    medium: -70,
  },
};

// Aggregated scan result
interface ScanResult {
  devices: ScannedDevice[];
  bleDevices: BleDevice[];
  startedAt: number;
  finishedAt: number | null;
  duration: number; // ms
}

// Scan callbacks
interface ScanCallbacks {
  onDeviceFound?: (device: ScannedDevice) => void;
  onDeviceUpdated?: (device: ScannedDevice) => void;
  onDeviceLost?: (deviceId: string) => void;
  onStateChange?: (state: ScanState) => void;
  onError?: (error: ScanError) => void;
}

// useScan hook interface
interface UseScanReturn {
  // State
  state: ScanState;
  devices: ScannedDevice[];
  bleDevices: BleDevice[];
  error: ScanError | null;
  permissions: PermissionStatus;

  // Actions
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;

  // Settings
  config: ScanConfig;
  updateConfig: (config: Partial<ScanConfig>) => void;

  // Metadata
  isScanning: boolean;
  scanDuration: number; // ms from the beginning
  deviceCount: number;
  bleCount: number;
}

export {
  BleDevice,
  DEFAULT_SCAN_CONFIG,
  DeviceType,
  PermissionStatus,
  RssiData,
  ScanCallbacks,
  ScanConfig,
  ScanError,
  ScannedDevice,
  ScanResult,
  ScanState,
  SignalStrength,
  TrackerInfo,
  UseScanReturn,
};
