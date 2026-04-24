import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

import * as Haptics from "expo-haptics";
import * as Location from "expo-location";

import {
  DEFAULT_PROXIMITY_CONFIG,
  ProximityManager,
  type ProximityConfig,
  type ProximityData,
  type ProximityError,
  type ProximityState,
  type UseProximityReturn,
} from "@/services/proximity";

import { historyService } from "@/services/history";
import type { ProximitySample } from "@/services/history/history.types";

import { bleManager } from "@/services/scan";
import { useScanStore, useSelectedDevice } from "@/stores/useScanStore";

function useProximity(
  initialConfig: Partial<ProximityConfig> = {},
): UseProximityReturn {
  // =========================
  // CONFIG
  // =========================
  const configRef = useRef<ProximityConfig>({
    ...DEFAULT_PROXIMITY_CONFIG,
    ...initialConfig,
  });
  const [config, setConfig] = useState(configRef.current);

  // =========================
  // STATE
  // =========================
  const [state, setState] = useState<ProximityState>("idle");
  const [proximityData, setProximityData] = useState<ProximityData | null>(
    null,
  );

  const [error, setError] = useState<ProximityError | null>(null);

  // =========================
  // DEVICE
  // =========================
  const selectedDevice = useSelectedDevice();
  const updateSelectedDeviceRssi = useScanStore(
    (s) => s.updateSelectedDeviceRssi,
  );

  // =========================
  // MANAGER (singleton)
  // =========================
  const managerRef = useRef<ProximityManager | null>(null);

  // =========================
  // DB PERSISTENCE
  // =========================
  const sessionIdRef = useRef<string | null>(null);
  const sampleBufferRef = useRef<ProximitySample[]>([]);

  const FLUSH_THRESHOLD = 50;
  const sessionStartedRef = useRef(false);

  const monitoringDeviceIdRef = useRef<string | null>(null);

  const flushSamples = useCallback(async () => {
    if (!sessionIdRef.current || sampleBufferRef.current.length === 0) return;

    const samples = [...sampleBufferRef.current];
    sampleBufferRef.current = [];
    try {
      await historyService.addProximitySamples(sessionIdRef.current, samples);
    } catch {
      // Non-critical — silently fail
    }
  }, []);

  // =========================
  // CLEANUP GLOBAL
  // =========================
  useEffect(() => {
    return () => {
      if (managerRef.current) {
        managerRef.current.stopMonitoring();
        managerRef.current = null;
      }
    };
  }, []);

  // =========================
  // INIT MANAGER
  // =========================
  const getManager = useCallback(() => {
    if (managerRef.current) return managerRef.current;

    managerRef.current = new ProximityManager(configRef.current, {
      onProximityChange: (data) => {
        setProximityData(data);
        setState("monitoring");

        updateSelectedDeviceRssi(data.rssi);

        // Lazy session creation — only on first actual data
        if (!sessionStartedRef.current && monitoringDeviceIdRef.current) {
          sessionStartedRef.current = true;
          historyService
            .createProximitySession(monitoringDeviceIdRef.current)
            .then((id) => {
              sessionIdRef.current = id;
            })
            .catch(() => {});
        }

        // Buffer sample for DB persistence
        sampleBufferRef.current.push({
          timestamp: data.lastUpdate,
          rssi: data.rssi,
          smoothedRssi: data.smoothedRssi,
          distance: data.distance,
        });
        if (
          sessionIdRef.current &&
          sampleBufferRef.current.length >= FLUSH_THRESHOLD
        ) {
          flushSamples();
        }
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
        setState("signal-lost");
        setError({
          code: "SIGNAL_LOST",
          message: "Sinal do dispositivo foi perdido",
          recoverable: true,
        });
      },

      onSignalRestored: () => {
        setState("monitoring");
        setError(null);
      },

      onError: (err) => {
        setError(err);
        setState("error");
      },
    });

    return managerRef.current;
  }, [updateSelectedDeviceRssi]);

  // =========================
  // START
  // =========================
  const startMonitoring = useCallback(async (): Promise<void> => {
    if (!selectedDevice) {
      setError({
        code: "NO_DEVICE_SELECTED",
        message: "Nenhum dispositivo selecionado",
        recoverable: true,
      });

      setState("error");
      return;
    }

    // ---------- ANDROID LOCATION ----------
    if (Platform.OS === "android") {
      const locationEnabled = await Location.hasServicesEnabledAsync();
      if (!locationEnabled) {
        setError({
          code: "LOCATION_OFF",
          message: "Ative a localização para usar proximidade",
          recoverable: true,
        });

        setState("error");
        return;
      }
    }

    // ---------- BLE ----------
    await bleManager.initialize();
    const bleState = await bleManager.getState();

    if (bleState !== "powered-on") {
      setError({
        code: "BLUETOOTH_OFF",
        message: "Bluetooth desligado",
        recoverable: true,
      });

      setState("error");
      return;
    }

    // ---------- OK ----------
    setError(null);
    setState("initializing");

    // Prepare for lazy session creation (on first data)
    sessionStartedRef.current = false;
    monitoringDeviceIdRef.current = selectedDevice.id;

    const manager = getManager();

    // ⚡ OPTIMIZATION: We don't use `await` here so that the UI instantly changes to 'initializing'
    manager.startMonitoring(selectedDevice.id);
  }, [selectedDevice, getManager]);

  // =========================
  // STOP
  // =========================
  const stopMonitoring = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.stopMonitoring();
    }

    // Finish DB session (fire-and-forget)
    const sid = sessionIdRef.current;

    const hadSession = sessionStartedRef.current;
    const remaining = [...sampleBufferRef.current];

    sampleBufferRef.current = [];
    sessionIdRef.current = null;

    sessionStartedRef.current = false;
    monitoringDeviceIdRef.current = null;

    if (hadSession && sid) {
      (async () => {
        try {
          if (remaining.length > 0) {
            await historyService.addProximitySamples(sid, remaining);
          }
          await historyService.finishProximitySession(sid);
        } catch {
          // Non-critical
        }
      })();
    }

    setState("idle");

    setProximityData(null);
    setError(null);
  }, []);

  // =========================
  // UPDATE CONFIG
  // =========================
  const updateConfig = useCallback((newConfig: Partial<ProximityConfig>) => {
    configRef.current = { ...configRef.current, ...newConfig };
    setConfig(configRef.current);

    if (managerRef.current) {
      managerRef.current.updateConfig(newConfig);
    }
  }, []);

  // =========================
  // AUTO STOP & RESET ON DEVICE CHANGE
  // =========================
  const lastDeviceIdRef = useRef<string | null>(selectedDevice?.id ?? null);

  useEffect(() => {
    const currentId = selectedDevice?.id ?? null;

    // If the ID has changed (even if to null)
    if (currentId !== lastDeviceIdRef.current) {
      // 1. Stop any active monitoring
      if (managerRef.current) {
        managerRef.current.stopMonitoring();
      }

      // 2. Reset local states IMMEDIATELY
      setState("idle");

      setProximityData(null);
      setError(null);

      // 3. Update the reference for the last ID
      lastDeviceIdRef.current = currentId;
    }
  }, [selectedDevice?.id]);

  return {
    // State
    state,
    proximityData,
    error,

    // Device
    deviceId: selectedDevice?.id ?? null,
    deviceName: selectedDevice?.name ?? null,

    // Actions
    startMonitoring,
    stopMonitoring,

    // Config
    config,
    updateConfig,

    // Meta
    isMonitoring: state === "monitoring",
    isRttActive: false,
  };
}

export { useProximity };
