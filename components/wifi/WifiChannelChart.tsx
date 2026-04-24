import React from "react";
import { Text, View } from "react-native";

import type { WifiChannelInfo } from "@/services/wifi/wifi.types";

interface WifiChannelChartProps {
  channels: WifiChannelInfo[];
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

const WifiChannelChart = ({
  channels,
  isDark,
  theme,
  t,
}: WifiChannelChartProps) => {
  const maxCount = Math.max(...channels.map((c) => c.networkCount), 1);

  const getCongestionColor = (congestion: "low" | "medium" | "high") => {
    switch (congestion) {
      case "low":
        return theme.success;
      case "medium":
        return theme.warning;
      case "high":
        return theme.error;
    }
  };

  if (channels.length === 0) return null;

  return (
    <View className={`rounded-2xl p-4 ${isDark ? "bg-surface-dark" : "bg-surface"}`}>
      {/* Header */}
      <Text
        className={`text-xs font-bold uppercase mb-4 ${
          isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
        }`}
      >
        {t("wifi.channels.title")}
      </Text>

      {/* Chart */}
      <View className="flex-row items-end justify-between" style={{ height: 100 }}>
        {channels.map((ch) => {
          const barHeight = Math.max((ch.networkCount / maxCount) * 80, 8);
          const color = getCongestionColor(ch.congestion);

          return (
            <View key={ch.channel} className="items-center flex-1">
              {/* Count label */}
              <Text
                className="text-[9px] font-bold mb-1"
                style={{ color }}
              >
                {ch.networkCount}
              </Text>

              {/* Bar */}
              <View
                style={{
                  width: "60%",
                  height: barHeight,
                  borderRadius: 4,
                  backgroundColor: color,
                  opacity: 0.8,
                }}
              />

              {/* Channel label */}
              <Text
                className={`text-[9px] mt-1 ${
                  isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
                }`}
              >
                {ch.channel}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View className="flex-row items-center justify-center gap-4 mt-3">
        {(["low", "medium", "high"] as const).map((level) => (
          <View key={level} className="flex-row items-center gap-1">
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getCongestionColor(level) }}
            />
            <Text
              className={`text-[10px] ${
                isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
              }`}
            >
              {t(`wifi.channels.${level}`)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export { WifiChannelChart };
