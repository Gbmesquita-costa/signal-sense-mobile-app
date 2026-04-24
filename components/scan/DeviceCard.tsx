/**
 * DeviceCard
 * Component to display a detected BLE device in the scan list
 * ⚡ OPTIMIZATIONS:
 * - Memoized with React.memo
 * - Memoized callbacks
 * - NO entry animation (conflicts with FlashList recycling)
 */

import { memo } from "react";

import { Bluetooth, ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import type { ScannedDevice } from "@/services/scan";

import { SignalBars } from "./SignalBars";
import { TrackerBadge } from "./TrackerBadge";

interface DeviceCardProps {
  device: ScannedDevice;
  isDark: boolean;
  isPremium: boolean;
  customName?: string;
  theme: {
    primary: string;
    success: string;
    warning: string;
    error: string;
  };
  t: (key: string) => string;
  onPress?: () => void;
  onLongPress?: () => void;
}

const DeviceCard = memo(function DeviceCard({
  device,
  isDark,
  isPremium,
  customName,
  theme,
  t,
  onPress,
  onLongPress,
}: DeviceCardProps) {

  // Display name: customName (SQLite) > BLE name > localName > fallback
  const displayName =
    customName ||
    device.name ||
    device.bleData?.localName ||
    `${t("common.unknownDevice")} (${device.id.replace(/^ble_/, "").slice(-5).toUpperCase()})`;

  // Color based on signal intensity
  const signalColor =
    device.rssi.strength === "strong"
      ? theme.success
      : device.rssi.strength === "medium"
        ? theme.warning
        : theme.error;

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
      <View
        className={`p-4 rounded-xl ${isDark ? "bg-surface-dark" : "bg-surface"}`}
      >
        <View className="flex-row items-center">
          {/* Type icon */}
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${theme.primary}20` }}
          >
            <Bluetooth size={20} color={theme.primary} strokeWidth={2} />
          </View>

          {/* Device info */}
          <View className="flex-1">
            <Text
              className={`font-semibold ${
                isDark ? "text-text-primary-dark" : "text-text-primary"
              }`}
              numberOfLines={1}
            >
              {displayName}
            </Text>

            <View className="flex-row items-center mt-0.5 gap-1.5">
              <Text
                className={`text-xs ${
                  isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
                }`}
              >
                Bluetooth • {device.rssi.smoothed} dBm
              </Text>

              {device.trackerInfo?.isTracker && (
                <TrackerBadge
                  type={isPremium ? (device.trackerInfo.type ?? null) : null}
                  brand={isPremium ? (device.trackerInfo.brand ?? null) : null}
                  confidence={device.trackerInfo.confidence}
                  isDark={isDark}
                />
              )}
            </View>
          </View>

          {/* Signal indicator */}
          <View className="items-end mr-2">
            <SignalBars strength={device.rssi.strength} color={signalColor} />
            <Text
              className={`text-xs mt-1 ${
                isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
              }`}
            >
              {t(`scan.signalStrength.${device.rssi.strength}`)}
            </Text>
          </View>

          {/* Arrow icon */}
          <ChevronRight
            size={20}
            color={isDark ? "#9CA3AF" : "#6B7280"}
            strokeWidth={2}
          />
        </View>
      </View>
    </Pressable>
  );
});

export { DeviceCard };
