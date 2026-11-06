type WifiState = "idle" | "scanning" | "monitoring" | "unavailable" | "error";

type SignalQuality = "excellent" | "good" | "fair" | "weak" | "poor";
type FrequencyBand = "2.4 GHz" | "5 GHz" | "6 GHz" | "unknown";

type SecurityType = "WPA3" | "WPA2" | "WPA" | "WEP" | "Open" | "Unknown";

interface WifiConnectionInfo {
  ssid: string | null;
  bssid: string | null;
  strength: number | null; // 0-100
  frequency: number | null; // MHz
  band: FrequencyBand;
  ip: string | null;
  subnet: string | null;
  isConnected: boolean;
  type: "wifi" | "cellular" | "none" | "other";
  timestamp: number;
}

interface WifiNetwork {
  ssid: string;
  bssid: string;
  rssi: number; // dBm
  frequency: number; // MHz
  band: FrequencyBand;
  channel: number;
  security: SecurityType;
  isConnected: boolean;
  /**
   * When Android last saw this access point (ScanResult.timestamp,
   * microseconds since boot). Unchanged between two calls means the system
   * returned a cached scan, not a new reading.
   */
  timestamp?: number;
}

interface WifiChannelInfo {
  channel: number;
  band: FrequencyBand;
  networkCount: number;
  congestion: "low" | "medium" | "high";
}

export {
  FrequencyBand,
  SecurityType,
  SignalQuality,
  WifiChannelInfo,
  WifiConnectionInfo,
  WifiNetwork,
  WifiState,
};
