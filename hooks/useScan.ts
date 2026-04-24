/**
 * Hook useScan
 * Main scan orchestrator - BLE only
 *
 * This is the ONLY hook the UI should consume.
 *
 * ⚡ PERFORMANCE OPTIMIZATIONS:
 * - Lazy initialization: BLE only initializes when start() is called
 * - No unnecessary intervals
 * - Optimized callbacks with useCallback
 * - Store as the only source of truth
 * - Optimized selectors
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

import { useDevices, useScanStore } from "@/stores/useScanStore";
import * as Location from "expo-location";

import {
  type PermissionStatus,
  type ScanConfig,
  type ScanError,
  type ScanState,
  type UseScanReturn,
  DEFAULT_SCAN_CONFIG,
  bleManager,
} from "@/services/scan";

import { generateId } from "@/services/database";
import { historyService } from "@/services/history";

import { useBleScan } from "./useBleScan";

function useScan(initialConfig: Partial<ScanConfig> = {}): UseScanReturn {
  // Settings
  const configRef = useRef<ScanConfig>({
    ...DEFAULT_SCAN_CONFIG,
    ...initialConfig,
  });
  const [config, setConfig] = useState(configRef.current);

  // Minimum local state
  const [state, setState] = useState<ScanState>("idle");
  const [error, setError] = useState<ScanError | null>(null);

  const [permissions] = useState<PermissionStatus>({
    bluetooth: "undetermined",
    location: "undetermined",
  });

  // References to avoid re-rendering
  const startTimeRef = useRef<number>(0);
  const locationCheckIntervalRef = useRef<ReturnType<
    typeof setInterval
  > | null>(null);

  const isInitializedRef = useRef(false);

  // Sensor hook
  const bleScan = useBleScan(config);

  // Use store selectors
  const storeDevices = useDevices();

  // Get actions directly from the store
  const storeSetError = useScanStore((s) => s.setError);
  const storeSetState = useScanStore((s) => s.setState);

  const storeStartScan = useScanStore((s) => s.startScan);
  const storeStopScan = useScanStore((s) => s.stopScan);

  const storeSetScanning = useScanStore((s) => s.setScanning);
  const storeClearDevices = useScanStore((s) => s.clearDevices);

  // Start the scan
  const start = useCallback(async () => {
    setError(null);
    setState("initializing");

    storeSetError(null);
    storeSetState("initializing");

    try {
      // Check if location services are enabled (Android)
      if (Platform.OS === "android") {
        const locationEnabled = await Location.hasServicesEnabledAsync();
        if (!locationEnabled) {
          throw {
            code: "LOCATION_OFF",
            message: "",
            recoverable: true,
            action: "enable-location" as const,
          };
        }
      }

      // Lazy initialization: Initializes BLE only when necessary
      if (config.bleEnabled) {
        try {
          if (!isInitializedRef.current) {
            await bleManager.initialize();
            isInitializedRef.current = true;
          }

          const bleState = await bleManager.getState();
          if (bleState !== "powered-on") {
            throw {
              code: "BLUETOOTH_OFF",
              message: "",
              recoverable: true,
              action: "enable-bluetooth" as const,
            };
          }
        } catch (err) {
          if (err && typeof err === "object" && "code" in err) {
            setError(err as ScanError);
            setState("error");

            storeSetError(err as ScanError);
            storeSetState("error");

            return;
          }
        }
      }

      // Start BLE scan
      if (config.bleEnabled) {
        await bleScan.start();
      }

      // Stores timestamp
      startTimeRef.current = Date.now();
      storeStartScan();

      // Location verification with a longer interval (5s)
      if (Platform.OS === "android") {
        locationCheckIntervalRef.current = setInterval(async () => {
          const locationEnabled = await Location.hasServicesEnabledAsync();
          if (!locationEnabled) {
            stop();
            const locationError = {
              code: "LOCATION_OFF",
              message: "",
              recoverable: true,
              action: "enable-location" as const,
            };

            setError(locationError);
            setState("error");

            storeSetError(locationError);
            storeSetState("error");
          }
        }, 5000);
      }

      setState("scanning");
      storeSetState("scanning");

      storeSetScanning(true);
    } catch (err) {
      if (err && typeof err === "object" && "code" in err) {
        setError(err as ScanError);
        storeSetError(err as ScanError);
      } else {
        const unknownError = {
          code: "UNKNOWN",
          message: "Erro desconhecido ao iniciar scan",
          recoverable: true,
          action: "retry" as const,
        };

        setError(unknownError);
        storeSetError(unknownError);
      }

      setState("error");
      storeSetState("error");
    }
  }, [
    config,
    bleScan,
    storeSetError,
    storeSetState,
    storeStartScan,
    storeSetScanning,
  ]);

  // Stop the scan and persist session to history (fire-and-forget)
  const stop = useCallback(() => {
    if (locationCheckIntervalRef.current) {
      clearInterval(locationCheckIntervalRef.current);
      locationCheckIntervalRef.current = null;
    }

    bleScan.stop();

    const finishedAt = Date.now();
    const startedAt = startTimeRef.current;

    const duration = startedAt > 0 ? finishedAt - startedAt : 0;
    const devices = useScanStore.getState().devices;

    // Persist to history DB (fire-and-forget, no await)
    if (startedAt > 0 && devices.length > 0) {
      const sessionId = generateId();

      historyService
        .createSession({
          id: sessionId,
          startedAt,
          finishedAt,
          durationMs: duration,
          deviceCount: devices.length,
        })
        .then(async () => {
          for (const device of devices) {
            try {
              await historyService.upsertDevice({
                id: device.id,
                rawBleId: device.id.replace(/^ble_/, ""),
                deviceName: device.name,
                firstSeen: device.firstSeen,
                lastSeen: device.lastSeen,
                isTracker: device.trackerInfo?.isTracker ?? false,
                trackerType: device.trackerInfo?.type ?? null,
                manufacturerData: device.bleData?.manufacturerData ?? null,
                serviceUuids: device.bleData?.serviceUUIDs ?? [],
              });

              await historyService.addDeviceToSession(sessionId, device.id, {
                min: Math.min(...device.rssi.history, device.rssi.raw),
                max: Math.max(...device.rssi.history, device.rssi.raw),
                avg: device.rssi.smoothed,
                firstSeen: device.firstSeen,
                lastSeen: device.lastSeen,
              });
            } catch {
              // Silently fail per device — don't break the loop
            }
          }
        })
        .catch(() => {
          // Silently fail — history is non-critical
        });
    }

    setState("stopped");
    storeSetState("stopped");

    storeStopScan();
  }, [bleScan, storeSetState, storeStopScan]);

  // Reset everything
  const reset = useCallback(() => {
    if (locationCheckIntervalRef.current) {
      clearInterval(locationCheckIntervalRef.current);
      locationCheckIntervalRef.current = null;
    }

    bleScan.reset();

    setState("idle");
    setError(null);

    startTimeRef.current = 0;

    storeSetState("idle");
    storeSetError(null);

    storeClearDevices();
  }, [bleScan, storeSetState, storeSetError, storeClearDevices]);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<ScanConfig>) => {
    configRef.current = { ...configRef.current, ...newConfig };
    setConfig(configRef.current);
  }, []);

  // Synchronizes sub-scan errors
  useEffect(() => {
    const bleError = bleScan.error;

    if (bleError) {
      setError(bleError);
      storeSetError(bleError);

      if (!bleError.recoverable) {
        setState("error");
        storeSetState("error");
      }
    }
  }, [bleScan.error, storeSetError, storeSetState]);

  // Clears resources upon disassembly
  useEffect(() => {
    return () => {
      if (locationCheckIntervalRef.current) {
        clearInterval(locationCheckIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    state,
    devices: storeDevices,
    bleDevices: bleScan.devices,
    error,
    permissions,

    // Actions
    start,
    stop,
    reset,

    // Settings
    config,
    updateConfig,

    // Metadata
    isScanning: state === "scanning",
    scanDuration: 0, // Calculated by the ScanDuration component
    deviceCount: storeDevices.length,
    bleCount: bleScan.deviceCount,
  };
}

export { useScan };
