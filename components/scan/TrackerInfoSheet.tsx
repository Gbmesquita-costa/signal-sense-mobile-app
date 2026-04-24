import { memo } from "react";
import { Text, View } from "react-native";

import { PremiumGate } from "@/components/premium";
import { AlertTriangle, Radio, Shield } from "lucide-react-native";

interface TrackerInfoSheetProps {
  type: string | null;
  brand: string | null;
  confidence: "high" | "medium";
  isDark: boolean;
  theme: {
    primary: string;
    error: string;
    warning: string;
    success: string;
    textSecondary: string;
  };
  t: (key: string) => string;
}

const TrackerInfoSheet = memo(function TrackerInfoSheet({
  type,
  brand,
  confidence,
  isDark,
  theme,
  t,
}: TrackerInfoSheetProps) {
  const confidenceColor = confidence === "high" ? theme.error : theme.warning;
  const confidenceLabel =
    confidence === "high"
      ? t("tracker.confidenceHigh")
      : t("tracker.confidenceMedium");

  return (
    <PremiumGate feature="tracker_details">
      <View className="px-4 py-2">
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${theme.error}15` }}
          >
            <AlertTriangle size={20} color={theme.error} strokeWidth={2} />
          </View>
          <View>
            <Text
              className={`text-base font-bold ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
            >
              {t("tracker.detected")}
            </Text>
            <Text
              className={`text-xs mt-0.5 ${isDark ? "text-text-tertiary-dark" : "text-text-tertiary"}`}
            >
              {t("tracker.subtitle")}
            </Text>
          </View>
        </View>

        {/* Info rows */}
        <View
          className={`rounded-xl p-4 ${isDark ? "bg-surface-dark" : "bg-surface"}`}
        >
          {brand && (
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-2">
                <Radio size={14} color={theme.textSecondary} strokeWidth={2} />
                <Text
                  className={`text-sm ${isDark ? "text-text-secondary-dark" : "text-text-secondary"}`}
                >
                  {t("tracker.brand")}
                </Text>
              </View>
              <Text
                className={`text-sm font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
              >
                {brand}
              </Text>
            </View>
          )}

          {type && (
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-2">
                <Radio size={14} color={theme.textSecondary} strokeWidth={2} />
                <Text
                  className={`text-sm ${isDark ? "text-text-secondary-dark" : "text-text-secondary"}`}
                >
                  {t("tracker.type")}
                </Text>
              </View>
              <Text
                className={`text-sm font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </View>
          )}

          <View className="flex-row items-center justify-between py-2">
            <View className="flex-row items-center gap-2">
              <Shield size={14} color={theme.textSecondary} strokeWidth={2} />
              <Text
                className={`text-sm ${isDark ? "text-text-secondary-dark" : "text-text-secondary"}`}
              >
                {t("tracker.confidence")}
              </Text>
            </View>
            <Text
              className="text-sm font-semibold"
              style={{ color: confidenceColor }}
            >
              {confidenceLabel}
            </Text>
          </View>
        </View>

        {/* Safety tip */}
        <View
          className="mt-4 p-3 rounded-lg"
          style={{ backgroundColor: `${theme.warning}10` }}
        >
          <Text
            className={`text-xs leading-5 ${isDark ? "text-text-secondary-dark" : "text-text-secondary"}`}
          >
            {t("tracker.safetyTip")}
          </Text>
        </View>
      </View>
    </PremiumGate>
  );
});

export { TrackerInfoSheet };
