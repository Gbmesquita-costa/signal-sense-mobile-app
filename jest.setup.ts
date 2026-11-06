/**
 * Global Jest setup: mocks for native modules that have no JS fallback.
 *
 * jest-expo already mocks the Expo SDK native modules (haptics, sensors,
 * notifications, location, ...). The mocks below cover the third-party
 * native libraries so services can be imported and tested in Node.
 */

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("@react-native-community/netinfo", () =>
  require("@react-native-community/netinfo/jest/netinfo-mock"),
);

jest.mock("expo-sqlite", () => {
  const db = {
    execAsync: jest.fn(async () => {}),
    runAsync: jest.fn(async () => ({ changes: 0, lastInsertRowId: 0 })),
    getAllAsync: jest.fn(async () => []),
    getFirstAsync: jest.fn(async () => null),
    withTransactionAsync: jest.fn(async (task: () => Promise<void>) => task()),
    closeAsync: jest.fn(async () => {}),
  };

  return { openDatabaseAsync: jest.fn(async () => db) };
});

jest.mock("react-native-ble-plx", () => {
  const BleManager = jest.fn().mockImplementation(() => ({
    state: jest.fn(async () => "PoweredOn"),
    onStateChange: jest.fn(() => ({ remove: jest.fn() })),
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn(async () => {}),
    devices: jest.fn(async () => []),
    cancelDeviceConnection: jest.fn(async () => {}),
    destroy: jest.fn(async () => {}),
  }));

  class BleError extends Error {}

  return {
    BleManager,
    BleError,
    State: {
      Unknown: "Unknown",
      Resetting: "Resetting",
      Unsupported: "Unsupported",
      Unauthorized: "Unauthorized",
      PoweredOff: "PoweredOff",
      PoweredOn: "PoweredOn",
    },
  };
});

jest.mock("react-native-wifi-reborn", () => ({
  __esModule: true,
  default: {
    loadWifiList: jest.fn(async () => []),
    reScanAndLoadWifiList: jest.fn(async () => []),
    getCurrentWifiSSID: jest.fn(async () => ""),
    getBSSID: jest.fn(async () => ""),
    getCurrentSignalStrength: jest.fn(async () => 0),
    getFrequency: jest.fn(async () => 0),
    getIP: jest.fn(async () => ""),
  },
}));

jest.mock("react-native-tcp-socket", () => ({
  __esModule: true,
  default: { createConnection: jest.fn() },
}));

jest.mock("react-native-purchases", () => ({
  __esModule: true,
  default: {
    configure: jest.fn(),
    setLogLevel: jest.fn(),
    addCustomerInfoUpdateListener: jest.fn(),
    getCustomerInfo: jest.fn(async () => ({ entitlements: { active: {} } })),
    getOfferings: jest.fn(async () => ({ current: null })),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(async () => ({ entitlements: { active: {} } })),
  },
  LOG_LEVEL: {
    VERBOSE: "VERBOSE",
    DEBUG: "DEBUG",
    INFO: "INFO",
    WARN: "WARN",
    ERROR: "ERROR",
  },
}));
