import { wifiService } from "../wifi.service";
import type { WifiNetwork } from "../wifi.types";

const network = (channel: number, ssid: string): WifiNetwork => ({
  ssid,
  bssid: "00:11:22:33:44:55",
  rssi: -60,
  frequency: 2412,
  band: "2.4 GHz",
  channel,
  security: "WPA2",
  isConnected: false,
});

describe("wifiService", () => {
  it("maps frequencies to bands", () => {
    expect(wifiService.getFrequencyBand(2437)).toBe("2.4 GHz");
    expect(wifiService.getFrequencyBand(5180)).toBe("5 GHz");
    expect(wifiService.getFrequencyBand(6115)).toBe("6 GHz");
    expect(wifiService.getFrequencyBand(null)).toBe("unknown");
  });

  it("maps frequencies to channel numbers", () => {
    expect(wifiService.getChannel(2412)).toBe(1);
    expect(wifiService.getChannel(2437)).toBe(6);
    expect(wifiService.getChannel(2484)).toBe(14);
    expect(wifiService.getChannel(5180)).toBe(36);
    expect(wifiService.getChannel(5955)).toBe(1);
  });

  it("classifies RSSI into signal quality", () => {
    expect(wifiService.getSignalQualityFromRssi(-45)).toBe("excellent");
    expect(wifiService.getSignalQualityFromRssi(-65)).toBe("fair");
    expect(wifiService.getSignalQualityFromRssi(-90)).toBe("poor");
  });

  it("groups networks per channel and rates congestion", () => {
    const networks = [
      ...[1, 2, 3, 4, 5].map((i) => network(6, `six-${i}`)),
      ...[1, 2, 3].map((i) => network(11, `eleven-${i}`)),
      network(1, "one"),
    ];

    expect(wifiService.analyzeChannels(networks)).toEqual([
      { channel: 1, band: "2.4 GHz", networkCount: 1, congestion: "low" },
      { channel: 6, band: "2.4 GHz", networkCount: 5, congestion: "high" },
      { channel: 11, band: "2.4 GHz", networkCount: 3, congestion: "medium" },
    ]);
  });
});
