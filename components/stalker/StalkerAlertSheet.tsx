import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Radio,
  ShieldCheck,
  Signal,
  X,
} from "lucide-react-native";

import { getIntlLocale } from "@/lib/i18n";
import type { StalkerAlert } from "@/services/stalker";

interface StalkerAlertSheetProps {
  alerts: StalkerAlert[];
  visible: boolean;
  onDismiss: (alertId: string) => void;
  onTrustDevice: (deviceId: string, name: string | null) => void;
  onClose: () => void;
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
    background: string;
    border: string;
  };
  t: (key: string) => string;
  locale: string;
}

const StalkerAlertSheet = memo(function StalkerAlertSheet({
  alerts,
  visible,
  onDismiss,
  onTrustDevice,
  onClose,
  isDark,
  theme,
  t,
  locale,
}: StalkerAlertSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["75%"], []);

  // Open/close based on visibility — same pattern as EducationDetailModal
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const intlLocale = getIntlLocale(locale);
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(intlLocale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: intlLocale === "en-US",
    });
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      onDismiss={onClose}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{
        backgroundColor: isDark ? "#6B7280" : "#9CA3AF",
        width: 48,
        height: 5,
      }}
      backgroundStyle={{
        backgroundColor: isDark ? theme.background : "#FFFFFF",
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pb-4">
        <View className="flex-row items-center">
          <AlertTriangle size={20} color={theme.error} strokeWidth={2.5} />
          <Text
            className={`text-lg font-bold ml-2 ${
              isDark ? "text-text-primary-dark" : "text-text-primary"
            }`}
          >
            {t("antiStalking.alertSheet.title")}
          </Text>
        </View>
        <Pressable
          onPress={handleClose}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{
            backgroundColor: isDark
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.05)",
          }}
        >
          <X size={20} color={isDark ? "#9CA3AF" : "#6B7280"} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Alert List */}
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {alerts.length === 0 ? (
          <View className="items-center py-12">
            <ShieldCheck size={48} color={theme.success} strokeWidth={1.5} />
            <Text
              className={`text-base font-medium mt-4 ${
                isDark ? "text-text-secondary-dark" : "text-text-secondary"
              }`}
            >
              {t("antiStalking.alertSheet.noAlerts")}
            </Text>
          </View>
        ) : (
          alerts.map((alert) => {
            const durationMin = Math.max(
              1,
              Math.round(alert.durationMs / 60_000),
            );
            const deviceLabel =
              alert.deviceName ?? alert.trackerType ?? t("common.unknown");

            return (
              <View
                key={alert.id}
                className={`mb-4 rounded-xl overflow-hidden ${
                  isDark ? "bg-surface-dark" : "bg-surface"
                }`}
                style={{
                  borderWidth: 1,
                  borderColor: isDark ? theme.border : "#E5E7EB",
                }}
              >
                {/* Device Info */}
                <View className="px-4 pt-3 pb-2">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Radio size={16} color={theme.error} strokeWidth={2} />
                      <Text
                        className={`text-sm font-bold ml-2 ${
                          isDark
                            ? "text-text-primary-dark"
                            : "text-text-primary"
                        }`}
                        numberOfLines={1}
                      >
                        {deviceLabel}
                      </Text>
                    </View>
                    {alert.trackerBrand && (
                      <View
                        className="px-2 py-0.5 rounded-full ml-2"
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
                </View>

                {/* Timeline */}
                <View className="px-4 pb-2">
                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center">
                      <Clock
                        size={12}
                        color={theme.textTertiary}
                        strokeWidth={2}
                      />
                      <Text
                        className={`text-xs ml-1 ${
                          isDark
                            ? "text-text-tertiary-dark"
                            : "text-text-tertiary"
                        }`}
                      >
                        {formatTime(alert.firstSeen)} -{" "}
                        {formatTime(alert.lastSeen)} ({durationMin} min)
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Signal
                        size={12}
                        color={theme.textTertiary}
                        strokeWidth={2}
                      />
                      <Text
                        className={`text-xs ml-1 ${
                          isDark
                            ? "text-text-tertiary-dark"
                            : "text-text-tertiary"
                        }`}
                      >
                        {Math.round(alert.avgRssi)} dBm
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View
                  className="flex-row px-4 py-2 gap-2"
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: isDark ? theme.border : "#E5E7EB",
                  }}
                >
                  <Pressable
                    onPress={() => onDismiss(alert.id)}
                    className="flex-1 flex-row items-center justify-center py-2 rounded-lg active:opacity-70"
                  >
                    <CheckCircle
                      size={14}
                      color={theme.textSecondary}
                      strokeWidth={2}
                    />
                    <Text
                      className={`text-xs font-medium ml-1.5 ${
                        isDark
                          ? "text-text-secondary-dark"
                          : "text-text-secondary"
                      }`}
                    >
                      {t("antiStalking.alert.dismiss")}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      onTrustDevice(alert.deviceId, alert.deviceName)
                    }
                    className="flex-1 flex-row items-center justify-center py-2 rounded-lg active:opacity-70"
                    style={{ backgroundColor: `${theme.success}10` }}
                  >
                    <ShieldCheck
                      size={14}
                      color={theme.success}
                      strokeWidth={2}
                    />
                    <Text
                      className="text-xs font-medium ml-1.5"
                      style={{ color: theme.success }}
                    >
                      {t("antiStalking.alert.trustDevice")}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

export { StalkerAlertSheet };
