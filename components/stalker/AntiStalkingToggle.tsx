import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import * as Haptics from "expo-haptics";
import { Shield, ShieldCheck } from "lucide-react-native";
import Animated, { FadeIn } from "react-native-reanimated";

interface AntiStalkingToggleProps {
  isMonitoring: boolean;
  activeAlertCount: number;
  onToggle: () => void;
  isDark: boolean;
  theme: {
    primary: string;
    success: string;
    error: string;
    textSecondary: string;
  };
  t: (key: string) => string;
  compact?: boolean;
}

const AntiStalkingToggle = memo(function AntiStalkingToggle({
  isMonitoring,
  activeAlertCount,
  onToggle,
  isDark,
  theme,
  t,
  compact = false,
}: AntiStalkingToggleProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
  };

  const iconColor = isMonitoring ? theme.success : theme.textSecondary;
  const Icon = isMonitoring ? ShieldCheck : Shield;

  if (compact) {
    return (
      <Pressable
        onPress={handlePress}
        className="relative p-2 active:opacity-70"
        hitSlop={8}
      >
        <Icon size={22} color={iconColor} strokeWidth={2} />
        {activeAlertCount > 0 && (
          <View
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full items-center justify-center px-1"
            style={{ backgroundColor: theme.error }}
          >
            <Text className="text-[10px] font-bold text-white">
              {activeAlertCount}
            </Text>
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <Pressable
        onPress={handlePress}
        className={`flex-row items-center px-4 py-3 rounded-xl mx-6 mb-3 ${
          isDark ? "bg-surface-dark" : "bg-surface"
        }`}
        style={
          isMonitoring
            ? { borderWidth: 1, borderColor: `${theme.success}40` }
            : undefined
        }
      >
        <View
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{
            backgroundColor: isMonitoring
              ? `${theme.success}20`
              : `${theme.textSecondary}15`,
          }}
        >
          <Icon size={20} color={iconColor} strokeWidth={2} />
        </View>

        <View className="flex-1 ml-3">
          <Text
            className={`text-sm font-semibold ${
              isDark ? "text-text-primary-dark" : "text-text-primary"
            }`}
          >
            {t("antiStalking.toggle.label")}
          </Text>
          <Text
            className={`text-xs ${
              isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
            }`}
          >
            {isMonitoring
              ? t("antiStalking.toggle.monitoring")
              : t("antiStalking.toggle.off")}
          </Text>
        </View>

        {activeAlertCount > 0 && (
          <View
            className="min-w-[22px] h-[22px] rounded-full items-center justify-center px-1.5 mr-2"
            style={{ backgroundColor: theme.error }}
          >
            <Text className="text-[11px] font-bold text-white">
              {activeAlertCount}
            </Text>
          </View>
        )}

        <View
          className={`w-11 h-6 rounded-full justify-center ${
            isMonitoring ? "" : ""
          }`}
          style={{
            backgroundColor: isMonitoring ? theme.success : `${theme.textSecondary}30`,
          }}
        >
          <View
            className="w-5 h-5 rounded-full bg-white shadow-sm"
            style={{
              marginLeft: isMonitoring ? 22 : 2,
            }}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
});

export { AntiStalkingToggle };
