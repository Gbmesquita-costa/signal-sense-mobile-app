/**
 * EmptyProximity
 * Empty state when no device is selected
 */

import { useRef } from "react";
import { Pressable, Text, View } from "react-native";

import { router } from "expo-router";
import { Lock } from "lucide-react-native";

import Animated, { FadeIn } from "react-native-reanimated";

import { useTheme } from "@/theme";

interface EmptyProximityProps {
  title: string;
  message: string;
  buttonText: string;
  isDark?: boolean;
}

const EmptyProximity = ({
  title,
  message,
  buttonText,
  isDark = false,
}: EmptyProximityProps) => {
  const { theme } = useTheme();

  // Guard against double-taps; navigation itself is instant (expo-router
  // handles the transition animation), so no pending/loading state is needed.
  const navigatingRef = useRef(false);

  const handleGoToScan = () => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;

    router.push("/(tabs)/scan");
    setTimeout(() => {
      navigatingRef.current = false;
    }, 600);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="flex-1 items-center mt-44 px-8"
    >
      <View
        className="w-24 h-24 rounded-full 
        items-center justify-center mb-6"
        style={{ backgroundColor: `${theme.primary}20` }}
      >
        <Lock size={48} color={theme.primary} strokeWidth={2} />
      </View>

      <Text
        className={`text-center text-xl font-semibold mb-3 ${
          isDark ? "text-text-primary-dark" : "text-text-primary"
        }`}
      >
        {title}
      </Text>

      <Text
        className={`text-base text-center mb-8 ${
          isDark ? "text-text-secondary-dark" : "text-text-secondary"
        }`}
      >
        {message}
      </Text>

      <Pressable
        onPress={handleGoToScan}
        className="px-8 py-4 rounded-xl flex-row
        items-center justify-center min-w-[200px] active:opacity-80"
        style={{ backgroundColor: theme.primary }}
      >
        <Text className="text-white font-semibold text-base">{buttonText}</Text>
      </Pressable>
    </Animated.View>
  );
};

export { EmptyProximity };
