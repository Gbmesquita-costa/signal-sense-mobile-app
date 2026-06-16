import React, { useEffect } from "react";

import { Wifi } from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface WifiIdleStateProps {
  isDark: boolean;
  theme: {
    primary: string;
    textSecondary: string;
  };
  t: (key: string) => string;
  isLoading: boolean;
  onStart: () => void;
}

const WifiIdleState = ({
  isDark,
  theme,
  t,
  isLoading,
  onStart,
}: WifiIdleStateProps) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!isLoading) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, {
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }
  }, [isLoading, scale]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
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
          <View
            className="w-44 h-44 rounded-full items-center justify-center"
            style={{
              backgroundColor: `${theme.primary}15`,
              borderWidth: 2,
              borderColor: `${theme.primary}30`,
            }}
          >
            <View
              className="w-36 h-36 rounded-full items-center justify-center"
              style={{ backgroundColor: `${theme.primary}20` }}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color={theme.primary} />
              ) : (
                <Animated.View style={iconAnimatedStyle}>
                  <Wifi size={90} color={theme.primary} strokeWidth={1.5} />
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
        {isLoading ? t("common.loading") : t("wifi.idle.tapToStart")}
      </Animated.Text>

      {/* Description */}
      <Animated.Text
        entering={FadeInUp.delay(300).duration(400)}
        className={`text-base text-center mb-8 ${
          isDark ? "text-text-secondary-dark" : "text-text-secondary"
        }`}
      >
        {t("wifi.idle.description")}
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
          {t("wifi.idle.hint")}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

export { WifiIdleState };
