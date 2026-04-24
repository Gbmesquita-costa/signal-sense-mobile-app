/**
 * ProximityRadar
 * Reactive concentric circles that grow/shrink based on signal strength.
 * IDENTICAL visual pattern to MagneticVisualizer: useDerivedValue + withSpring on UI thread.
 */

import { useEffect } from "react";
import { View } from "react-native";

import { Bluetooth } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import type { ProximityLevel } from "@/services/proximity";
import { getLevelColor } from "@/services/proximity";

interface ProximityRadarProps {
  level: ProximityLevel;
  smoothedRssi?: number;
  size?: number;
  isActive?: boolean;
  isDark?: boolean;
}

const ProximityRadar = ({
  level,
  smoothedRssi = -100,
  size = 224,
  isActive = true,
  isDark = false,
}: ProximityRadarProps) => {
  const color = getLevelColor(level);

  // Bridge props → shared values for UI-thread animations
  const rssiValue = useSharedValue(smoothedRssi);
  const activeValue = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    rssiValue.value = smoothedRssi;
  }, [smoothedRssi, rssiValue]);

  useEffect(() => {
    activeValue.value = isActive ? 1 : 0;
  }, [isActive, activeValue]);

  // Derive intensity (0–1) from RSSI — runs on UI thread
  // -100 dBm → 0 (far), -40 dBm → 1 (very close)
  const intensity = useDerivedValue(() => {
    if (activeValue.value === 0) return 0;
    return Math.max(0, Math.min(1, (rssiValue.value + 100) / 60));
  });

  // EXACT same formulas as MagneticVisualizer — circle1 = inner, circle3 = outer
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
      transform: [
        { scale: withSpring(scale, { damping: 15, stiffness: 90 }) },
      ],
      opacity: withSpring(opacity, { damping: 15, stiffness: 90 }),
      backgroundColor: color,
    };
  });

  const animatedCircle3 = useAnimatedStyle(() => {
    const scale = 1.2 + intensity.value * 0.25;
    const opacity = 0.1 + intensity.value * 0.2;
    return {
      transform: [
        { scale: withSpring(scale, { damping: 15, stiffness: 80 }) },
      ],
      opacity: withSpring(opacity, { damping: 15, stiffness: 80 }),
      backgroundColor: color,
    };
  });

  // Proportional sizes matching MagneticVisualizer ratios (224/176/144/112)
  const outerSize = size;
  const middleSize = size * (176 / 224);
  const innerSize = size * (144 / 224);
  const centerSize = size * (112 / 224);

  return (
    <View className="items-center justify-center py-6">
      {/* Animated concentric circles — explicit size so circles don't overflow into text */}
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

        {/* Center circle with icon — surface bg + shadow glow (same as MagneticVisualizer) */}
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
          <Bluetooth
            size={centerSize * 0.4}
            color={color}
            strokeWidth={2.5}
          />
        </View>
      </View>
    </View>
  );
};

export { ProximityRadar };
