import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import * as Haptics from "expo-haptics";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Radio,
  ShieldCheck,
  Signal,
} from "lucide-react-native";

import type { StalkerAlert } from "@/services/stalker";

interface StalkerAlertCardProps {
  alert: StalkerAlert;
  onDismiss: (alertId: string) => void;
  onTrustDevice: (deviceId: string, name: string | null) => void;
  isDark: boolean;
  theme: {
    primary: string;
    success: string;
    error: string;
    warning: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    surface: string;
    border: string;
  };
  t: (key: string) => string;
}

const StalkerAlertCard = memo(function StalkerAlertCard({
  alert,
  onDismiss,
  onTrustDevice,
  isDark,
  theme,
  t,
}: StalkerAlertCardProps) {
  const durationMin = Math.round(alert.durationMs / 60_000);
  const deviceLabel =
    alert.deviceName ?? alert.trackerType ?? t("common.unknown");

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss(alert.id);
  };

  const handleTrust = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onTrustDevice(alert.deviceId, alert.deviceName);
  };

  return (
    <View
      className={`mx-6 mb-3 rounded-xl overflow-hidden ${
        isDark ? "bg-surface-dark" : "bg-surface"
      }`}
      style={{
        borderWidth: 1,
        borderColor: isDark
          ? "rgba(239, 68, 68, 0.25)"
          : "rgba(220, 38, 38, 0.15)",
      }}
    >
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3"
        style={{
          backgroundColor: isDark
            ? "rgba(239, 68, 68, 0.1)"
            : "rgba(220, 38, 38, 0.05)",
        }}
      >
        <AlertTriangle size={18} color={theme.error} strokeWidth={2.5} />
        <Text
          className="text-sm font-bold ml-2 flex-1"
          style={{ color: theme.error }}
        >
          {t("antiStalking.alert.title")}
        </Text>
        {alert.trackerBrand && (
          <View
            className="px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${theme.error}15` }}
          >
            <Text
              className="text-[10px] font-bold"
              style={{ color: theme.error }}
            >
              {alert.trackerBrand}
            </Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View className="px-4 py-3">
        {/* Device name */}
        <View className="flex-row items-center mb-2">
          <Radio size={14} color={theme.textSecondary} strokeWidth={2} />
          <Text
            className={`text-sm font-semibold ml-2 ${
              isDark ? "text-text-primary-dark" : "text-text-primary"
            }`}
          >
            {deviceLabel}
          </Text>
        </View>

        {/* Info row */}
        <View className="flex-row items-center gap-4 mb-3">
          <View className="flex-row items-center">
            <Clock size={12} color={theme.textTertiary} strokeWidth={2} />
            <Text
              className={`text-xs ml-1 ${
                isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
              }`}
            >
              {t("antiStalking.alert.following").replace(
                "{duration}",
                durationMin.toString(),
              )}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Signal size={12} color={theme.textTertiary} strokeWidth={2} />
            <Text
              className={`text-xs ml-1 ${
                isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
              }`}
            >
              {t("antiStalking.alert.avgSignal").replace(
                "{rssi}",
                Math.round(alert.avgRssi).toString(),
              )}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row gap-2">
          <Pressable
            onPress={handleDismiss}
            className={`flex-1 flex-row items-center justify-center py-2 rounded-lg ${
              isDark ? "bg-background-dark" : "bg-gray-100"
            }`}
          >
            <CheckCircle size={14} color={theme.textSecondary} strokeWidth={2} />
            <Text
              className={`text-xs font-medium ml-1.5 ${
                isDark ? "text-text-secondary-dark" : "text-text-secondary"
              }`}
            >
              {t("antiStalking.alert.dismiss")}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleTrust}
            className="flex-1 flex-row items-center justify-center py-2 rounded-lg"
            style={{ backgroundColor: `${theme.success}15` }}
          >
            <ShieldCheck size={14} color={theme.success} strokeWidth={2} />
            <Text
              className="text-xs font-medium ml-1.5"
              style={{ color: theme.success }}
            >
              {t("antiStalking.alert.trustDevice")}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
});

export { StalkerAlertCard };
