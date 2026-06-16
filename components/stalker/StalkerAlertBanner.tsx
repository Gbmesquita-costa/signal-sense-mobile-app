import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import { AlertTriangle, ChevronRight } from "lucide-react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface StalkerAlertBannerProps {
  alertCount: number;
  onPress: () => void;
  isDark: boolean;
  theme: {
    error: string;
    warning: string;
  };
  t: (key: string) => string;
}

const StalkerAlertBanner = memo(function StalkerAlertBanner({
  alertCount,
  onPress,
  isDark,
  theme,
  t,
}: StalkerAlertBannerProps) {
  if (alertCount === 0) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      className="mx-6 mb-3"
    >
      <Pressable
        onPress={onPress}
        className="flex-row items-center px-4 
        py-3 rounded-xl active:opacity-80"
        style={{
          backgroundColor: isDark
            ? "rgba(239, 68, 68, 0.15)"
            : "rgba(220, 38, 38, 0.08)",
          borderWidth: 1,
          borderColor: isDark
            ? "rgba(239, 68, 68, 0.3)"
            : "rgba(220, 38, 38, 0.2)",
        }}
      >
        <View
          className="w-8 h-8 rounded-full items-center justify-center"
          style={{ backgroundColor: `${theme.error}20` }}
        >
          <AlertTriangle size={18} color={theme.error} strokeWidth={2.5} />
        </View>

        <View className="flex-1 ml-3">
          <Text className="text-sm font-bold" style={{ color: theme.error }}>
            {t("antiStalking.alert.title")}
          </Text>
          <Text
            className={`text-xs ${
              isDark ? "text-text-secondary-dark" : "text-text-secondary"
            }`}
          >
            {t("antiStalking.banner.alertCount").replace(
              "{count}",
              alertCount.toString(),
            )}
          </Text>
        </View>

        <ChevronRight size={18} color={theme.error} strokeWidth={2} />
      </Pressable>
    </Animated.View>
  );
});

export { StalkerAlertBanner };
