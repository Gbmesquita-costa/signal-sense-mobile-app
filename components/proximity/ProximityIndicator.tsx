/**
 * ProximityIndicator
 * Horizontal bar indicating signal strength
 */

import { useEffect } from "react";
import { Text, View } from "react-native";

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useI18n } from "@/lib/i18n";

import type { ProximityLevel } from "@/services/proximity";
import { getLevelColor } from "@/services/proximity";

interface ProximityIndicatorProps {
  level: ProximityLevel;
  rssi: number;
  smoothedRssi: number;
  isDark?: boolean;
}

const ProximityIndicator = ({
  level,
  rssi,
  smoothedRssi,
  isDark = false,
}: ProximityIndicatorProps) => {
  const { t } = useI18n();
  const color = getLevelColor(level);

  // Use translation for level description.
  const description = t(`proximity.levels.${level}`);

  // Calculates the percentage of the bar (0-100%)
  // Typical RSSI: -100 (far) to -40 (near)
  const percentage = Math.max(
    0,
    Math.min(100, ((smoothedRssi + 100) / 60) * 100),
  );

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
      {/* Description and RSSI */}
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
          {smoothedRssi.toFixed(0)} dBm
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

      {/* Raw RSSI (debug) */}
      {rssi !== smoothedRssi && (
        <Text
          className={`text-xs mt-1 ${
            isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
          }`}
        >
          {t("proximity.rssi.raw")}: {rssi} dBm
        </Text>
      )}
    </View>
  );
};

export { ProximityIndicator };
