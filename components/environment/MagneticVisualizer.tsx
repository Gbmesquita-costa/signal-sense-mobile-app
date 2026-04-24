/**
 * MagneticVisualizer
 * Animated visual representation of the magnetic field
 * OPTIMIZED with Reanimated shared values ​​for maximum fluidity
 */

import React from "react";
import { Text, View } from "react-native";

import { Magnet } from "lucide-react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from "react-native-reanimated";

import { AnimatedValue } from "./AnimatedValue";

interface MagneticVisualizerProps {
  magnitude: SharedValue<number>;
  color: string;
  isDark: boolean;
}

const MagneticVisualizer = ({
  magnitude,
  color,
  isDark,
}: MagneticVisualizerProps) => {
  // It derives intensity and duration based on magnitude (all on the UI thread)
  const intensity = useDerivedValue(() => {
    return Math.min(1, magnitude.value / 200);
  });

  // Scale of the circles based on intensity - reactive in real time
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

  return (
    <View className="items-center justify-center py-6">
      {/* Animated concentric circles */}
      <View className="mb-2 relative items-center justify-center">
        {/* Outer circle */}
        <Animated.View
          style={animatedCircle3}
          className="absolute w-56 h-56 rounded-full"
        />

        {/* Middle circle */}
        <Animated.View
          style={animatedCircle2}
          className="absolute w-44 h-44 rounded-full"
        />

        {/* Inner circle */}
        <Animated.View
          style={animatedCircle1}
          className="absolute w-36 h-36 rounded-full"
        />

        {/* Center circle with icon */}
        <View
          className={`w-28 h-28 rounded-full items-center justify-center z-10 ${
            isDark ? "bg-surface-dark" : "bg-surface"
          }`}
          style={{
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 20,
            elevation: 15,
          }}
        >
          <Magnet size={44} color={color} strokeWidth={2.5} />
        </View>
      </View>

      {/* Main Value - Animated in real time */}
      <View className="mt-11 items-center">
        <AnimatedValue
          value={magnitude}
          decimals={1}
          className={`text-5xl font-mono font-bold text-center ${
            isDark ? "text-text-primary-dark" : "text-text-primary"
          }`}
        />
        <Text
          className={`text-base font-medium mt-1 ${
            isDark ? "text-text-secondary-dark" : "text-text-secondary"
          }`}
        >
          µT (Microtesla)
        </Text>
      </View>
    </View>
  );
};

export { MagneticVisualizer };
