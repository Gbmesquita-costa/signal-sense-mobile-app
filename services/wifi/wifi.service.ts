import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import { Platform } from "react-native";

import type {
  FrequencyBand,
  SecurityType,
  SignalQuality,
  WifiChannelInfo,
  WifiConnectionInfo,
  WifiNetwork,
} from "./wifi.types";

/**
 * Parse security from an Android ScanResult capabilities string, e.g.
 * "[WPA2-PSK-CCMP][RSN-PSK-CCMP][ESS]" or "[RSN-SAE-CCMP][ESS]".
 * Android names WPA3 by its key management (SAE, SUITE_B_192) and
 * WPA2 as RSN, so neither of those can be told apart by "WPA" alone.
 */
function parseSecurity(capabilities: string): SecurityType {
  const caps = capabilities.toUpperCase();

  if (/WPA3|SAE|SUITE[_-]B/.test(caps)) return "WPA3";
  // OWE ("Enhanced Open") encrypts traffic but anyone can join without a
  // password, which is what "Open" means to the user.
  if (caps.includes("OWE")) return "Open";
  if (caps.includes("WPA2") || caps.includes("RSN")) return "WPA2";

  if (caps.includes("WPA")) return "WPA";
  if (caps.includes("WEP")) return "WEP";

  if (caps.includes("ESS")) return "Open";
  return "Unknown";
}

class WifiService {
  private monitoringInterval: ReturnType<typeof setInterval> | null = null;
  private unsubscribe: (() => void) | null = null;

  private configured = false;

  /** Configure NetInfo to fetch SSID */
  private configure(): void {
    if (this.configured) return;
    NetInfo.configure({ shouldFetchWiFiSSID: true });

    this.configured = true;
  }

  /** Get current Wi-Fi connection info */
  async getCurrentConnection(): Promise<WifiConnectionInfo> {
    this.configure();
    const state = await NetInfo.fetch("wifi");

    return this.parseNetInfoState(state);
  }

  /** Start polling connection info at interval */
  startMonitoring(
    callback: (info: WifiConnectionInfo) => void,
    intervalMs = 3000,
  ): void {
    this.stopMonitoring();

    // Initial fetch
    this.getCurrentConnection()
      .then(callback)
      .catch(() => {});

    // Real-time listener for connectivity changes
    this.unsubscribe = NetInfo.addEventListener((state) => {
      callback(this.parseNetInfoState(state));
    });

    // Periodic polling for signal strength updates
    this.monitoringInterval = setInterval(() => {
      this.getCurrentConnection()
        .then(callback)
        .catch(() => {});
    }, intervalMs);
  }

  /** Stop monitoring */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  /** Scan nearby networks (Android only via react-native-wifi-reborn) */
  async scanNearbyNetworks(): Promise<WifiNetwork[]> {
    if (Platform.OS !== "android") {
      return [];
    }

    try {
      const WifiManager = await import("react-native-wifi-reborn");
      const networks = await WifiManager.default.loadWifiList();

      const currentState = await NetInfo.fetch("wifi");
      const currentSSID =
        currentState.type === "wifi" ? currentState.details?.ssid : null;

      return networks.map((net) => ({
        ssid: net.SSID,
        bssid: net.BSSID,
        rssi: net.level,
        frequency: net.frequency,
        band: this.getFrequencyBand(net.frequency),
        channel: this.getChannel(net.frequency),
        security: parseSecurity(net.capabilities),
        isConnected: net.SSID === currentSSID && currentSSID !== null,
        timestamp: net.timestamp,
      }));
    } catch {
      return [];
    }
  }

  /** Analyze channel congestion from network list */
  analyzeChannels(networks: WifiNetwork[]): WifiChannelInfo[] {
    const channelMap = new Map<number, WifiNetwork[]>();

    for (const net of networks) {
      const existing = channelMap.get(net.channel) ?? [];
      existing.push(net);
      channelMap.set(net.channel, existing);
    }

    return Array.from(channelMap.entries())
      .map(([channel, nets]) => ({
        channel,
        band: nets[0].band,
        networkCount: nets.length,
        congestion:
          nets.length >= 5
            ? ("high" as const)
            : nets.length >= 3
              ? ("medium" as const)
              : ("low" as const),
      }))
      .sort((a, b) => a.channel - b.channel);
  }

  /** Convert frequency to band label */
  getFrequencyBand(frequencyMHz: number | null): FrequencyBand {
    if (!frequencyMHz) return "unknown";

    if (frequencyMHz >= 2400 && frequencyMHz <= 2500) return "2.4 GHz";
    if (frequencyMHz >= 5150 && frequencyMHz <= 5895) return "5 GHz";

    if (frequencyMHz >= 5925 && frequencyMHz <= 7125) return "6 GHz";
    return "unknown";
  }

  /** Convert frequency to Wi-Fi channel number */
  getChannel(frequencyMHz: number): number {
    // 2.4 GHz band
    if (frequencyMHz >= 2412 && frequencyMHz <= 2484) {
      if (frequencyMHz === 2484) return 14;
      return Math.round((frequencyMHz - 2412) / 5) + 1;
    }

    // 5 GHz band
    if (frequencyMHz >= 5170 && frequencyMHz <= 5825) {
      return Math.round((frequencyMHz - 5000) / 5);
    }

    // 6 GHz band
    if (frequencyMHz >= 5955 && frequencyMHz <= 7115) {
      return Math.round((frequencyMHz - 5950) / 5);
    }

    return 0;
  }

  /** Get signal quality label from strength (0-100) */
  getSignalQuality(strength: number | null): SignalQuality {
    if (strength === null || strength <= 0) return "poor";

    if (strength >= 80) return "excellent";
    if (strength >= 60) return "good";

    if (strength >= 40) return "fair";
    if (strength >= 20) return "weak";

    return "poor";
  }

  /** Get signal quality from RSSI (dBm) */
  getSignalQualityFromRssi(rssi: number): SignalQuality {
    if (rssi >= -50) return "excellent";
    if (rssi >= -60) return "good";

    if (rssi >= -70) return "fair";
    if (rssi >= -80) return "weak";

    return "poor";
  }

  /** Get signal quality color */
  getSignalColor(
    quality: SignalQuality,
    theme: { success: string; warning: string; error: string },
  ): string {
    switch (quality) {
      case "excellent":
      case "good":
        return theme.success;
      case "fair":
        return theme.warning;
      case "weak":
      case "poor":
        return theme.error;
    }
  }

  /** Parse NetInfoState to WifiConnectionInfo */
  private parseNetInfoState(state: NetInfoState): WifiConnectionInfo {
    const isWifi = state.type === "wifi";
    const details = isWifi ? state.details : null;

    let strength: number | null = null;
    if (details && "strength" in details) {
      strength = (details as any).strength ?? null;
    }

    let frequency: number | null = null;
    if (details && "frequency" in details) {
      frequency = (details as any).frequency ?? null;
    }

    return {
      ssid: details?.ssid ?? null,
      bssid: details?.bssid ?? null,
      strength,
      frequency,
      band: this.getFrequencyBand(frequency),
      ip: details?.ipAddress ?? null,
      subnet: details?.subnet ?? null,
      isConnected: state.isConnected ?? false,
      type: isWifi
        ? "wifi"
        : state.type === "cellular"
          ? "cellular"
          : state.type === "none"
            ? "none"
            : "other",
      timestamp: Date.now(),
    };
  }
}

export const wifiService = new WifiService();
export { parseSecurity };
