import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

import { notificationService } from "@/services/notification";
import { bleManager } from "@/services/scan";

import { stalkerDetectionService } from "./stalker.detection";
import type { AntiStalkingConfig } from "./stalker.types";

import { DEFAULT_ANTI_STALKING_CONFIG } from "./stalker.types";

const BACKGROUND_SCAN_TASK = "ANTI_STALKING_BLE_SCAN";
const CONFIG_STORAGE_KEY = "@signalsense:anti_stalking_config";

/**
 * Register the background task at module level (required by expo-task-manager).
 * This code runs at import time, NOT inside a component.
 */
TaskManager.defineTask(BACKGROUND_SCAN_TASK, async () => {
  try {
    const config = await loadConfig();
    if (!config.enabled) {
      return;
    }

    // Initialize services if needed
    await bleManager.initialize();
    await stalkerDetectionService.initialize();

    // Run a short BLE scan burst and collect devices
    const devices = await runScanBurst(config.scanDurationMs);

    // Feed each device into detection engine
    for (const device of devices) {
      const alert = stalkerDetectionService.processDevice(device);
      if (alert) {
        await notificationService.sendStalkerAlert(alert);
      }
    }

    return;
  } catch {
    return;
  }
});

/** Run a short BLE scan and collect discovered devices */
function runScanBurst(durationMs: number): Promise<
  {
    id: string;
    name: string | null;
    localName: string | null;
    rssi: number;
    manufacturerData: string | null;
    serviceUUIDs: string[] | null;
  }[]
> {
  return new Promise((resolve) => {
    const foundDevices: Map<
      string,
      {
        id: string;
        name: string | null;
        localName: string | null;
        rssi: number;
        manufacturerData: string | null;
        serviceUUIDs: string[] | null;
      }
    > = new Map();

    const timeout = setTimeout(() => {
      bleManager.stopScan();
      resolve(Array.from(foundDevices.values()));
    }, durationMs);

    bleManager
      .startScan(
        { bleAllowDuplicates: false },
        {
          onDeviceFound: (device) => {
            foundDevices.set(device.id, {
              id: device.id,
              name: device.name,
              localName: device.localName,
              rssi: device.rssi?.raw ?? -100,
              manufacturerData: device.manufacturerData,
              serviceUUIDs: device.serviceUUIDs,
            });
          },
          onDeviceUpdated: (device) => {
            foundDevices.set(device.id, {
              id: device.id,
              name: device.name,
              localName: device.localName,
              rssi: device.rssi?.raw ?? -100,
              manufacturerData: device.manufacturerData,
              serviceUUIDs: device.serviceUUIDs,
            });
          },
          onStateChange: () => {},
          onError: () => {
            clearTimeout(timeout);
            bleManager.stopScan();
            resolve(Array.from(foundDevices.values()));
          },
        },
      )
      .catch(() => {
        clearTimeout(timeout);
        resolve([]);
      });
  });
}

/** Start background monitoring */
async function startBackgroundMonitoring(
  config: AntiStalkingConfig,
): Promise<void> {
  await saveConfig(config);

  // Request background location permission (needed for background tasks)
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Background location permission is required");
  }

  // Start location updates which will trigger our background task
  await Location.startLocationUpdatesAsync(BACKGROUND_SCAN_TASK, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: config.scanIntervalMs,
    distanceInterval: 10, // meters
    deferredUpdatesInterval: config.scanIntervalMs,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "Anti-Stalking Active",
      notificationBody: "Monitoring for suspicious trackers",
      notificationColor: "#0B0E11",
    },
  });
}

/** Stop background monitoring */
async function stopBackgroundMonitoring(): Promise<void> {
  const isRegistered =
    await TaskManager.isTaskRegisteredAsync(BACKGROUND_SCAN_TASK);
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_SCAN_TASK);
  }
}

/** Check if background task is registered */
async function isBackgroundMonitoringActive(): Promise<boolean> {
  return TaskManager.isTaskRegisteredAsync(BACKGROUND_SCAN_TASK);
}

/** Persist config to AsyncStorage for background task access */
async function saveConfig(config: AntiStalkingConfig): Promise<void> {
  await AsyncStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}

/** Load config from AsyncStorage */
async function loadConfig(): Promise<AntiStalkingConfig> {
  const stored = await AsyncStorage.getItem(CONFIG_STORAGE_KEY);
  if (!stored) return DEFAULT_ANTI_STALKING_CONFIG;

  try {
    return { ...DEFAULT_ANTI_STALKING_CONFIG, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_ANTI_STALKING_CONFIG;
  }
}

export {
  BACKGROUND_SCAN_TASK,
  isBackgroundMonitoringActive,
  startBackgroundMonitoring,
  stopBackgroundMonitoring,
};
