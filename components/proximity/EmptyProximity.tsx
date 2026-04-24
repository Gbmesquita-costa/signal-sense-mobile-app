/**
 * EmptyProximity
 * Empty state when no device is selected
 */

import { useTransition } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { router } from "expo-router";
import { Lock } from "lucide-react-native";

import Animated, { FadeIn } from "react-native-reanimated";

import { useI18n } from "@/lib/i18n";
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
  const { t } = useI18n();

  const [isPending, startTransition] = useTransition();

  const handleGoToScan = () => {
    startTransition(() => {
      router.push("/(tabs)/scan");
    });
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
        disabled={isPending}
        className="px-8 py-4 rounded-xl flex-row 
        items-center justify-center min-w-[200px]"
        style={{
          backgroundColor: theme.primary,
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? (
          <>
            <Text className="text-white font-semibold text-base">
              {t("proximity.redirecting")}
            </Text>
            <ActivityIndicator size="small" color="#FFFFFF" className="ml-3" />
          </>
        ) : (
          <Text className="text-white font-semibold text-base">
            {buttonText}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

export { EmptyProximity };
