/**
 * WifiRadar
 * Reactive concentric circles that grow/shrink based on Wi-Fi signal strength.
 * Adapted from ProximityRadar — uses strength (0-100) instead of RSSI.
 */

import { useEffect } from "react";
import { View } from "react-native";

import { Wifi } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { wifiService } from "@/services/wifi/wifi.service";
import type { SignalQuality } from "@/services/wifi/wifi.types";

interface WifiRadarProps {
  strength: number | null; // 0-100
  quality: SignalQuality;
  size?: number;
  isActive?: boolean;
  isDark?: boolean;
  theme: {
    success: string;
    warning: string;
    error: string;
  };
}

function getQualityColor(
  quality: SignalQuality,
  theme: { success: string; warning: string; error: string },
): string {
  return wifiService.getSignalColor(quality, theme);
}

const WifiRadar = ({
  strength,
  quality,
  size = 224,
  isActive = true,
  isDark = false,
  theme,
}: WifiRadarProps) => {
  const color = getQualityColor(quality, theme);

  const strengthValue = useSharedValue(strength ?? 0);
  const activeValue = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    strengthValue.value = strength ?? 0;
  }, [strength, strengthValue]);

  useEffect(() => {
    activeValue.value = isActive ? 1 : 0;
  }, [isActive, activeValue]);

  // Derive intensity (0–1) from strength (0–100)
  const intensity = useDerivedValue(() => {
    if (activeValue.value === 0) return 0;
    return Math.max(0, Math.min(1, strengthValue.value / 100));
  });

  const animatedCircle1 = useAnimatedStyle(() => {
    const scale = 1 + intensity.value * 0.15;
    const opacity = 0.3 + intensity.value * 0.3;
    return {
      transform: [
        { scale: withSpring(scale, { damping: 15, stiffness: 100 }) },
      ],
      opacity: withSpring(opacity, { damping: 15, stiffness: 100 }),
      backgroundColor: color,
    };
  });

  const animatedCircle2 = useAnimatedStyle(() => {
    const scale = 1.1 + intensity.value * 0.2;
    const opacity = 0.2 + intensity.value * 0.25;
    return {
      transform: [{ scale: withSpring(scale, { damping: 15, stiffness: 90 }) }],
      opacity: withSpring(opacity, { damping: 15, stiffness: 90 }),
      backgroundColor: color,
    };
  });

  const animatedCircle3 = useAnimatedStyle(() => {
    const scale = 1.2 + intensity.value * 0.25;
    const opacity = 0.1 + intensity.value * 0.2;
    return {
      transform: [{ scale: withSpring(scale, { damping: 15, stiffness: 80 }) }],
      opacity: withSpring(opacity, { damping: 15, stiffness: 80 }),
      backgroundColor: color,
    };
  });

  const outerSize = size;
  const middleSize = size * (176 / 224);
  const innerSize = size * (144 / 224);
  const centerSize = size * (112 / 224);

  return (
    <View className="items-center justify-center py-6">
      <View
        style={{ width: outerSize, height: outerSize, overflow: "visible" }}
        className="relative items-center justify-center"
      >
        {/* Outer circle */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: outerSize,
              height: outerSize,
              borderRadius: outerSize / 2,
            },
            animatedCircle3,
          ]}
        />

        {/* Middle circle */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: middleSize,
              height: middleSize,
              borderRadius: middleSize / 2,
            },
            animatedCircle2,
          ]}
        />

        {/* Inner circle */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
            },
            animatedCircle1,
          ]}
        />

        {/* Center circle with Wi-Fi icon */}
        <View
          className={`items-center justify-center z-10 ${
            isDark ? "bg-surface-dark" : "bg-surface"
          }`}
          style={{
            width: centerSize,
            height: centerSize,
            borderRadius: centerSize / 2,
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 20,
            elevation: 15,
          }}
        >
          <Wifi size={centerSize * 0.4} color={color} strokeWidth={2.5} />
        </View>
      </View>
    </View>
  );
};

export { WifiRadar };
