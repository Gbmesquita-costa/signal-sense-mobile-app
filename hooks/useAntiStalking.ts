import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect } from "react";

import { databaseService } from "@/services/database";
import {
  isBackgroundMonitoringActive,
  stalkerDetectionService,
  stalkerRepository,
  startBackgroundMonitoring,
  stopBackgroundMonitoring,
} from "@/services/stalker";
import { useAntiStalkingStore } from "@/stores/useAntiStalkingStore";

import { notificationService } from "@/services/notification";
import type { AntiStalkingConfig } from "@/services/stalker";

const ANTI_STALKING_ENABLED_KEY = "@signalsense:anti_stalking_enabled";

// Module-level guard: the init effect below should run only once per app
// session, not on every hook mount. Otherwise navigating to any screen that
// uses useAntiStalking (settings, device detail, …) re-runs init and clobbers
// the in-memory alerts with whatever the DB currently holds — losing just-
// created alerts that haven't been persisted yet, or wiping everything if the
// DB query happens to fail transiently.
let hasInitialized = false;

function useAntiStalking() {
  const state = useAntiStalkingStore((s) => s.state);
  const config = useAntiStalkingStore((s) => s.config);

  const alerts = useAntiStalkingStore((s) => s.alerts);
  const trustedDevices = useAntiStalkingStore((s) => s.trustedDevices);

  const error = useAntiStalkingStore((s) => s.error);

  const {
    setState,
    setConfig,
    setAlerts,
    dismissAlert: storeDismissAlert,
    setTrustedDevices,
    setError,
  } = useAntiStalkingStore();

  // Load persisted state on mount — but only once per app session.
  useEffect(() => {
    if (hasInitialized) return;
    hasInitialized = true;

    async function init() {
      // Ensure DB is ready — the hook can mount before RootLayout finishes
      // initializing the database. databaseService.initialize() is idempotent.
      try {
        await databaseService.initialize();
      } catch {
        // DB unavailable — continue; AsyncStorage-backed toggle still works
      }

      // Use allSettled so a transient failure in one source doesn't wipe the
      // successful results of the others (e.g. don't clear alerts just
      // because getTrustedDevices() rejected).
      const [alertsResult, trustedResult, activeResult, savedResult] =
        await Promise.allSettled([
          stalkerRepository.getActiveAlerts(),
          stalkerRepository.getTrustedDevices(),
          isBackgroundMonitoringActive(),
          AsyncStorage.getItem(ANTI_STALKING_ENABLED_KEY),
        ]);

      if (alertsResult.status === "fulfilled") {
        setAlerts(alertsResult.value);
      }

      if (trustedResult.status === "fulfilled") {
        setTrustedDevices(trustedResult.value);
      }

      const isActive =
        activeResult.status === "fulfilled" ? activeResult.value : false;
      const savedEnabled =
        savedResult.status === "fulfilled" ? savedResult.value : null;

      // Restore monitoring state from AsyncStorage OR background task
      if (isActive || savedEnabled === "true") {
        setState("monitoring");
        setConfig({ enabled: true });

        try {
          await stalkerDetectionService.initialize();
        } catch {}
        try {
          await notificationService.initialize();
        } catch {}
      }
    }
    init();
  }, []);

  /** Start anti-stalking monitoring (foreground + background) */
  const start = useCallback(async () => {
    setState("starting");
    setError(null);
    try {
      // Initialize detection engine
      await stalkerDetectionService.initialize();

      // Enable foreground detection immediately
      setConfig({ enabled: true });
      setState("monitoring");

      // Persist enabled state
      AsyncStorage.setItem(ANTI_STALKING_ENABLED_KEY, "true").catch(() => {});

      // Initialize notifications (non-blocking — works without permission)
      try {
        await notificationService.initialize();
      } catch {
        // Notifications not available — foreground detection still works
      }

      // Try background monitoring (may fail if permissions denied)
      try {
        const newConfig = { ...config, enabled: true };
        await startBackgroundMonitoring(newConfig);
      } catch {
        // Background failed but foreground still works
        // User gets detection while app is open
      }
    } catch (err) {
      setState("error");
      setConfig({ enabled: false });

      AsyncStorage.setItem(ANTI_STALKING_ENABLED_KEY, "false").catch(() => {});
      setError(
        err instanceof Error
          ? err.message
          : "Failed to start anti-stalking monitoring",
      );
    }
  }, [config, setState, setError, setConfig]);

  /** Stop monitoring */
  const stop = useCallback(async () => {
    try {
      await stopBackgroundMonitoring();
    } catch {
      // Ignore stop errors
    }

    stalkerDetectionService.reset();

    setState("off");
    setConfig({ enabled: false });

    AsyncStorage.setItem(ANTI_STALKING_ENABLED_KEY, "false").catch(() => {});
  }, [setState, setConfig]);

  /** Toggle on/off */
  const toggle = useCallback(async () => {
    if (state === "monitoring") {
      await stop();
    } else if (state !== "starting") {
      await start();
    }
  }, [state, start, stop]);

  /** Dismiss a specific alert */
  const dismissAlert = useCallback(
    async (alertId: string) => {
      const alert = alerts.find((a) => a.id === alertId);
      storeDismissAlert(alertId);

      await stalkerRepository.dismissAlert(alertId).catch(() => {});
      if (alert) {
        stalkerDetectionService.markDismissed(alert.deviceId);
      }
    },
    [alerts, storeDismissAlert],
  );

  /** Trust a device (stop alerting for it + dismiss its alerts) */
  const trustDevice = useCallback(
    async (deviceId: string, name: string | null) => {
      await stalkerDetectionService.trustDevice(deviceId, name);
      const trusted = await stalkerRepository.getTrustedDevices();

      setTrustedDevices(trusted);

      // Dismiss all alerts from this device
      const deviceAlerts = alerts.filter(
        (a) => a.deviceId === deviceId && !a.dismissed,
      );

      for (const alert of deviceAlerts) {
        storeDismissAlert(alert.id);
        stalkerRepository.dismissAlert(alert.id).catch(() => {});
      }
    },
    [alerts, setTrustedDevices, storeDismissAlert],
  );

  /** Untrust a device */
  const untrustDevice = useCallback(
    async (deviceId: string) => {
      await stalkerDetectionService.untrustDevice(deviceId);
      const trusted = await stalkerRepository.getTrustedDevices();

      setTrustedDevices(trusted);
    },
    [setTrustedDevices],
  );

  /** Update config (premium feature) */
  const updateConfig = useCallback(
    async (partial: Partial<AntiStalkingConfig>) => {
      setConfig(partial);
      stalkerDetectionService.setConfig(partial);

      if (state === "monitoring") {
        try {
          await stopBackgroundMonitoring();
          await startBackgroundMonitoring({ ...config, ...partial });
        } catch {
          // Keep running with old config
        }
      }
    },
    [state, config, setConfig],
  );

  const activeAlerts = alerts.filter((a) => !a.dismissed);

  return {
    // State
    state,
    isMonitoring: state === "monitoring",
    alerts,
    activeAlerts,
    trustedDevices,
    config,
    error,

    // Actions
    start,
    stop,
    toggle,
    dismissAlert,
    trustDevice,
    untrustDevice,
    updateConfig,
  };
}

export { useAntiStalking };
