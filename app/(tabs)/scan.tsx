/**
 * ScanScreen
 * Main screen for scanning BLE devices
 * ⚡ OPTIMIZATIONS:
 * - Componentization: Separate components for each state
 * - Memoization: Memoized callbacks
 * - Lazy loading: Screen loads only when activated
 * - Navigation: Uses context instead of router
 */

import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";

import { Linking, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useScan, useDeviceFilters, useAntiStalking } from "@/hooks";
import { useI18n } from "@/lib/i18n";

import type { ScannedDevice } from "@/services/scan";

import { historyService } from "@/services/history";
import { useScanStore } from "@/stores/useScanStore";

import { useTheme } from "@/theme";
import { useFocusEffect, useRouter } from "expo-router";

import { ScanActiveState, ScanIdleState } from "@/components/scan";
import {
  AntiStalkingToggle,
  StalkerAlertBanner,
  StalkerAlertSheet,
} from "@/components/stalker";

// ==================== Auxiliary Functions ====================

interface ScanState {
  state: string;
  isScanning: boolean;
  error: { code: string; message?: string } | null;
  deviceCount: number;
}

function getStatusText(scan: ScanState, t: (key: string) => string): string {
  switch (scan.state) {
    case "idle":
      // Initial state: shows count if there are devices, otherwise shows disclaimer
      if (scan.deviceCount > 0) {
        return t("scan.states.finished").replace(
          "{count}",
          scan.deviceCount.toString(),
        );
      }
      return t("scan.disclaimer");
    case "initializing":
      return t("scan.states.initializing");
    case "checking-permissions":
      return t("scan.states.checkingPermissions");
    case "requesting-permissions":
      return t("scan.states.requestingPermissions");
    case "checking-bluetooth":
      return t("scan.states.checkingBluetooth");
    case "scanning":
      if (scan.deviceCount > 0) {
        return t("scan.states.foundDevices").replace(
          "{count}",
          scan.deviceCount.toString(),
        );
      }
      return t("scan.states.scanning");
    case "stopped":
      // Scan stopped by user: shows count if there are devices
      if (scan.deviceCount > 0) {
        return t("scan.states.finished").replace(
          "{count}",
          scan.deviceCount.toString(),
        );
      }
      return t("scan.disclaimer");
    case "finished":
      return t("scan.states.finished").replace(
        "{count}",
        scan.deviceCount.toString(),
      );
    case "error":
      if (scan.error) {
        switch (scan.error.code) {
          case "BLUETOOTH_OFF":
            return t("scan.errorMessages.bluetoothOff");
          case "LOCATION_OFF":
            return t("scan.errorMessages.locationOff");
          default:
            return scan.error.message || t("scan.states.error");
        }
      }
      return t("scan.states.error");
    default:
      return t("scan.disclaimer");
  }
}

const ScanScreen = () => {
  const { theme, isDark } = useTheme();
  const { t, locale } = useI18n();

  const insets = useSafeAreaInsets();

  // Main hook - the UI only knows this
  const scan = useScan();

  // Anti-stalking hook
  const antiStalking = useAntiStalking();
  const [alertSheetVisible, setAlertSheetVisible] = useState(false);

  const handleOpenAlertSheet = useCallback(() => {
    setAlertSheetVisible(true);
  }, []);

  const handleCloseAlertSheet = useCallback(() => {
    setAlertSheetVisible(false);
  }, []);

  // Store to select device
  const { selectDevice } = useScanStore();
  const router = useRouter();

  // Custom names from SQLite (loaded on focus + when devices first appear)
  const [customNames, setCustomNames] = useState<Map<string, string>>(
    new Map(),
  );
  const loadCustomNames = useCallback(() => {
    historyService
      .getCustomNames()
      .then(setCustomNames)
      .catch(() => {});
  }, []);

  useFocusEffect(useCallback(() => loadCustomNames(), [loadCustomNames]));

  // Reload custom names when first devices appear (covers cold start DB race)
  const hasLoadedForDevicesRef = useRef(false);
  useEffect(() => {
    if (scan.deviceCount > 0 && !hasLoadedForDevicesRef.current) {
      hasLoadedForDevicesRef.current = true;
      loadCustomNames();
    }
    if (scan.deviceCount === 0) {
      hasLoadedForDevicesRef.current = false;
    }
  }, [scan.deviceCount, loadCustomNames]);

  // Device filters (premium feature) — needs customNames for search/named filter
  const deviceFilters = useDeviceFilters(scan.devices, customNames);

  // ==================== HANDLERS ====================

  // Radar handler (start/stop scan)
  const handleRadarPress = useCallback(async () => {
    if (scan.isScanning) {
      scan.stop();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // If you already have devices, clear them before starting a new scan
      if (scan.deviceCount > 0) {
        scan.reset();
      }

      await scan.start();
    }
  }, [scan]);

  // Retry handler in case of error
  const handleRetry = useCallback(async () => {
    scan.reset();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await scan.start();
  }, [scan]);

  // Handler to open system settings
  const handleOpenSettings = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openSettings();
  }, []);

  // Navigation guard: resets when this screen regains focus (e.g. after modal dismiss)
  const isNavigatingRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      isNavigatingRef.current = false;
    }, []),
  );

  // Handler for opening device profile (long press)
  const handleOpenProfile = useCallback(
    (device: ScannedDevice) => {
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const name = device.name ?? "";
      router.push(`/device/${device.id}?name=${encodeURIComponent(name)}`);
    },
    [router],
  );

  // Handler for selecting device
  const handleSelectDevice = useCallback(
    (device: ScannedDevice) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // For scanning if it is active
      if (scan.isScanning) {
        scan.stop();
      }

      // Select device in store
      selectDevice(device);

      // Navigate to Proximity
      router.push("/(tabs)/proximity");
    },
    [selectDevice, scan, router],
  );

  // ==================== DERIVED STATES ====================

  const isLoading =
    scan.state === "initializing" ||
    scan.state === "checking-permissions" ||
    scan.state === "requesting-permissions" ||
    scan.state === "checking-bluetooth";

  const isIdle = scan.state === "idle" && scan.deviceCount === 0;
  const isActive = !isIdle || scan.deviceCount > 0;

  const statusText = getStatusText(scan, t);
  const listBottomPadding = insets.bottom + 100;

  const errorMessage =
    scan.state === "error" && scan.error
      ? scan.error.code === "BLUETOOTH_OFF"
        ? t("scan.errorMessages.bluetoothOff")
        : scan.error.code === "LOCATION_OFF"
          ? t("scan.errorMessages.locationOff")
          : scan.error.message || t("scan.states.error")
      : undefined;

  // ==================== RENDER ====================

  return (
    <View
      className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background"}`}
    >
      {/* Idle state (before starting) */}
      {isIdle && (
        <>
          {/* Anti-stalking toggle */}
          <View className="mt-4">
            <AntiStalkingToggle
              isMonitoring={antiStalking.isMonitoring}
              activeAlertCount={antiStalking.activeAlerts.length}
              onToggle={antiStalking.toggle}
              isDark={isDark}
              theme={theme}
              t={t}
            />
          </View>

          {/* Alert banner */}
          {antiStalking.activeAlerts.length > 0 && (
            <StalkerAlertBanner
              alertCount={antiStalking.activeAlerts.length}
              onPress={handleOpenAlertSheet}
              isDark={isDark}
              theme={theme}
              t={t}
            />
          )}

          <ScanIdleState
            isDark={isDark}
            theme={theme}
            t={t}
            isLoading={isLoading}
            onRadarPress={handleRadarPress}
          />
        </>
      )}

      {/* Active Status (scanning/loading/with devices) */}
      {isActive && (
        <ScanActiveState
          isDark={isDark}
          theme={theme}
          t={t}
          devices={deviceFilters.filteredDevices}
          deviceCount={scan.deviceCount}
          isScanning={scan.isScanning}
          isLoading={isLoading}
          statusText={statusText}
          hasError={scan.state === "error"}
          errorMessage={errorMessage}
          customNames={customNames}
          onRadarPress={handleRadarPress}
          onSelectDevice={handleSelectDevice}
          onLongPressDevice={handleOpenProfile}
          onRetry={handleRetry}
          onOpenSettings={handleOpenSettings}
          listBottomPadding={listBottomPadding}
          insetBottom={insets.bottom}
          filters={deviceFilters.filters}
          updateFilter={deviceFilters.updateFilter}
          resetFilters={deviceFilters.resetFilters}
          hasActiveFilters={deviceFilters.hasActiveFilters}
          filteredCount={deviceFilters.filteredCount}
          totalCount={deviceFilters.totalCount}
          antiStalking={{
            isMonitoring: antiStalking.isMonitoring,
            activeAlertCount: antiStalking.activeAlerts.length,
            onToggle: antiStalking.toggle,
            onOpenAlerts: handleOpenAlertSheet,
          }}
        />
      )}

      {/* Alert detail sheet */}
      <StalkerAlertSheet
        alerts={antiStalking.activeAlerts}
        visible={alertSheetVisible}
        onDismiss={antiStalking.dismissAlert}
        onTrustDevice={antiStalking.trustDevice}
        onClose={handleCloseAlertSheet}
        isDark={isDark}
        theme={theme}
        t={t}
        locale={locale}
      />
    </View>
  );
};

export default ScanScreen;
