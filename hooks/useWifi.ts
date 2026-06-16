import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

import { historyService } from "@/services/history";
import type { WifiSample } from "@/services/history/history.types";

import { wifiService } from "@/services/wifi/wifi.service";
import type {
  WifiChannelInfo,
  WifiConnectionInfo,
  WifiNetwork,
  WifiState,
} from "@/services/wifi/wifi.types";

import { useIsPremium } from "@/stores/usePremiumStore";

interface UseWifiReturn {
  state: WifiState;
  connection: WifiConnectionInfo | null;
  nearbyNetworks: WifiNetwork[];
  channelAnalysis: WifiChannelInfo[];
  error: string | null;
  isAndroid: boolean;
  isScanningNetworks: boolean;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => void;
  refreshNetworks: () => Promise<void>;
}

const SAMPLE_FLUSH_THRESHOLD = 30;

function useWifi(): UseWifiReturn {
  const [state, setState] = useState<WifiState>("idle");
  const [connection, setConnection] = useState<WifiConnectionInfo | null>(null);

  const [nearbyNetworks, setNearbyNetworks] = useState<WifiNetwork[]>([]);
  const [channelAnalysis, setChannelAnalysis] = useState<WifiChannelInfo[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [isScanningNetworks, setIsScanningNetworks] = useState<boolean>(false);

  const isPremium = useIsPremium();
  const isMonitoringRef = useRef(false);

  // DB persistence refs
  const sessionIdRef = useRef<string | null>(null);

  const sessionStartedRef = useRef(false);
  const sampleBufferRef = useRef<WifiSample[]>([]);

  const flushSamples = useCallback(async () => {
    if (!sessionIdRef.current || sampleBufferRef.current.length === 0) return;

    const samples = [...sampleBufferRef.current];
    sampleBufferRef.current = [];
    try {
      await historyService.addWifiSamples(sessionIdRef.current, samples);
    } catch {
      // Non-critical
    }
  }, []);

  const startMonitoring = useCallback(async () => {
    try {
      setState("scanning");
      setError(null);

      const info = await wifiService.getCurrentConnection();

      if (info.type === "none") {
        setState("unavailable");
        return;
      }

      setConnection(info);
      sessionStartedRef.current = false;

      // Start real-time monitoring
      wifiService.startMonitoring((updated) => {
        setConnection(updated);

        // Lazy session creation on first data
        if (!sessionStartedRef.current) {
          sessionStartedRef.current = true;
          historyService
            .createWifiSession(updated.ssid)
            .then((id) => {
              sessionIdRef.current = id;
            })
            .catch(() => {});
        }

        // Buffer sample for DB
        sampleBufferRef.current.push({
          timestamp: updated.timestamp,
          ssid: updated.ssid,
          strength: updated.strength,
          band: updated.band !== "unknown" ? updated.band : null,
          frequency: updated.frequency,
        });
        if (
          sessionIdRef.current &&
          sampleBufferRef.current.length >= SAMPLE_FLUSH_THRESHOLD
        ) {
          flushSamples();
        }

        if (!isMonitoringRef.current) {
          isMonitoringRef.current = true;
          setState("monitoring");
        }
      });

      isMonitoringRef.current = true;
      setState("monitoring");

      // Scan nearby networks if premium + Android
      if (isPremium && Platform.OS === "android") {
        setIsScanningNetworks(true);
        try {
          const networks = await wifiService.scanNearbyNetworks();

          setNearbyNetworks(networks);
          setChannelAnalysis(wifiService.analyzeChannels(networks));
        } catch {
          // Non-critical
        } finally {
          setIsScanningNetworks(false);
        }
      }
    } catch (err) {
      setState("error");
      setError(
        err instanceof Error ? err.message : "Failed to start Wi-Fi monitoring",
      );
    }
  }, [isPremium, flushSamples]);

  const stopMonitoring = useCallback(() => {
    wifiService.stopMonitoring();

    // Finish DB session (fire-and-forget)
    const sid = sessionIdRef.current;
    const hadSession = sessionStartedRef.current;

    const remaining = [...sampleBufferRef.current];
    sampleBufferRef.current = [];

    sessionIdRef.current = null;
    sessionStartedRef.current = false;

    if (hadSession && sid) {
      (async () => {
        try {
          if (remaining.length > 0) {
            await historyService.addWifiSamples(sid, remaining);
          }
          await historyService.finishWifiSession(sid);
        } catch {
          // Non-critical
        }
      })();
    }

    isMonitoringRef.current = false;

    setState("idle");
    setConnection(null);

    setNearbyNetworks([]);
    setChannelAnalysis([]);
  }, []);

  const refreshNetworks = useCallback(async () => {
    if (!isPremium || Platform.OS !== "android") return;
    setIsScanningNetworks(true);

    try {
      const networks = await wifiService.scanNearbyNetworks();

      setNearbyNetworks(networks);
      setChannelAnalysis(wifiService.analyzeChannels(networks));
    } catch {
      // Non-critical
    } finally {
      setIsScanningNetworks(false);
    }
  }, [isPremium]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wifiService.stopMonitoring();
    };
  }, []);

  return {
    state,
    connection,
    nearbyNetworks,
    channelAnalysis,
    error,
    isAndroid: Platform.OS === "android",
    isScanningNetworks,
    startMonitoring,
    stopMonitoring,
    refreshNetworks,
  };
}

export { useWifi, UseWifiReturn };
