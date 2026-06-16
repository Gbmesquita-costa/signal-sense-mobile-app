/**
 * Camera fingerprint database
 *
 * Mirrors the structure of services/tracker/tracker.database.ts.
 *
 * IMPORTANT — honesty: OUI / SSID matching produces *suspicion*, never a
 * guarantee. Many cameras share generic IoT chipsets (Espressif, Realtek) that
 * are also used by lamps, plugs and speakers. We surface reasons, not verdicts.
 */

import type { NetworkHostKind } from "./camera.types";

/**
 * BSSID OUI prefixes (first 3 octets, uppercase, ":"-separated) commonly seen
 * on IP cameras and the IoT chipsets they ship with. Maps to a vendor label.
 *
 * This is intentionally a curated, conservative list of well-known camera /
 * camera-chipset vendors. It is not exhaustive and is meant to RAISE suspicion,
 * combined with other heuristics.
 */
const CAMERA_OUI_PREFIXES: Record<string, string> = {
  // Hikvision
  "44:19:B6": "Hikvision",
  "4C:BD:8F": "Hikvision",
  "C0:56:E3": "Hikvision",
  "BC:AD:28": "Hikvision",
  "28:57:BE": "Hikvision",
  // Dahua
  "3C:EF:8C": "Dahua",
  "90:02:A9": "Dahua",
  "E0:50:8B": "Dahua",
  "14:A7:8B": "Dahua",
  // Ezviz (Hikvision sub-brand)
  "48:7B:6B": "Ezviz",
  // Reolink
  "EC:71:DB": "Reolink",
  // Wyze
  "2C:AA:8E": "Wyze",
  "D0:3F:27": "Wyze",
  // Tuya (white-label smart cams)
  "10:5A:17": "Tuya",
  "68:57:2D": "Tuya",
  "D8:1F:12": "Tuya",
  // Espressif (ESP32 — extremely common in cheap spy cams)
  "24:0A:C4": "Espressif",
  "30:AE:A4": "Espressif",
  "7C:9E:BD": "Espressif",
  "A4:CF:12": "Espressif",
  "DC:4F:22": "Espressif",
  "EC:FA:BC": "Espressif",
  // Realtek (RTL chipsets in many no-name cams)
  "00:E0:4C": "Realtek",
  // Shenzhen no-name OEMs frequently used by hidden cams
  "98:7B:F3": "Shenzhen OEM",
  "A0:FF:70": "Shenzhen OEM",
};

/** SSID substrings/patterns that often indicate a camera or its setup AP. */
const CAMERA_SSID_PATTERNS: RegExp[] = [
  /ip-?cam/i,
  /\bcam(era)?\b/i,
  /\bipc\b/i,
  /hikvision|dahua|ezviz|reolink|wyze|sricam|yi-?cam|foscam|tplink-?cam/i,
  /\bnvr\b|\bdvr\b/i,
  /onvif/i,
  /spy|hidden/i,
  /smartcam|wificam|netcam|babymonitor|doorbell/i,
];

/** TCP port signatures used by the Type B network scan. */
const CAMERA_PORT_SIGNATURES: {
  port: number;
  kind: NetworkHostKind;
  confidence: "high" | "medium" | "low";
}[] = [
  { port: 554, kind: "camera", confidence: "high" }, // RTSP — the strongest signal
  { port: 8554, kind: "camera", confidence: "high" }, // alt RTSP
  { port: 37777, kind: "nvr", confidence: "high" }, // Dahua proprietary
  { port: 34567, kind: "nvr", confidence: "high" }, // XMeye / generic DVR
  { port: 8899, kind: "nvr", confidence: "medium" }, // generic NVR
  { port: 8000, kind: "camera", confidence: "medium" }, // Hikvision SDK
  { port: 80, kind: "generic", confidence: "low" }, // web UI (many devices)
  { port: 8080, kind: "generic", confidence: "low" }, // web UI
  { port: 443, kind: "generic", confidence: "low" }, // web UI (TLS)
];

export {
  CAMERA_OUI_PREFIXES,
  CAMERA_PORT_SIGNATURES,
  CAMERA_SSID_PATTERNS,
};
