/**
 * ScanActiveState
 *
 * ScanActiveState (scanning or with devices)
 */

import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import { AlertCircle } from "lucide-react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import type { ScannedDevice } from "@/services/scan";
import type { DeviceFilters as DeviceFiltersType } from "@/hooks/useDeviceFilters";

import { PremiumGate } from "@/components/premium/PremiumGate";
import { AntiStalkingToggle, StalkerAlertBanner } from "@/components/stalker";

import { DeviceFilters } from "./DeviceFilters";
import { DeviceList } from "./DeviceList";

import { RadarAnimation } from "./RadarAnimation";

interface ScanActiveStateProps {
  isDark: boolean;
  theme: {
    primary: string;
    success: string;
    warning: string;
    error: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    surface: string;
    background: string;
  };
  t: (key: string) => string;
  devices: ScannedDevice[];
  deviceCount: number;
  isScanning: boolean;
  isLoading: boolean;
  statusText: string;
  hasError: boolean;
  errorMessage?: string;
  onRadarPress: () => void;
  customNames: Map<string, string>;
  onSelectDevice: (device: ScannedDevice) => void;
  onLongPressDevice?: (device: ScannedDevice) => void;
  onRetry?: () => void;
  onOpenSettings?: () => void;
  listBottomPadding: number;
  insetBottom: number;
  // Filters (premium)
  filters: DeviceFiltersType;
  updateFilter: <K extends keyof DeviceFiltersType>(
    key: K,
    value: DeviceFiltersType[K],
  ) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  filteredCount: number;
  totalCount: number;
  // Anti-stalking
  antiStalking?: {
    isMonitoring: boolean;
    activeAlertCount: number;
    onToggle: () => void;
    onOpenAlerts: () => void;
  };
}

const ScanActiveState = memo(function ScanActiveState({
  isDark,
  theme,
  t,
  devices,
  deviceCount,
  isScanning,
  isLoading,
  statusText,
  hasError,
  errorMessage,
  customNames,
  onRadarPress,
  onSelectDevice,
  onLongPressDevice,
  onRetry,
  onOpenSettings,
  listBottomPadding,
  insetBottom,
  filters,
  updateFilter,
  resetFilters,
  hasActiveFilters,
  filteredCount,
  totalCount,
  antiStalking,
}: ScanActiveStateProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      className="flex-1"
    >
      {/* Header */}
      <View
        className="px-6 py-5 flex-row 
        items-start justify-between rounded-b-xl"
      >
        <View className="flex-1 pr-3">
          <Text
            className={`text-2xl font-bold ${
              isDark ? "text-text-primary-dark" : "text-text-primary"
            }`}
          >
            {t("scan.title")}
          </Text>
          <Text
            className={`text-sm mt-1 ${
              hasError
                ? "text-error"
                : isDark
                  ? "text-text-secondary-dark"
                  : "text-text-secondary"
            }`}
            numberOfLines={2}
          >
            {statusText}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          {/* Anti-stalking toggle (compact) */}
          {antiStalking && (
            <AntiStalkingToggle
              isMonitoring={antiStalking.isMonitoring}
              activeAlertCount={antiStalking.activeAlertCount}
              onToggle={antiStalking.onToggle}
              isDark={isDark}
              theme={theme}
              t={t}
              compact
            />
          )}

          {/* Device Counter */}
          {deviceCount > 0 && (
            <Animated.View
              entering={FadeIn.duration(200)}
              className={`px-3 py-1 rounded-full ${
                isDark ? "bg-surface-dark" : "bg-surface"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isDark ? "text-text-secondary-dark" : "text-text-secondary"
                }`}
              >
                {deviceCount}
              </Text>
            </Animated.View>
          )}
        </View>
      </View>

      {/* Anti-stalking alert banner */}
      {antiStalking && antiStalking.activeAlertCount > 0 && (
        <StalkerAlertBanner
          alertCount={antiStalking.activeAlertCount}
          onPress={antiStalking.onOpenAlerts}
          isDark={isDark}
          theme={theme}
          t={t}
        />
      )}

      {/* Filters (premium-gated) — only when devices exist */}
      {deviceCount > 0 && (
        <PremiumGate feature="filters">
          <DeviceFilters
            filters={filters}
            updateFilter={updateFilter}
            resetFilters={resetFilters}
            hasActiveFilters={hasActiveFilters}
            filteredCount={filteredCount}
            totalCount={totalCount}
            isDark={isDark}
            theme={theme}
            t={t}
          />
        </PremiumGate>
      )}

      {/* Content area */}
      <View className="flex-1">
        {deviceCount === 0 ? (
          // No devices yet - shows centralized radar
          <View className="flex-1 items-center mt-16 px-6">
            <RadarAnimation
              isScanning={isScanning || isLoading}
              size={200}
              waveScale={2.5}
              onPress={onRadarPress}
              disabled={isLoading || hasError}
            />

            {/* Error message during active scan */}
            {hasError && errorMessage && (
              <Animated.View
                entering={FadeIn.duration(300)}
                className="mt-16 w-full max-w-sm"
              >
                <View
                  className={`p-4 rounded-xl ${
                    isDark ? "bg-surface-dark" : "bg-surface"
                  }`}
                >
                  <View className="flex-row items-center mb-2">
                    <AlertCircle
                      size={20}
                      color={theme.error}
                      strokeWidth={2}
                    />
                    <Text
                      className={`ml-2 font-semibold ${
                        isDark ? "text-text-primary-dark" : "text-text-primary"
                      }`}
                    >
                      {t("scan.error")}
                    </Text>
                  </View>
                  <Text
                    className={`text-sm ${
                      isDark
                        ? "text-text-secondary-dark"
                        : "text-text-secondary"
                    }`}
                  >
                    {errorMessage}
                  </Text>

                  {/* Action buttons */}
                  <View className="flex-row mt-4 gap-3">
                    {onRetry && (
                      <Pressable
                        onPress={onRetry}
                        className="flex-1 py-2 rounded-lg items-center"
                        style={{ backgroundColor: theme.primary }}
                      >
                        <Text className="text-white font-medium">
                          {t("scan.retry")}
                        </Text>
                      </Pressable>
                    )}
                    {onOpenSettings && (
                      <Pressable
                        onPress={onOpenSettings}
                        className={`flex-1 py-2 rounded-lg items-center ${
                          isDark ? "bg-surface-dark" : "bg-gray-200"
                        }`}
                      >
                        <Text
                          className={`font-medium ${
                            isDark
                              ? "text-text-primary-dark"
                              : "text-text-primary"
                          }`}
                        >
                          {t("scan.settings")}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </Animated.View>
            )}
          </View>
        ) : (
          // With devices - list + FAB radar
          <View className="flex-1">
            <DeviceList
              devices={devices}
              isDark={isDark}
              theme={theme}
              t={t}
              customNames={customNames}
              onSelectDevice={onSelectDevice}
              onLongPressDevice={onLongPressDevice}
              bottomPadding={listBottomPadding}
              isLoading={isScanning}
            />
          </View>
        )}
      </View>

      {/* FAB radar when it has devices */}
      {deviceCount > 0 && (
        <Animated.View
          entering={FadeIn.duration(300)}
          className="absolute right-6"
          style={{ bottom: insetBottom + 16 }}
        >
          <RadarAnimation
            isScanning={isScanning || isLoading}
            size={64}
            waveScale={2}
            onPress={onRadarPress}
            disabled={isLoading}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
});

export { ScanActiveState };
