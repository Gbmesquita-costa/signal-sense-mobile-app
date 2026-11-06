import React, { useCallback, useEffect } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { Lock, Radar, RefreshCw, Shield, Wifi } from "lucide-react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { wifiService } from "@/services/wifi/wifi.service";
import type { WifiNetwork } from "@/services/wifi/wifi.types";

import { WifiSignalIndicator } from "./WifiSignalIndicator";

interface WifiNetworkListProps {
  networks: WifiNetwork[];
  isScanning: boolean;
  isDark: boolean;
  theme: {
    primary: string;
    success: string;
    warning: string;
    error: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
  };
  t: (key: string) => string;
  onRefresh: () => void;
  /** Opens the AR Signal Finder for this network. Hidden when omitted. */
  onLocate?: (network: WifiNetwork) => void;
}

const WifiNetworkList = ({
  networks,
  isScanning,
  isDark,
  theme,
  t,
  onRefresh,
  onLocate,
}: WifiNetworkListProps) => {
  // Refresh button rotation animation
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isScanning) {
      rotation.value = withTiming(rotation.value + 360, {
        duration: 800,
        easing: Easing.linear,
      });
    }
  }, [isScanning, rotation]);

  const refreshIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handleRefresh = useCallback(() => {
    if (isScanning) return;
    onRefresh();
  }, [isScanning, onRefresh]);

  // Sort: connected first, then by signal strength
  const sorted = [...networks].sort((a, b) => {
    if (a.isConnected && !b.isConnected) return -1;
    if (!a.isConnected && b.isConnected) return 1;

    return b.rssi - a.rssi;
  });

  return (
    <View
      className={`rounded-2xl ${isDark ? "bg-surface-dark" : "bg-surface"}`}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 pb-2">
        <Text
          className={`text-xs font-bold uppercase ${
            isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
          }`}
        >
          {t("wifi.networks.title")}{" "}
          {!isScanning && networks.length > 0 ? `(${networks.length})` : ""}
        </Text>
        <Pressable
          onPress={handleRefresh}
          disabled={isScanning}
          className="p-1.5 active:opacity-70"
          hitSlop={8}
          style={{ opacity: isScanning ? 0.5 : 1 }}
        >
          <Animated.View style={refreshIconStyle}>
            <RefreshCw size={14} color={theme.textTertiary} strokeWidth={2} />
          </Animated.View>
        </Pressable>
      </View>

      {/* Loading state */}
      {isScanning && sorted.length === 0 ? (
        <View className="px-4 pb-4 items-center gap-2 py-4">
          <ActivityIndicator size="small" color={theme.primary} />
          <Text
            className={`text-xs ${
              isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
            }`}
          >
            {t("wifi.networks.scanning")}
          </Text>
        </View>
      ) : sorted.length === 0 ? (
        /* Empty state */
        <View className="px-4 pb-4">
          <Text
            className={`text-sm text-center ${
              isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
            }`}
          >
            {t("wifi.networks.empty")}
          </Text>
        </View>
      ) : (
        /* Network list */
        sorted.map((net, i) => {
          const quality = wifiService.getSignalQualityFromRssi(net.rssi);
          const color = wifiService.getSignalColor(quality, theme);

          return (
            <View key={`${net.bssid}-${i}`}>
              {i > 0 && (
                <View
                  className={`h-px mx-4 ${isDark ? "bg-border-dark" : "bg-border"}`}
                />
              )}
              <View className="flex-row items-center px-4 py-3">
                {/* Icon */}
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{
                    backgroundColor: net.isConnected
                      ? `${theme.success}20`
                      : `${color}15`,
                  }}
                >
                  <Wifi
                    size={14}
                    color={net.isConnected ? theme.success : color}
                    strokeWidth={2}
                  />
                </View>

                {/* Info */}
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center gap-1.5">
                    <Text
                      className={`text-sm font-semibold ${
                        isDark ? "text-text-primary-dark" : "text-text-primary"
                      }`}
                      numberOfLines={1}
                    >
                      {net.ssid || t("wifi.connection.hidden")}
                    </Text>
                    {net.isConnected && (
                      <View
                        className="px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${theme.success}20` }}
                      >
                        <Text
                          className="text-[9px] font-bold"
                          style={{ color: theme.success }}
                        >
                          {t("wifi.connection.connected")}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View className="flex-row items-center gap-2 mt-0.5">
                    <Text
                      className={`text-[10px] ${
                        isDark
                          ? "text-text-tertiary-dark"
                          : "text-text-tertiary"
                      }`}
                    >
                      CH {net.channel}
                    </Text>
                    <Text
                      className={`text-[10px] ${
                        isDark
                          ? "text-text-tertiary-dark"
                          : "text-text-tertiary"
                      }`}
                    >
                      {net.band}
                    </Text>
                    <View className="flex-row items-center gap-0.5">
                      {net.security !== "Open" ? (
                        <Lock size={8} color={theme.textTertiary} />
                      ) : (
                        <Shield size={8} color={theme.warning} />
                      )}
                      <Text
                        className={`text-[10px] ${
                          isDark
                            ? "text-text-tertiary-dark"
                            : "text-text-tertiary"
                        }`}
                      >
                        {net.security}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Signal */}
                <View className="items-end">
                  <WifiSignalIndicator
                    strength={
                      net.rssi >= -50
                        ? 100
                        : net.rssi >= -70
                          ? 60
                          : net.rssi >= -85
                            ? 30
                            : 10
                    }
                    color={color}
                    size="sm"
                  />
                  <Text
                    className="text-[10px] font-mono mt-1"
                    style={{ color }}
                  >
                    {net.rssi} dBm
                  </Text>
                </View>

                {onLocate && (
                  <Pressable
                    testID={`wifi-locate-${net.bssid}`}
                    onPress={() => onLocate(net)}
                    accessibilityRole="button"
                    accessibilityLabel={t("arFinder.locate")}
                    hitSlop={8}
                    className="ml-3 p-1.5 active:opacity-70"
                  >
                    <Radar size={16} color={theme.primary} strokeWidth={2} />
                  </Pressable>
                )}
              </View>
            </View>
          );
        })
      )}
    </View>
  );
};

export { WifiNetworkList };
