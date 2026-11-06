import type { WifiNetwork } from "@/services/wifi/wifi.types";

import { cameraDetector } from "../camera.detector";

const ap = (overrides: Partial<WifiNetwork> = {}): WifiNetwork => ({
  ssid: "Home",
  bssid: "00:11:22:33:44:55",
  rssi: -70,
  frequency: 2437,
  band: "2.4 GHz",
  channel: 6,
  security: "WPA2",
  isConnected: false,
  ...overrides,
});

describe("cameraDetector", () => {
  it("does not flag an ordinary secured home network", () => {
    expect(cameraDetector.classify(ap())).toEqual({
      suspicion: "none",
      vendor: null,
      reasons: [],
    });
  });

  it("resolves the vendor from the BSSID OUI regardless of case", () => {
    expect(cameraDetector.vendorFor("44:19:b6:01:02:03")).toBe("Hikvision");
    expect(cameraDetector.vendorFor("24:0A:C4:AA:BB:CC")).toBe("Espressif");
    expect(cameraDetector.vendorFor("00:11:22:33:44:55")).toBeNull();
    expect(cameraDetector.vendorFor("")).toBeNull();
    expect(cameraDetector.vendorFor("not-a-mac")).toBeNull();
  });

  it("rates a camera vendor broadcasting a camera-like SSID as high", () => {
    const result = cameraDetector.classify(
      ap({ bssid: "EC:71:DB:00:00:01", ssid: "Reolink_E1" }),
    );

    expect(result.suspicion).toBe("high");
    expect(result.vendor).toBe("Reolink");
    expect(result.reasons).toEqual(["knownVendor", "ssidPattern"]);
  });

  it("matches camera SSID patterns without catching unrelated names", () => {
    const reasonsFor = (ssid: string) =>
      cameraDetector.classify(ap({ ssid })).reasons;

    expect(reasonsFor("IPCAM-4821")).toContain("ssidPattern");
    expect(reasonsFor("Living Room Cam")).toContain("ssidPattern");
    expect(reasonsFor("Office NVR")).toContain("ssidPattern");
    expect(reasonsFor("Camila's iPhone")).not.toContain("ssidPattern");
    expect(reasonsFor("Cambridge Guest")).not.toContain("ssidPattern");
  });

  it("treats hidden and open networks as medium suspicion together", () => {
    const result = cameraDetector.classify(ap({ ssid: "", security: "Open" }));

    expect(result.reasons).toEqual(["hiddenSsid", "openNetwork"]);
    expect(result.suspicion).toBe("medium");
  });

  it("only raises low suspicion for an open network or a close signal alone", () => {
    expect(cameraDetector.classify(ap({ security: "Open" })).suspicion).toBe(
      "low",
    );
    expect(cameraDetector.classify(ap({ rssi: -45 })).suspicion).toBe("low");
    expect(cameraDetector.classify(ap({ rssi: -51 })).suspicion).toBe("none");
  });

  it("ranks by suspicion first, then by signal strength", () => {
    const ranked = cameraDetector.analyze([
      ap({ ssid: "Home", rssi: -40 }),
      ap({ ssid: "far-cam", rssi: -80 }),
      ap({ ssid: "near-cam", rssi: -60 }),
      ap({ ssid: "Neighbour", rssi: -75 }),
    ]);

    expect(ranked.map((n) => n.ssid)).toEqual([
      "near-cam",
      "far-cam",
      "Home",
      "Neighbour",
    ]);
    expect(ranked.map((n) => n.suspicion)).toEqual([
      "medium",
      "medium",
      "low",
      "none",
    ]);
  });
});
