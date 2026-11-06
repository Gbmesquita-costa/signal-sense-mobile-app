/**
 * EnvironmentIdleState
 * Initial state when the sensor is off
 */

import React, { useEffect } from "react";

import { Compass } from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface EnvironmentIdleStateProps {
  isDark: boolean;
  theme: {
    primary: string;
    textSecondary: string;
  };
  t: (key: string) => string;
  isLoading: boolean;
  onStart: () => void;
}

const EnvironmentIdleState = ({
  isDark,
  theme,
  t,
  isLoading,
  onStart,
}: EnvironmentIdleStateProps) => {
  const rotation = useSharedValue(0);

  // Subtle icon rotation animation
  useEffect(() => {
    if (!isLoading) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 8000, easing: Easing.linear }),
        -1,
        false,
      );
    }
  }, [isLoading, rotation]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStart();
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="flex-1 items-center mt-32 px-6"
    >
      {/* Animated center icon */}
      <Pressable
        onPress={handlePress}
        disabled={isLoading}
        className="items-center mb-6"
      >
        <View className="relative items-center justify-center">
          {/* Background circle */}
          <View
            className="w-44 h-44 rounded-full items-center justify-center"
            style={{
              backgroundColor: `${theme.primary}15`,
              borderWidth: 2,
              borderColor: `${theme.primary}30`,
            }}
          >
            {/* Inner circle */}
            <View
              className="w-36 h-36 rounded-full items-center justify-center"
              style={{ backgroundColor: `${theme.primary}20` }}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color={theme.primary} />
              ) : (
                <Animated.View style={iconAnimatedStyle}>
                  <Compass size={90} color={theme.primary} strokeWidth={1.5} />
                </Animated.View>
              )}
            </View>
          </View>
        </View>
      </Pressable>

      {/* Instruction text */}
      <Animated.Text
        entering={FadeInUp.delay(200).duration(400)}
        className={`text-center text-xl font-semibold mb-3 ${
          isDark ? "text-text-primary-dark" : "text-text-primary"
        }`}
      >
        {isLoading
          ? t("environment.idle.initializingSensor")
          : t("environment.idle.tapToStart")}
      </Animated.Text>

      {/* Description */}
      <Animated.Text
        entering={FadeInUp.delay(300).duration(400)}
        className={`text-base text-center mb-8 ${
          isDark ? "text-text-secondary-dark" : "text-text-secondary"
        }`}
      >
        {t("environment.idle.description")}
      </Animated.Text>

      {/* Info box */}
      <Animated.View
        entering={FadeInUp.delay(400).duration(400)}
        className={`p-4 rounded-xl ${
          isDark ? "bg-surface-dark" : "bg-surface"
        }`}
      >
        <Text
          className={`text-xs text-center leading-5 ${
            isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
          }`}
        >
          {t("environment.idle.hint")}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

export { EnvironmentIdleState };
