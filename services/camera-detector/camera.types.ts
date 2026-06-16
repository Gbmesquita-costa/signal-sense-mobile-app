/**
 * Camera Detector types
 *
 * Two complementary techniques:
 *  - Type A: nearby Wi-Fi access points (a camera that broadcasts its own SSID).
 *    Detectable AND locatable by RSSI proximity.
 *  - Type B: client cameras already joined to the venue network. Only their
 *    presence can be detected (network port scan) — not their physical location.
 */

import type { WifiNetwork } from "@/services/wifi/wifi.types";

/** How suspicious an access point looks (higher = more likely a camera). */
type SuspicionLevel = "high" | "medium" | "low" | "none";

/** Why an AP was flagged — values are i18n keys under `cameraDetector.reasons`. */
type SuspicionReason =
  | "knownVendor"
  | "ssidPattern"
  | "hiddenSsid"
  | "openNetwork"
  | "strongSignalClose";

/** A scanned access point enriched with camera-suspicion analysis. */
interface SuspectAp extends WifiNetwork {
  suspicion: SuspicionLevel;
  /** Matched manufacturer (from BSSID OUI), if any. */
  vendor: string | null;
  /** i18n reason keys explaining the suspicion. */
  reasons: SuspicionReason[];
}

/** Guessed kind of a device found on the local network (Type B). */
type NetworkHostKind = "camera" | "nvr" | "generic";

/** A host discovered on the local subnet with open camera-like ports (Type B). */
interface NetworkCameraHost {
  ip: string;
  /** Open TCP ports that matched a camera signature. */
  openPorts: number[];
  kind: NetworkHostKind;
  confidence: "high" | "medium" | "low";
  /** Human-readable label from the HTTP banner, if resolved. i18n-independent. */
  label: string | null;
}

/** Phases of the whole detector flow. */
type CameraDetectorPhase =
  | "idle" // intro screen
  | "scanning" // scanning nearby APs
  | "results" // showing suspects + network scan section
  | "hunting" // RF proximity to a selected AP
  | "error"
  | "unavailable"; // not Android / Wi-Fi off

/** State of the optional Type B network scan. */
type NetworkScanState =
  | "idle"
  | "scanning"
  | "done"
  | "unavailable" // native module missing (needs rebuild) or not connected
  | "error";

interface CameraDetectorError {
  code:
    | "NOT_ANDROID"
    | "LOCATION_OFF"
    | "WIFI_OFF"
    | "SCAN_FAILED"
    | "SIGNAL_LOST";
  /** i18n key under `cameraDetector.errors`. */
  messageKey: string;
}

/** RF proximity reading while hunting an AP. */
interface HuntData {
  level: "near" | "medium" | "far" | "unknown";
  rssi: number;
  smoothedRssi: number;
  /** 0-100 strength derived from RSSI, for the radar/bar UI. */
  strength: number;
  distance: number | null;
  lastUpdate: number;
}

/** Config for the Wi-Fi proximity hunt. */
interface WifiProximityConfig {
  /** How often to re-scan APs (ms). Android throttles ~4 scans / 2 min. */
  scanInterval: number;
  /** Consider the signal lost after this long without the BSSID (ms). */
  signalLostTimeout: number;
  /** TX power (dBm at 1 m) for a Wi-Fi AP — stronger than BLE. */
  txPower: number;
  environmentFactor: number;
  rssiThresholds: { near: number; medium: number };
}

const DEFAULT_WIFI_PROXIMITY_CONFIG: WifiProximityConfig = {
  scanInterval: 3000,
  signalLostTimeout: 12000, // generous: scans are throttled
  txPower: -45, // typical Wi-Fi AP RSSI at ~1 m
  environmentFactor: 3.0,
  rssiThresholds: { near: -55, medium: -72 },
};

export {
  CameraDetectorError,
  CameraDetectorPhase,
  DEFAULT_WIFI_PROXIMITY_CONFIG,
  HuntData,
  NetworkCameraHost,
  NetworkHostKind,
  NetworkScanState,
  SuspectAp,
  SuspicionLevel,
  SuspicionReason,
  WifiProximityConfig,
};
