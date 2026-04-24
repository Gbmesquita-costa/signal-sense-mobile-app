/**
 * Hook useBleScan
 * Encapsulates BLE scan logic for use in React components
 *
 * ⚡ PERFORMANCE OPTIMIZATIONS:
 * - Lazy initialization: BLE only initializes when start() is called
 * - Removed duplicate local state (only uses store)
 * - Optimized callbacks with useCallback
 * - No automatic initialization useEffect
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

import {
  bleManager,
  type BleDevice,
  type BleState,
  type ScanConfig,
  type ScanError,
  type ScannedDevice,
} from "@/services/scan";

import { stalkerDetectionService } from "@/services/stalker";
import { trackerDetector } from "@/services/tracker";

import { notificationService } from "@/services/notification";
import { useAntiStalkingStore } from "@/stores/useAntiStalkingStore";

import { useScanStore } from "@/stores/useScanStore";

interface UseBleScanReturn {
  // State
  devices: BleDevice[];
  bleState: BleState;
  isScanning: boolean;
  error: ScanError | null;

  // Actions
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;

  // Metadata
  deviceCount: number;
}

function useBleScan(config: Partial<ScanConfig> = {}): UseBleScanReturn {
  // Get the updateDevice function directly from the store
  const updateStoreDevice = useScanStore((state) => state.updateDevice);

  const [bleState, setBleState] = useState<BleState>("unknown");
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const [error, setError] = useState<ScanError | null>(null);
  const appState = useRef(AppState.currentState);

  const wasScanning = useRef(false);
  const isInitializedRef = useRef(false);

  // Local cache of BLE devices
  const bleDevicesRef = useRef<BleDevice[]>([]);

  // Cleanup upon disassembly
  useEffect(() => {
    return () => {
      if (isScanning) {
        bleManager.stopScan();
      }
    };
  }, [isScanning]);

  // Manages app state (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // App went to background
      if (
        appState.current === "active" &&
        (nextAppState === "background" || nextAppState === "inactive")
      ) {
        if (isScanning) {
          wasScanning.current = true;
          bleManager.stopScan();
          setIsScanning(false);
        }
      }

      // The app has moved back to the foreground
      if (
        (appState.current === "background" ||
          appState.current === "inactive") &&
        nextAppState === "active"
      ) {
        if (wasScanning.current) {
          wasScanning.current = false;
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [isScanning]);

  // Feed device into anti-stalking detection engine (if enabled)
  const processAntiStalking = useCallback((device: BleDevice) => {
    if (!useAntiStalkingStore.getState().config.enabled) return;

    const alert = stalkerDetectionService.processDevice({
      id: device.id,
      name: device.name,
      localName: device.localName,
      rssi: device.rssi?.raw ?? -100,
      manufacturerData: device.manufacturerData,
      serviceUUIDs: device.serviceUUIDs,
    });

    if (alert) {
      useAntiStalkingStore.getState().addAlert(alert);
      notificationService.sendStalkerAlert(alert);
    }
  }, []);

  // Memoized callbacks
  const handleDeviceFound = useCallback(
    (device: BleDevice) => {
      // Adds to local cache
      bleDevicesRef.current.push(device);

      // Detect if this device is a known tracker
      const tracker = trackerDetector.detect({
        name: device.name,
        localName: device.localName,
        manufacturerData: device.manufacturerData,
        serviceUUIDs: device.serviceUUIDs,
      });

      // Add the device directly from the store
      const scannedDevice: ScannedDevice = {
        id: `ble_${device.id}`,
        type: "ble" as const,
        name: device.name || device.localName,
        rssi: device.rssi,
        firstSeen: device.firstSeen,
        lastSeen: device.lastSeen,
        bleData: {
          localName: device.localName,
          isConnectable: device.isConnectable,
          serviceUUIDs: device.serviceUUIDs,
          manufacturerData: device.manufacturerData,
        },
        trackerInfo: tracker.isTracker ? tracker : undefined,
      };

      updateStoreDevice(scannedDevice);
      processAntiStalking(device);
    },
    [updateStoreDevice, processAntiStalking],
  );

  const handleDeviceUpdated = useCallback(
    (device: BleDevice) => {
      // Updates in local cache
      const index = bleDevicesRef.current.findIndex((d) => d.id === device.id);

      if (index >= 0) {
        bleDevicesRef.current[index] = device;
      }

      // Detect if this device is a known tracker
      const tracker = trackerDetector.detect({
        name: device.name,
        localName: device.localName,
        manufacturerData: device.manufacturerData,
        serviceUUIDs: device.serviceUUIDs,
      });

      // Update your device directly from the store
      const scannedDevice: ScannedDevice = {
        id: `ble_${device.id}`,
        type: "ble" as const,
        name: device.name || device.localName,
        rssi: device.rssi,
        firstSeen: device.firstSeen,
        lastSeen: device.lastSeen,
        bleData: {
          localName: device.localName,
          isConnectable: device.isConnectable,
          serviceUUIDs: device.serviceUUIDs,
          manufacturerData: device.manufacturerData,
        },
        trackerInfo: tracker.isTracker ? tracker : undefined,
      };

      updateStoreDevice(scannedDevice);
      processAntiStalking(device);
    },
    [updateStoreDevice, processAntiStalking],
  );

  const handleStateChange = useCallback((state: BleState) => {
    setBleState(state);
  }, []);

  const handleError = useCallback((err: ScanError) => {
    setError(err);
    if (!err.recoverable) {
      setIsScanning(false);
    }
  }, []);

  // Start the scan
  const start = useCallback(async () => {
    setError(null);
    bleDevicesRef.current = [];

    try {
      // Lazy initialization: Initializes BLE only when necessary
      if (!isInitializedRef.current) {
        await bleManager.initialize();
        const state = await bleManager.getState();

        setBleState(state);
        isInitializedRef.current = true;
      }

      await bleManager.startScan(config, {
        onDeviceFound: handleDeviceFound,
        onDeviceUpdated: handleDeviceUpdated,
        onStateChange: handleStateChange,
        onError: handleError,
      });

      setIsScanning(true);
    } catch (err) {
      if (err && typeof err === "object" && "code" in err) {
        setError(err as ScanError);
      } else {
        setError({
          code: "UNKNOWN",
          message: "Erro desconhecido ao iniciar scan BLE",
          recoverable: true,
          action: "retry",
        });
      }
    }
  }, [
    config,
    handleDeviceFound,
    handleDeviceUpdated,
    handleStateChange,
    handleError,
  ]);

  // For the scan
  const stop = useCallback(() => {
    bleManager.stopScan();
    setIsScanning(false);
  }, []);

  // Reset status
  const reset = useCallback(() => {
    bleManager.stopScan();
    bleManager.clearDevices();

    bleDevicesRef.current = [];

    setIsScanning(false);
    setError(null);
  }, []);

  return {
    devices: bleDevicesRef.current,
    bleState,
    isScanning,
    error,
    start,
    stop,
    reset,
    deviceCount: bleDevicesRef.current.length,
  };
}

export { useBleScan, UseBleScanReturn };
