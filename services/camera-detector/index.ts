export { cameraDetector } from "./camera.detector";

export { networkScanner, NATIVE_UNAVAILABLE } from "./network-scanner";
export { WifiProximityManager, rssiToStrength } from "./wifi-proximity.manager";

export {
  CAMERA_OUI_PREFIXES,
  CAMERA_PORT_SIGNATURES,
  CAMERA_SSID_PATTERNS,
} from "./camera.database";

export { DEFAULT_WIFI_PROXIMITY_CONFIG } from "./camera.types";

export type {
  CameraDetectorError,
  CameraDetectorPhase,
  HuntData,
  NetworkCameraHost,
  NetworkHostKind,
  NetworkScanState,
  SuspectAp,
  SuspicionLevel,
  SuspicionReason,
  WifiProximityConfig,
} from "./camera.types";
