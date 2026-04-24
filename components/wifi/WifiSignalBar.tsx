/**
 * WifiSignalBar
 * Horizontal animated bar indicating Wi-Fi signal strength.
 * Adapted from ProximityIndicator — uses strength (0-100) and SignalQuality.
 */

import { useEffect } from "react";
import { Text, View } from "react-native";

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import type { SignalQuality } from "@/services/wifi/wifi.types";
import { wifiService } from "@/services/wifi/wifi.service";

interface WifiSignalBarProps {
  strength: number | null; // 0-100
  quality: SignalQuality;
  isDark?: boolean;
  theme: {
    success: string;
    warning: string;
    error: string;
  };
  t: (key: string) => string;
}

const WifiSignalBar = ({
  strength,
  quality,
  isDark = false,
  theme,
  t,
}: WifiSignalBarProps) => {
  const color = wifiService.getSignalColor(quality, theme);
  const percentage = Math.max(0, Math.min(100, strength ?? 0));
  const description = t(`wifi.signal.${quality}`);

  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(percentage, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
  }, [percentage, width]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View className="w-full">
      {/* Description and percentage */}
      <View className="flex-row justify-between items-center mb-2">
        <Text
          className={`text-lg font-semibold ${
            isDark ? "text-text-primary-dark" : "text-text-primary"
          }`}
        >
          {description}
        </Text>
        <Text
          className={`text-sm font-mono ${
            isDark ? "text-text-secondary-dark" : "text-text-secondary"
          }`}
        >
          {percentage}%
        </Text>
      </View>

      {/* Progress bar */}
      <View
        className={`h-3 rounded-full overflow-hidden ${
          isDark ? "bg-surface-dark" : "bg-surface"
        }`}
      >
        <Animated.View
          style={[
            {
              height: "100%",
              backgroundColor: color,
              borderRadius: 9999,
            },
            animatedBarStyle,
          ]}
        />
      </View>
    </View>
  );
};

export { WifiSignalBar };
