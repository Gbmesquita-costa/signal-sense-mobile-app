import { create } from "zustand";

import type {
  AntiStalkingConfig,
  AntiStalkingState,
  StalkerAlert,
  TrustedDevice,
} from "@/services/stalker";
import { DEFAULT_ANTI_STALKING_CONFIG } from "@/services/stalker";

interface AntiStalkingStore {
  // State
  state: AntiStalkingState;
  config: AntiStalkingConfig;
  alerts: StalkerAlert[];
  trustedDevices: TrustedDevice[];
  error: string | null;

  // Actions
  setState: (state: AntiStalkingState) => void;
  setConfig: (config: Partial<AntiStalkingConfig>) => void;
  setAlerts: (alerts: StalkerAlert[]) => void;
  addAlert: (alert: StalkerAlert) => void;
  dismissAlert: (alertId: string) => void;
  setTrustedDevices: (devices: TrustedDevice[]) => void;
  addTrustedDevice: (device: TrustedDevice) => void;
  removeTrustedDevice: (deviceId: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const useAntiStalkingStore = create<AntiStalkingStore>((set) => ({
  state: "off",
  config: { ...DEFAULT_ANTI_STALKING_CONFIG },
  alerts: [],
  trustedDevices: [],
  error: null,
  setState: (state) => set({ state }),
  setConfig: (partial) => set((s) => ({ config: { ...s.config, ...partial } })),
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((s) => ({ alerts: [alert, ...s.alerts] })),
  dismissAlert: (alertId) =>
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === alertId ? { ...a, dismissed: true } : a,
      ),
    })),
  setTrustedDevices: (trustedDevices) => set({ trustedDevices }),
  addTrustedDevice: (device) =>
    set((s) => ({ trustedDevices: [...s.trustedDevices, device] })),
  removeTrustedDevice: (deviceId) =>
    set((s) => ({
      trustedDevices: s.trustedDevices.filter((d) => d.deviceId !== deviceId),
    })),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      state: "off",
      alerts: [],
      error: null,
    }),
}));

// Selectors
const useAntiStalkingState = () => useAntiStalkingStore((s) => s.state);
const useAntiStalkingAlerts = () => useAntiStalkingStore((s) => s.alerts);
const useActiveAlerts = () =>
  useAntiStalkingStore((s) => s.alerts.filter((a) => !a.dismissed));
const useIsMonitoring = () =>
  useAntiStalkingStore((s) => s.state === "monitoring");

export {
  useActiveAlerts,
  useAntiStalkingAlerts,
  useAntiStalkingState,
  useAntiStalkingStore,
  useIsMonitoring,
};
