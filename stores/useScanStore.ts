/**
 * Store Zustand for global Scan and Proximity management
 *
 * ⚡ OPTIMIZATIONS:
 * - Simple selectors to avoid re-renders
 * - Actions extracted directly
 * - Minimum state required
 */

import type {
  PermissionStatus,
  ScanError,
  ScannedDevice,
  ScanState,
} from "@/services/scan";

import { useMemo } from "react";
import { create } from "zustand";

// Bluetooth Status
type BluetoothState = "on" | "off" | "unauthorized" | "unknown";

// Store Interface
interface ScanStore {
  // ============ DATA ============
  devices: ScannedDevice[];
  selectedDevice: ScannedDevice | null;

  // ============ STATES ============
  state: ScanState;
  isScanning: boolean;
  bluetoothState: BluetoothState;
  permissions: PermissionStatus;
  error: ScanError | null;
  scanDuration: number;

  // ============ METADATA ============
  scanStartedAt: number | null;
  lastDeviceUpdate: number;

  // ============ ACTIONS ============
  setDevices: (devices: ScannedDevice[]) => void;
  updateDevice: (device: ScannedDevice) => void;
  removeDevice: (deviceId: string) => void;
  clearDevices: () => void;
  selectDevice: (device: ScannedDevice | null) => void;
  updateSelectedDeviceRssi: (rssi: number) => void;
  setState: (state: ScanState) => void;
  setScanning: (isScanning: boolean) => void;
  setBluetoothState: (state: BluetoothState) => void;
  setPermissions: (permissions: PermissionStatus) => void;
  setError: (error: ScanError | null) => void;
  setScanDuration: (duration: number) => void;
  startScan: () => void;
  stopScan: () => void;
  reset: () => void;
}

// Initial state
const initialState = {
  devices: [] as ScannedDevice[],
  selectedDevice: null as ScannedDevice | null,
  state: "idle" as ScanState,
  isScanning: false,
  bluetoothState: "unknown" as BluetoothState,
  permissions: {
    bluetooth: "undetermined" as const,
    location: "undetermined" as const,
  },
  error: null as ScanError | null,
  scanDuration: 0,
  scanStartedAt: null as number | null,
  lastDeviceUpdate: 0,
};

// Store Creation
const useScanStore = create<ScanStore>((set, get) => ({
  ...initialState,

  // ============ ACTIONS: DEVICES ============

  setDevices: (devices) =>
    set({
      devices,
      lastDeviceUpdate: Date.now(),
    }),
  updateDevice: (device) =>
    set((state) => {
      const existingIndex = state.devices.findIndex((d) => d.id === device.id);

      let newDevices: ScannedDevice[];
      if (existingIndex >= 0) {
        newDevices = [...state.devices];
        newDevices[existingIndex] = device;
      } else {
        newDevices = [...state.devices, device];
      }

      const newSelectedDevice =
        state.selectedDevice?.id === device.id ? device : state.selectedDevice;

      return {
        devices: newDevices,
        selectedDevice: newSelectedDevice,
        lastDeviceUpdate: Date.now(),
      };
    }),
  removeDevice: (deviceId) =>
    set((state) => {
      const newDevices = state.devices.filter((d) => d.id !== deviceId);
      const newSelectedDevice =
        state.selectedDevice?.id === deviceId ? null : state.selectedDevice;

      return {
        devices: newDevices,
        selectedDevice: newSelectedDevice,
        lastDeviceUpdate: Date.now(),
      };
    }),
  clearDevices: () =>
    set({
      devices: [],
      lastDeviceUpdate: Date.now(),
    }),

  // ============ ACTIONS: PROXIMITY ============

  selectDevice: (device) =>
    set({
      selectedDevice: device,
    }),
  updateSelectedDeviceRssi: (rssi) =>
    set((state) => {
      if (!state.selectedDevice) return state;

      const updatedDevice: ScannedDevice = {
        ...state.selectedDevice,
        rssi: {
          ...state.selectedDevice.rssi,
          raw: rssi,
          smoothed: rssi,
          lastUpdated: Date.now(),
        },
        lastSeen: Date.now(),
      };

      const deviceIndex = state.devices.findIndex(
        (d) => d.id === state.selectedDevice!.id,
      );

      let newDevices = state.devices;
      if (deviceIndex >= 0) {
        newDevices = [...state.devices];
        newDevices[deviceIndex] = updatedDevice;
      }

      return {
        selectedDevice: updatedDevice,
        devices: newDevices,
        lastDeviceUpdate: Date.now(),
      };
    }),

  // ============ ACTIONS: STATES ============

  setState: (state) => set({ state }),
  setScanning: (isScanning) => set({ isScanning }),
  setBluetoothState: (bluetoothState) => set({ bluetoothState }),
  setPermissions: (permissions) => set({ permissions }),
  setError: (error) => set({ error }),
  setScanDuration: (scanDuration) => set({ scanDuration }),
  startScan: () =>
    set({
      isScanning: true,
      scanStartedAt: Date.now(),
      scanDuration: 0,
      error: null,
    }),
  stopScan: () =>
    set({
      isScanning: false,
      scanStartedAt: null,
    }),
  reset: () =>
    set({
      ...initialState,
      permissions: get().permissions,
      bluetoothState: get().bluetoothState,
      selectedDevice: get().selectedDevice,
    }),
}));

// ============ SIMPLE SELECTORS ============

/**
 * Hook to get devices
 */
function useDevices(): ScannedDevice[] {
  return useScanStore((state) => state.devices);
}

/**
 * Hook to get selected device
 */
function useSelectedDevice(): ScannedDevice | null {
  return useScanStore((state) => state.selectedDevice);
}

/**
 * Hook to obtain scanning state
 */
function useIsScanning(): boolean {
  return useScanStore((state) => state.isScanning);
}

/**
 * Hook to obtain Bluetooth status
 */
function useBluetoothState(): BluetoothState {
  return useScanStore((state) => state.bluetoothState);
}

/**
 * Hook to obtain device count
 */
function useDeviceCount(): number {
  return useScanStore((state) => state.devices.length);
}

/**
 * Hook to get only BLE devices
 */
function useBleDevices(): ScannedDevice[] {
  const devices = useDevices();
  return useMemo(() => devices.filter((d) => d.type === "ble"), [devices]);
}

/**
 * Hook to obtain permissions
 */
function usePermissions(): PermissionStatus {
  return useScanStore((state) => state.permissions);
}

export {
  BluetoothState,
  useBleDevices,
  useBluetoothState,
  useDeviceCount,
  useDevices,
  useIsScanning,
  usePermissions,
  useScanStore,
  useSelectedDevice,
};
