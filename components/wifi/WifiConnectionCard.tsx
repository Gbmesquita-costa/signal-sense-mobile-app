import React from "react";
import { Text, View } from "react-native";

import { Globe, Lock, Wifi, WifiOff } from "lucide-react-native";

import { wifiService } from "@/services/wifi/wifi.service";
import type { WifiConnectionInfo } from "@/services/wifi/wifi.types";

import { WifiSignalIndicator } from "./WifiSignalIndicator";

interface WifiConnectionCardProps {
  connection: WifiConnectionInfo;
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
}

const WifiConnectionCard = ({
  connection,
  isDark,
  theme,
  t,
}: WifiConnectionCardProps) => {
  const quality = wifiService.getSignalQuality(connection.strength);
  const signalColor = wifiService.getSignalColor(quality, theme);

  const isConnected = connection.isConnected && connection.type === "wifi";

  return (
    <View
      className={`p-5 rounded-2xl ${isDark ? "bg-surface-dark" : "bg-surface"}`}
      style={{
        borderLeftWidth: 4,
        borderLeftColor: isConnected ? signalColor : theme.error,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{
              backgroundColor: `${isConnected ? signalColor : theme.error}20`,
            }}
          >
            {isConnected ? (
              <Wifi size={20} color={signalColor} strokeWidth={2} />
            ) : (
              <WifiOff size={20} color={theme.error} strokeWidth={2} />
            )}
          </View>
          <View>
            <Text
              className={`text-xs font-bold uppercase ${
                isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
              }`}
            >
              {t("wifi.connection.title")}
            </Text>
            <Text
              className={`text-lg font-bold ${
                isDark ? "text-text-primary-dark" : "text-text-primary"
              }`}
              numberOfLines={1}
            >
              {isConnected
                ? (connection.ssid ?? t("wifi.connection.hidden"))
                : t("wifi.connection.disconnected")}
            </Text>
          </View>
        </View>

        {isConnected && (
          <WifiSignalIndicator
            strength={connection.strength}
            color={signalColor}
            size="lg"
          />
        )}
      </View>

      {/* Details */}
      {isConnected && (
        <View className="gap-2">
          {/* Signal quality */}
          <View className="flex-row items-center justify-between">
            <Text
              className={`text-xs ${
                isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
              }`}
            >
              {t("wifi.connection.signal")}
            </Text>
            <Text
              className="text-sm font-semibold"
              style={{ color: signalColor }}
            >
              {t(`wifi.signal.${quality}`)}
              {connection.strength !== null ? ` (${connection.strength}%)` : ""}
            </Text>
          </View>

          {/* Frequency band */}
          {connection.band !== "unknown" && (
            <View className="flex-row items-center justify-between">
              <Text
                className={`text-xs ${
                  isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
                }`}
              >
                {t("wifi.connection.band")}
              </Text>
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${theme.primary}20` }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: theme.primary }}
                >
                  {connection.band}
                </Text>
              </View>
            </View>
          )}

          {/* Frequency */}
          {connection.frequency && (
            <View className="flex-row items-center justify-between">
              <Text
                className={`text-xs ${
                  isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
                }`}
              >
                {t("wifi.connection.frequency")}
              </Text>
              <Text
                className={`text-sm font-mono ${
                  isDark ? "text-text-secondary-dark" : "text-text-secondary"
                }`}
              >
                {connection.frequency} MHz
              </Text>
            </View>
          )}

          {/* IP Address */}
          {connection.ip && (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <Globe size={12} color={theme.textTertiary} />
                <Text
                  className={`text-xs ${
                    isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
                  }`}
                >
                  {t("wifi.connection.ip")}
                </Text>
              </View>
              <Text
                className={`text-sm font-mono ${
                  isDark ? "text-text-secondary-dark" : "text-text-secondary"
                }`}
              >
                {connection.ip}
              </Text>
            </View>
          )}

          {/* Subnet */}
          {connection.subnet && (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <Lock size={12} color={theme.textTertiary} />
                <Text
                  className={`text-xs ${
                    isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
                  }`}
                >
                  {t("wifi.connection.subnet")}
                </Text>
              </View>
              <Text
                className={`text-sm font-mono ${
                  isDark ? "text-text-secondary-dark" : "text-text-secondary"
                }`}
              >
                {connection.subnet}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Not connected to Wi-Fi */}
      {!isConnected && connection.type !== "none" && (
        <View className="flex-row items-center gap-2">
          <Globe size={14} color={theme.textTertiary} />
          <Text
            className={`text-xs ${
              isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
            }`}
          >
            {connection.type === "cellular"
              ? t("wifi.connection.cellular")
              : t("wifi.connection.otherNetwork")}
          </Text>
        </View>
      )}
    </View>
  );
};

export { WifiConnectionCard };
