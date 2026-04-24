import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { useRouter } from "expo-router";
import { Lock } from "lucide-react-native";

import { safePush } from "@/lib/navigation";
import { useIsPremium } from "@/stores/usePremiumStore";

import { useTheme } from "@/theme";

import { useI18n } from "@/lib/i18n";
import { PremiumBadge } from "./PremiumBadge";

import type { PremiumFeature } from "@/services/premium";

interface PremiumGateProps {
  feature: PremiumFeature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** When true, removes rounded corners and background — for use inside cards/sections */
  inline?: boolean;
}

const PremiumGate = ({
  feature,
  children,
  fallback,
  inline = false,
}: PremiumGateProps) => {
  const isPremium = useIsPremium();

  if (isPremium) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <PremiumGateFallback feature={feature} inline={inline} />;
};

function PremiumGateFallback({
  feature: _feature,
  inline,
}: {
  feature: PremiumFeature;
  inline: boolean;
}) {
  const { theme, isDark } = useTheme();

  const { t } = useI18n();
  const router = useRouter();

  const openPaywall = () => safePush(router, "/paywall");

  return (
    <View
      className={`p-4 items-center ${
        inline
          ? ""
          : `rounded-2xl ${isDark ? "bg-surface-dark" : "bg-surface"}`
      }`}
      style={
        inline
          ? undefined
          : {
              borderWidth: 1,
              borderColor: theme.border,
              borderStyle: "dashed" as const,
            }
      }
    >
      <View className="flex-row items-center gap-2 mb-2">
        <Lock size={16} color={theme.textTertiary} />
        <PremiumBadge size="md" />
      </View>

      <Text
        className="text-sm text-center mb-3"
        style={{ color: theme.textSecondary }}
      >
        {t("premium.gate.message")}
      </Text>

      <TouchableOpacity
        className="rounded-xl px-5 py-2.5"
        style={{ backgroundColor: "#F59E0B" }}
        onPress={openPaywall}
        activeOpacity={0.8}
      >
        <Text className="text-white font-semibold text-sm">
          {t("premium.gate.button")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export { PremiumGate };
