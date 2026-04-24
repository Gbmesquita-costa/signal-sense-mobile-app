/**
 * BLE Manager
 * Manages Bluetooth Low Energy device scans using react-native-ble-plx
 *
 * Responsibilities:
 * - BleManager initialization
 * - Permission verification
 * - Scan start/stop
 * - Management of found devices
 * - Error handling
 *
 * ⚡ PERFORMANCE OPTIMIZATIONS:
 * - Update throttle per device (500ms)
 * - Batch processing of devices
 * - Callback debounce
 */

import * as ExpoDevice from "expo-device";
import { PermissionsAndroid, Platform } from "react-native";

import { BleError, BleManager, Device, State } from "react-native-ble-plx";

import { rssiProcessor } from "./rssi.processor";
import type { BleDevice, ScanConfig, ScanError } from "./scan.types";

type BleState =
  | "unknown"
  | "resetting"
  | "unsupported"
  | "unauthorized"
  | "powered-off"
  | "powered-on";

interface BleManagerCallbacks {
  onDeviceFound?: (device: BleDevice) => void;
  onDeviceUpdated?: (device: BleDevice) => void;
  onStateChange?: (state: BleState) => void;
  onError?: (error: ScanError) => void;
}

class BleManagerService {
  private manager: BleManager | null = null;
  private devices: Map<string, BleDevice> = new Map();

  private isScanning: boolean = false;
  private callbacks: BleManagerCallbacks = {};

  private stateSubscription: { remove: () => void } | null = null;

  // ⚡ OPTIMIZATION: Throttle updates by device
  private deviceUpdateThrottle: Map<string, number> = new Map();
  private readonly THROTTLE_MS = 500; // Maximum 2 updates per second per device

  // ⚡ OPTIMIZATION: Batch processing
  private pendingUpdates: Map<string, Device> = new Map();
  private batchProcessTimer: any = null;

  private readonly BATCH_INTERVAL_MS = 100; // Processes batches every 100ms

  // Cooldown to prevent race conditions on rapid start/stop
  private lastStopTime = 0;
  private readonly SCAN_COOLDOWN_MS = 300;

  /**
   * Initializes BleManager
   * Must be called before any operation
   */
  async initialize(): Promise<void> {
    if (this.manager) {
      return; // Already initialized
    }

    // Check if we are on a real device
    if (!ExpoDevice.isDevice) {
      throw this.createError(
        "NOT_PHYSICAL_DEVICE",
        "BLE só funciona em dispositivos físicos, não em emuladores",
        false,
      );
    }

    this.manager = new BleManager();

    // Listens for Bluetooth state changes
    this.stateSubscription = this.manager.onStateChange((state) => {
      const mappedState = this.mapBleState(state);
      this.callbacks.onStateChange?.(mappedState);
    }, true);
  }

  /**
   * Destroy the manager and clear resources
   */
  destroy(): void {
    this.stopScan();

    this.stateSubscription?.remove();
    this.manager?.destroy();

    this.manager = null;
    this.devices.clear();

    this.deviceUpdateThrottle.clear();
    this.pendingUpdates.clear();

    if (this.batchProcessTimer) {
      clearTimeout(this.batchProcessTimer);
      this.batchProcessTimer = null;
    }
  }

  /**
   * Returns the current Bluetooth state
   */
  async getState(): Promise<BleState> {
    if (!this.manager) {
      return "unknown";
    }

    const state = await this.manager.state();
    return this.mapBleState(state);
  }

  /**
   * Checks and requests necessary permissions
   * Returns an object indicating whether permissions were granted and if it was the first grant
   */
  async requestPermissions(): Promise<{
    granted: boolean;
    justGranted: boolean;
  }> {
    if (Platform.OS === "android") {
      let justGranted = false;

      // Android 12+ (API 31+) requires BLUETOOTH_SCAN and BLUETOOTH_CONNECT
      if (Platform.Version >= 31) {
        // Check if you already have permission before requesting
        const hadScanPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        );

        const scanPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          {
            title: "Permissão de Bluetooth",
            message:
              "SignalSense precisa de permissão para escanear dispositivos Bluetooth",
            buttonPositive: "Permitir",
            buttonNegative: "Negar",
          },
        );

        const connectPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          {
            title: "Permissão de Bluetooth",
            message:
              "SignalSense precisa de permissão para conectar a dispositivos Bluetooth",
            buttonPositive: "Permitir",
            buttonNegative: "Negar",
          },
        );

        if (
          scanPermission !== PermissionsAndroid.RESULTS.GRANTED ||
          connectPermission !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          return { granted: false, justGranted: false };
        }

        // Detects if it was the first concession
        if (
          !hadScanPermission &&
          scanPermission === PermissionsAndroid.RESULTS.GRANTED
        ) {
          justGranted = true;
        }
      }

      // Check if you already have location permission
      const hadLocationPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      // All versions require localization for BLE scan
      const locationPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Permissão de Localização",
          message:
            "SignalSense precisa de permissão de localização para detectar dispositivos Bluetooth próximos",
          buttonPositive: "Permitir",
          buttonNegative: "Negar",
        },
      );

      const granted = locationPermission === PermissionsAndroid.RESULTS.GRANTED;

      // Detects if it was the first location concession
      if (
        !hadLocationPermission &&
        locationPermission === PermissionsAndroid.RESULTS.GRANTED
      ) {
        justGranted = true;
      }

      return { granted, justGranted };
    }

    // iOS: permissions are requested automatically by the system
    return { granted: true, justGranted: false };
  }

  /**
   * Check if Bluetooth is turned on.
   */
  async isBluetoothEnabled(): Promise<boolean> {
    const state = await this.getState();
    return state === "powered-on";
  }

  /**
   * Start scanning BLE devices
   */
  async startScan(
    config: Partial<ScanConfig> = {},
    callbacks: BleManagerCallbacks = {},
  ): Promise<void> {
    if (!this.manager) {
      await this.initialize();
    }

    // Force stop any existing scan to prevent stale state
    if (this.isScanning) {
      this.forceStopScan();
    }

    // Wait for cooldown after a recent stop to let BLE stack settle
    const timeSinceStop = Date.now() - this.lastStopTime;
    if (timeSinceStop < this.SCAN_COOLDOWN_MS) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.SCAN_COOLDOWN_MS - timeSinceStop),
      );
    }

    // Check Bluetooth status
    const state = await this.getState();
    if (state !== "powered-on") {
      throw this.createError(
        "BLUETOOTH_OFF",
        "Bluetooth está desligado. Ligue o Bluetooth para continuar.",
        true,
        "enable-bluetooth",
      );
    }

    // Check permissions
    const permissionResult = await this.requestPermissions();
    if (!permissionResult.granted) {
      throw this.createError(
        "PERMISSION_DENIED",
        "Permissões de Bluetooth negadas",
        true,
        "grant-permissions",
      );
    }

    // If permission has been granted now, please wait for the system to process it
    if (permissionResult.justGranted) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    this.callbacks = callbacks;
    this.isScanning = true;

    this.devices.clear();
    this.deviceUpdateThrottle.clear();

    this.pendingUpdates.clear();

    // ⚡ OPTIMIZATION: Starts batch processor
    this.startBatchProcessor();

    // Start the scan
    this.manager!.startDeviceScan(
      null, // All UUIDs
      {
        // ⚡ OPTIMIZATION: Keeps allowDuplicates but processes in batch
        allowDuplicates: config.bleAllowDuplicates ?? true,
      },
      (error, device) => {
        if (error) {
          this.handleScanError(error);
          return;
        }

        if (device) {
          // ⚡ OPTIMIZATION: Add to batch instead of processing immediately
          this.addToBatch(device);
        }
      },
    );

    // If configured, to scan after duration
    if (config.bleScanDuration && config.bleScanDuration > 0) {
      setTimeout(() => {
        this.stopScan();
      }, config.bleScanDuration);
    }
  }

  /**
   * Stop the scan gracefully
   */
  stopScan(): void {
    this.forceStopScan();
  }

  /**
   * Force stop — always safe to call, even if not scanning.
   * Records stop time for cooldown enforcement.
   */
  private forceStopScan(): void {
    if (this.batchProcessTimer) {
      clearTimeout(this.batchProcessTimer);
      this.batchProcessTimer = null;
    }

    // Always call stopDeviceScan on the native manager to ensure clean state
    if (this.manager) {
      try {
        this.manager.stopDeviceScan();
      } catch {
        // Ignore — may throw if not scanning
      }
    }

    if (this.isScanning) {
      this.processBatch();
    }

    this.isScanning = false;
    this.pendingUpdates.clear();
    this.lastStopTime = Date.now();
  }

  /**
   * Returns found devices
   */
  getDevices(): BleDevice[] {
    return Array.from(this.devices.values());
  }

  /**
   * Returns a specific device
   */
  getDevice(id: string): BleDevice | undefined {
    return this.devices.get(id);
  }

  /**
   * Clear device list
   */
  clearDevices(): void {
    this.devices.clear();
    this.deviceUpdateThrottle.clear();

    this.pendingUpdates.clear();
  }

  /**
   * Check if it's scanning
   */
  getIsScanning(): boolean {
    return this.isScanning;
  }

  /**
   * Register callbacks
   */
  setCallbacks(callbacks: BleManagerCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Resolve device name using every available strategy:
   *
   * Phase 1 — No connection needed (instant):
   *  1. System BLE cache via manager.devices()
   *
   * Phase 2 — Direct GATT connection:
   *  2. Device name from connectToDevice response
   *  3. GAP Device Name (0x2A00)
   *  4. Device Information Service (0x180A): Model Number, Manufacturer Name
   *  5. Scan all readable characteristics for name-like strings
   *
   * Phase 3 — autoConnect fallback (for devices that reject direct connections):
   *  6. Same steps 2-5 but using autoConnect: true
   *
   * Throws typed errors for specific failure modes
   */
  async resolveDeviceName(rawBleId: string): Promise<string | null> {
    if (!this.manager) {
      await this.initialize();
    }

    // === PHASE 1: Try system BLE cache (no connection needed) ===
    try {
      const [cached] = await this.manager!.devices([rawBleId]);
      const cachedName = cached?.name || cached?.localName;
      if (cachedName?.trim()) {
        return cachedName.trim();
      }
    } catch {
      // Cache miss — continue to connection strategies
    }

    // === PHASE 2: Direct connection (fast — 8s timeout) ===
    const directResult = await this.tryConnectAndReadName(rawBleId, 8_000, false);
    if (directResult.name) return directResult.name;

    // If direct connection succeeded but no name found, don't retry with autoConnect
    if (directResult.connected) {
      return null;
    }

    // === PHASE 3: autoConnect fallback (slower — for stubborn devices) ===
    // autoConnect uses Android's background connection mechanism, which is
    // more reliable for devices that reject direct BLE connections (e.g.
    // Classic Bluetooth headphones that also advertise via BLE)
    if (Platform.OS === "android") {
      const autoResult = await this.tryConnectAndReadName(rawBleId, 10_000, true);
      if (autoResult.name) return autoResult.name;
      if (autoResult.connected) return null;
    }

    // All strategies exhausted
    throw new Error("CONNECTION_TIMEOUT");
  }

  /**
   * Attempt to connect and read device name via GATT
   * Returns { name, connected } — connected indicates if connection succeeded
   */
  private async tryConnectAndReadName(
    rawBleId: string,
    timeoutMs: number,
    autoConnect: boolean,
  ): Promise<{ name: string | null; connected: boolean }> {
    let connected = false;

    try {
      // Connect with external timeout (avoid react-native-ble-plx native crash)
      const device = await Promise.race([
        this.manager!.connectToDevice(rawBleId, { autoConnect }),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("CONNECTION_TIMEOUT")),
            timeoutMs,
          ),
        ),
      ]);
      connected = true;

      // Check name from connection response (system cache)
      const responseName = device?.name || device?.localName;
      if (responseName?.trim()) {
        return { name: responseName.trim(), connected: true };
      }

      // Discover GATT services
      try {
        await this.manager!.discoverAllServicesAndCharacteristicsForDevice(
          rawBleId,
        );
      } catch {
        return { name: null, connected: true };
      }

      // Try GAP Device Name (0x2A00)
      const GAP_SERVICE = "00001800-0000-1000-8000-00805f9b34fb";
      const DEVICE_NAME_CHAR = "00002a00-0000-1000-8000-00805f9b34fb";
      const gapName = await this.tryReadCharacteristic(rawBleId, GAP_SERVICE, DEVICE_NAME_CHAR);
      if (gapName) return { name: gapName, connected: true };

      // Try Device Information Service (0x180A)
      const DIS_SERVICE = "0000180a-0000-1000-8000-00805f9b34fb";
      const MODEL_CHAR = "00002a24-0000-1000-8000-00805f9b34fb";
      const MFG_CHAR = "00002a29-0000-1000-8000-00805f9b34fb";

      const modelName = await this.tryReadCharacteristic(rawBleId, DIS_SERVICE, MODEL_CHAR);
      if (modelName) return { name: modelName, connected: true };

      const mfgName = await this.tryReadCharacteristic(rawBleId, DIS_SERVICE, MFG_CHAR);
      if (mfgName) return { name: mfgName, connected: true };

      // Scan all readable characteristics
      const foundName = await this.tryFindNameInServices(rawBleId);
      if (foundName) return { name: foundName, connected: true };

      return { name: null, connected: true };
    } catch {
      return { name: null, connected: false };
    } finally {
      if (connected && this.manager) {
        try {
          await Promise.race([
            this.manager.cancelDeviceConnection(rawBleId),
            new Promise((resolve) => setTimeout(resolve, 3_000)),
          ]);
        } catch {
          // Ignore disconnect errors
        }
      }
    }
  }

  /**
   * Safely read a single GATT characteristic, returning decoded string or null
   */
  private async tryReadCharacteristic(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
  ): Promise<string | null> {
    try {
      const char = await this.manager!.readCharacteristicForDevice(
        deviceId,
        serviceUUID,
        characteristicUUID,
      );
      if (!char.value) return null;
      const decoded = atob(char.value).trim();
      // Filter out garbage/binary data — valid names are printable ASCII or UTF-8
      if (decoded && /^[\x20-\x7E\u00C0-\u024F\u4E00-\u9FFF]+$/.test(decoded)) {
        return decoded;
      }
      // Fallback: if it has at least some printable chars
      const printable = decoded.replace(/[^\x20-\x7E\u00C0-\u024F]/g, "").trim();
      return printable.length >= 2 ? printable : null;
    } catch {
      return null;
    }
  }

  /**
   * Scan all discovered services for characteristics that might contain the device name
   */
  private async tryFindNameInServices(
    deviceId: string,
  ): Promise<string | null> {
    try {
      const services = await this.manager!.servicesForDevice(deviceId);
      for (const service of services) {
        const chars =
          await this.manager!.characteristicsForDevice(deviceId, service.uuid);
        for (const char of chars) {
          if (!char.isReadable) continue;
          try {
            const read = await this.manager!.readCharacteristicForDevice(
              deviceId,
              service.uuid,
              char.uuid,
            );
            if (!read.value) continue;
            const decoded = atob(read.value).trim();
            // Heuristic: looks like a device name (3-30 printable chars, no binary)
            if (
              decoded.length >= 3 &&
              decoded.length <= 30 &&
              /^[\x20-\x7E\u00C0-\u024F\u4E00-\u9FFF\s]+$/.test(decoded)
            ) {
              return decoded;
            }
          } catch {
            continue;
          }
        }
      }
    } catch {
      // Failed to enumerate services
    }
    return null;
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * ⚡ OPTIMIZATION: Add device to batch for processing
   */
  private addToBatch(device: Device): void {
    this.pendingUpdates.set(device.id, device);
  }

  /**
   * ⚡ OPTIMIZATION: Starts batch processor
   */
  private startBatchProcessor(): void {
    if (this.batchProcessTimer) {
      return;
    }

    const processBatchLoop = () => {
      if (!this.isScanning) {
        return;
      }

      this.processBatch();
      this.batchProcessTimer = setTimeout(
        processBatchLoop,
        this.BATCH_INTERVAL_MS,
      );
    };

    this.batchProcessTimer = setTimeout(
      processBatchLoop,
      this.BATCH_INTERVAL_MS,
    );
  }

  /**
   * ⚡ OPTIMIZATION: Batch processing of devices
   */
  private processBatch(): void {
    if (this.pendingUpdates.size === 0) {
      return;
    }

    const now = Date.now();
    const devicesToProcess: Device[] = [];

    // Filters devices that should be processed (respecting throttle)
    for (const [deviceId, device] of this.pendingUpdates.entries()) {
      const lastUpdate = this.deviceUpdateThrottle.get(deviceId) || 0;

      // ⚡ OPTIMIZATION: Only processes if enough time has passed since the last update
      if (now - lastUpdate >= this.THROTTLE_MS) {
        devicesToProcess.push(device);
        this.deviceUpdateThrottle.set(deviceId, now);
      }
    }

    // Clear pending updates
    this.pendingUpdates.clear();

    // Processes filtered devices
    for (const device of devicesToProcess) {
      this.handleDeviceDiscovered(device);
    }
  }

  private handleDeviceDiscovered(device: Device): void {
    const existingDevice = this.devices.get(device.id);
    const now = Date.now();

    if (existingDevice) {
      // Update existing device
      const updatedDevice: BleDevice = {
        ...existingDevice,
        name: device.name ?? existingDevice.name,
        localName: device.localName ?? existingDevice.localName,
        rssi: rssiProcessor.update(existingDevice.rssi, device.rssi ?? -100),
        isConnectable: device.isConnectable ?? existingDevice.isConnectable,
        serviceUUIDs: device.serviceUUIDs ?? existingDevice.serviceUUIDs,
        manufacturerData:
          device.manufacturerData ?? existingDevice.manufacturerData,
        lastSeen: now,
      };

      this.devices.set(device.id, updatedDevice);
      this.callbacks.onDeviceUpdated?.(updatedDevice);
    } else {
      // New device
      const newDevice: BleDevice = {
        id: device.id,
        name: device.name,
        localName: device.localName,
        rssi: rssiProcessor.createInitial(device.rssi ?? -100),
        isConnectable: device.isConnectable,
        serviceUUIDs: device.serviceUUIDs,
        manufacturerData: device.manufacturerData,
        firstSeen: now,
        lastSeen: now,
      };

      this.devices.set(device.id, newDevice);
      this.callbacks.onDeviceFound?.(newDevice);
    }
  }

  private handleScanError(error: BleError): void {
    const scanError = this.mapBleError(error);
    this.callbacks.onError?.(scanError);

    // For scanning in case of a critical error
    if (!scanError.recoverable) {
      this.stopScan();
    }
  }

  private mapBleState(state: State): BleState {
    const stateMap: Record<State, BleState> = {
      [State.Unknown]: "unknown",
      [State.Resetting]: "resetting",
      [State.Unsupported]: "unsupported",
      [State.Unauthorized]: "unauthorized",
      [State.PoweredOff]: "powered-off",
      [State.PoweredOn]: "powered-on",
    };

    return stateMap[state] ?? "unknown";
  }

  private mapBleError(error: BleError): ScanError {
    // Maps common BLE errors
    const errorCode = error.errorCode;

    if (error.message?.includes("powered off")) {
      return this.createError(
        "BLUETOOTH_OFF",
        "Bluetooth está desligado",
        true,
        "enable-bluetooth",
      );
    }

    if (error.message?.includes("unauthorized")) {
      return this.createError(
        "BLUETOOTH_UNAUTHORIZED",
        "Permissão de Bluetooth negada",
        true,
        "grant-permissions",
      );
    }

    return this.createError(
      `BLE_ERROR_${errorCode}`,
      error.message ?? "Erro desconhecido no Bluetooth",
      true,
      "retry",
    );
  }

  private createError(
    code: string,
    message: string,
    recoverable: boolean,
    action?: ScanError["action"],
  ): ScanError {
    return { code, message, recoverable, action };
  }
}

// Export singleton instance
const bleManager = new BleManagerService();
export { bleManager, BleManagerCallbacks, BleState };
