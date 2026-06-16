/**
 * useCameraDetector
 *
 * Orchestrates the hidden-camera detection flow:
 *  - Type A: scan nearby Wi-Fi APs, classify camera suspicion, and "hunt" a
 *    selected AP by RF proximity (WifiProximityManager).
 *  - Type B: scan the local network for camera-like hosts (networkScanner).
 *
 * Mirrors the lifecycle conventions of useProximity / useWifi.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

import * as Haptics from "expo-haptics";
import * as Location from "expo-location";

import { wifiService } from "@/services/wifi/wifi.service";
import type { WifiConnectionInfo } from "@/services/wifi/wifi.types";

import {
  cameraDetector,
  DEFAULT_WIFI_PROXIMITY_CONFIG,
  NATIVE_UNAVAILABLE,
  networkScanner,
  WifiProximityManager,
} from "@/services/camera-detector";
import type {
  CameraDetectorError,
  CameraDetectorPhase,
  HuntData,
  NetworkCameraHost,
  NetworkScanState,
  SuspectAp,
} from "@/services/camera-detector";

interface UseCameraDetectorReturn {
  phase: CameraDetectorPhase;
  isAndroid: boolean;
  error: CameraDetectorError | null;

  // Type A
  suspects: SuspectAp[];
  selectedAp: SuspectAp | null;
  huntData: HuntData | null;

  // Type B
  networkScanState: NetworkScanState;
  networkHosts: NetworkCameraHost[];
  networkProgress: number;

  // Actions
  scanAps: () => Promise<void>;
  selectAp: (ap: SuspectAp) => Promise<void>;
  stopHunt: () => void;
  scanNetwork: () => Promise<void>;
  reset: () => void;
}

function useCameraDetector(): UseCameraDetectorReturn {
  const [phase, setPhase] = useState<CameraDetectorPhase>("idle");
  const [error, setError] = useState<CameraDetectorError | null>(null);

  const [suspects, setSuspects] = useState<SuspectAp[]>([]);
  const [selectedAp, setSelectedAp] = useState<SuspectAp | null>(null);
  const [huntData, setHuntData] = useState<HuntData | null>(null);

  const [networkScanState, setNetworkScanState] =
    useState<NetworkScanState>("idle");
  const [networkHosts, setNetworkHosts] = useState<NetworkCameraHost[]>([]);
  const [networkProgress, setNetworkProgress] = useState(0);

  const managerRef = useRef<WifiProximityManager | null>(null);

  const isAndroid = Platform.OS === "android";

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      managerRef.current?.stopMonitoring();
      managerRef.current = null;
    };
  }, []);

  /** Ensure Android + location services are ready (Wi-Fi scans require it). */
  const ensureReady = useCallback(async (): Promise<boolean> => {
    if (!isAndroid) {
      setError({ code: "NOT_ANDROID", messageKey: "notAndroid" });
      setPhase("unavailable");
      return false;
    }

    const locationOn = await Location.hasServicesEnabledAsync();
    if (!locationOn) {
      setError({ code: "LOCATION_OFF", messageKey: "locationOff" });
      setPhase("error");
      return false;
    }

    return true;
  }, [isAndroid]);

  const scanAps = useCallback(async () => {
    setError(null);
    const ready = await ensureReady();
    if (!ready) return;

    setPhase("scanning");
    try {
      const networks = await wifiService.scanNearbyNetworks();
      const ranked = cameraDetector.analyze(networks);
      setSuspects(ranked);
      setPhase("results");
    } catch {
      setError({ code: "SCAN_FAILED", messageKey: "scanFailed" });
      setPhase("error");
    }
  }, [ensureReady]);

  const getManager = useCallback((): WifiProximityManager => {
    if (managerRef.current) return managerRef.current;

    managerRef.current = new WifiProximityManager(
      DEFAULT_WIFI_PROXIMITY_CONFIG,
      {
        onUpdate: (data) => {
          setHuntData(data);
        },
        onLevelChange: (level) => {
          if (level === "near") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          } else if (level === "medium") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } else if (level === "far") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        },
        onSignalLost: () => {
          setHuntData((prev) =>
            prev ? { ...prev, level: "unknown" } : prev,
          );
        },
      },
    );

    return managerRef.current;
  }, []);

  const selectAp = useCallback(
    async (ap: SuspectAp) => {
      const ready = await ensureReady();
      if (!ready) return;

      setSelectedAp(ap);
      setHuntData(null);
      setPhase("hunting");

      const manager = getManager();
      await manager.startMonitoring(ap.bssid);
    },
    [ensureReady, getManager],
  );

  const stopHunt = useCallback(() => {
    managerRef.current?.stopMonitoring();
    setHuntData(null);
    setSelectedAp(null);
    setPhase("results");
  }, []);

  const scanNetwork = useCallback(async () => {
    if (!isAndroid) {
      setNetworkScanState("unavailable");
      return;
    }
    if (!networkScanner.isAvailable()) {
      // Native module not linked yet (needs dev-client rebuild).
      setNetworkScanState("unavailable");
      return;
    }

    setNetworkHosts([]);
    setNetworkProgress(0);
    setNetworkScanState("scanning");

    let connection: WifiConnectionInfo;
    try {
      connection = await wifiService.getCurrentConnection();
    } catch {
      setNetworkScanState("error");
      return;
    }

    if (!connection.isConnected || connection.type !== "wifi") {
      // Type B needs you on the same Wi-Fi as the suspected camera.
      setNetworkScanState("unavailable");
      return;
    }

    try {
      const hosts = await networkScanner.scan(connection, {
        onProgress: setNetworkProgress,
        onHost: (host) =>
          setNetworkHosts((prev) => {
            const rank = { high: 2, medium: 1, low: 0 } as const;
            return [...prev, host].sort(
              (a, b) => rank[b.confidence] - rank[a.confidence],
            );
          }),
      });
      setNetworkHosts(hosts);
      setNetworkScanState("done");
    } catch (err) {
      if (err instanceof Error && err.message === NATIVE_UNAVAILABLE) {
        setNetworkScanState("unavailable");
      } else {
        setNetworkScanState("error");
      }
    }
  }, [isAndroid]);

  const reset = useCallback(() => {
    managerRef.current?.stopMonitoring();
    setPhase("idle");
    setError(null);
    setSuspects([]);
    setSelectedAp(null);
    setHuntData(null);
    setNetworkScanState("idle");
    setNetworkHosts([]);
    setNetworkProgress(0);
  }, []);

  return {
    phase,
    isAndroid,
    error,
    suspects,
    selectedAp,
    huntData,
    networkScanState,
    networkHosts,
    networkProgress,
    scanAps,
    selectAp,
    stopHunt,
    scanNetwork,
    reset,
  };
}

export { useCameraDetector, UseCameraDetectorReturn };
