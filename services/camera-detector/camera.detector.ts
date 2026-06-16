/**
 * Camera detector
 *
 * Classifies a scanned Wi-Fi access point (Type A) into a suspicion level with
 * human-readable reasons. Mirrors the heuristic-stacking approach of
 * services/tracker/tracker.detector.ts.
 *
 * The output is deliberately probabilistic — we never claim "this is a camera".
 */

import type { WifiNetwork } from "@/services/wifi/wifi.types";

import { CAMERA_OUI_PREFIXES, CAMERA_SSID_PATTERNS } from "./camera.database";
import type {
  SuspectAp,
  SuspicionLevel,
  SuspicionReason,
} from "./camera.types";

// Weight each heuristic contributes to the suspicion score.
const REASON_WEIGHT: Record<SuspicionReason, number> = {
  knownVendor: 3,
  ssidPattern: 3,
  hiddenSsid: 2,
  openNetwork: 1,
  strongSignalClose: 1,
};

class CameraDetector {
  /** Extract the OUI (first 3 octets, uppercase) from a BSSID. */
  private getOui(bssid: string): string | null {
    if (!bssid) return null;
    const parts = bssid.toUpperCase().split(":");
    if (parts.length < 3) return null;
    return `${parts[0]}:${parts[1]}:${parts[2]}`;
  }

  /** Look up a vendor label from the BSSID OUI. */
  vendorFor(bssid: string): string | null {
    const oui = this.getOui(bssid);
    if (!oui) return null;
    return CAMERA_OUI_PREFIXES[oui] ?? null;
  }

  private matchesSsidPattern(ssid: string): boolean {
    if (!ssid) return false;
    return CAMERA_SSID_PATTERNS.some((re) => re.test(ssid));
  }

  /** Analyze a single AP and return its suspicion classification. */
  classify(net: WifiNetwork): {
    suspicion: SuspicionLevel;
    vendor: string | null;
    reasons: SuspicionReason[];
  } {
    const reasons: SuspicionReason[] = [];

    const vendor = this.vendorFor(net.bssid);
    if (vendor) reasons.push("knownVendor");

    if (this.matchesSsidPattern(net.ssid)) reasons.push("ssidPattern");

    // Hidden SSID: the network beacons but advertises no name.
    if (!net.ssid || net.ssid.trim().length === 0) reasons.push("hiddenSsid");

    if (net.security === "Open") reasons.push("openNetwork");

    // A very strong signal means the device is physically close to you — worth
    // surfacing even on its own, since proximity is the whole point.
    if (net.rssi >= -50) reasons.push("strongSignalClose");

    const score = reasons.reduce((sum, r) => sum + REASON_WEIGHT[r], 0);

    let suspicion: SuspicionLevel = "none";
    if (score >= 4) suspicion = "high";
    else if (score >= 2) suspicion = "medium";
    else if (score >= 1) suspicion = "low";

    return { suspicion, vendor, reasons };
  }

  /** Classify a list of APs and sort by suspicion, then by signal strength. */
  analyze(networks: WifiNetwork[]): SuspectAp[] {
    const ranked: Record<SuspicionLevel, number> = {
      high: 3,
      medium: 2,
      low: 1,
      none: 0,
    };

    return networks
      .map<SuspectAp>((net) => {
        const { suspicion, vendor, reasons } = this.classify(net);
        return { ...net, suspicion, vendor, reasons };
      })
      .sort((a, b) => {
        const bySuspicion = ranked[b.suspicion] - ranked[a.suspicion];
        if (bySuspicion !== 0) return bySuspicion;
        return b.rssi - a.rssi; // stronger (closer) first
      });
  }
}

export const cameraDetector = new CameraDetector();
