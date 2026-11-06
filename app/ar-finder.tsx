/**
 * AR Signal Finder (Premium, experimental)
 *
 * Live camera preview with waves that flow towards the estimated direction
 * of one Wi-Fi access point. The direction comes from an on-device particle
 * filter that combines RSSI readings with the user's steps and heading
 * (services/signal-compass); it needs the user to walk a few steps before
 * it can point anywhere, and it stays an estimate.
 *
 * Route params: `bssid` and `ssid` of the target. Without them the screen
 * lists nearby networks to pick from.
 */

import { useCallback, useEffect, useState } from "react";

import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  ArrowLeft,
  Camera,
  Footprints,
  Radar,
  RefreshCw,
  Wifi,
} from "lucide-react-native";

import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SignalWaveOverlay } from "@/components/ar-finder";
import { PremiumBadge } from "@/components/premium/PremiumBadge";
import { PremiumGate } from "@/components/premium/PremiumGate";

import { useSignalCompass } from "@/hooks/useSignalCompass";
import { useI18n } from "@/lib/i18n";
import { formatDistance } from "@/services/proximity";

import { wifiService } from "@/services/wifi/wifi.service";
import type { WifiNetwork } from "@/services/wifi/wifi.types";

import { useTheme } from "@/theme";

type Theme = ReturnType<typeof useTheme>["theme"];

interface Target {
  bssid: string;
  ssid: string;
}

const ArFinderScreen = () => {
  const { theme, isDark } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const params = useLocalSearchParams<{ bssid?: string; ssid?: string }>();
  const [target, setTarget] = useState<Target | null>(
    params.bssid ? { bssid: params.bssid, ssid: params.ssid ?? "" } : null,
  );

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View
      testID="ar-finder-screen"
      className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background"}`}
    >
      <PremiumGate
        feature="ar_signal_finder"
        fallback={
          <View className="flex-1" style={{ paddingTop: insets.top }}>
            <Header
              title={t("arFinder.title")}
              onBack={goBack}
              isDark={isDark}
            />
            <Teaser theme={theme} isDark={isDark} />
          </View>
        }
      >
        {target ? (
          <FinderView
            target={target}
            onBack={goBack}
            onChangeTarget={() => setTarget(null)}
          />
        ) : (
          <View className="flex-1" style={{ paddingTop: insets.top }}>
            <Header
              title={t("arFinder.title")}
              onBack={goBack}
              isDark={isDark}
            />
            <NetworkPicker theme={theme} isDark={isDark} onPick={setTarget} />
          </View>
        )}
      </PremiumGate>
    </View>
  );
};

// ============================================================================
// Header
// ============================================================================
const Header = ({
  title,
  onBack,
  isDark,
  overlay = false,
}: {
  title: string;
  onBack: () => void;
  isDark: boolean;
  overlay?: boolean;
}) => {
  const { t } = useI18n();
  const textColor = overlay ? "#FFFFFF" : isDark ? "#F3F4F6" : "#111827";

  return (
    <View className="flex-row items-center px-4 py-3">
      <Pressable
        testID="ar-finder-back"
        onPress={onBack}
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{
          backgroundColor: overlay
            ? "rgba(0,0,0,0.45)"
            : isDark
              ? "#1F2937"
              : "#F3F4F6",
        }}
        hitSlop={8}
      >
        <ArrowLeft size={20} color={textColor} />
      </Pressable>
      <Text className="text-lg font-bold mr-2" style={{ color: textColor }}>
        {title}
      </Text>
      <PremiumBadge size="sm" />
      <View
        className="ml-2 px-1.5 py-0.5 rounded"
        style={{ backgroundColor: "rgba(99,102,241,0.25)" }}
      >
        <Text className="text-[9px] font-bold" style={{ color: textColor }}>
          {t("arFinder.experimental")}
        </Text>
      </View>
    </View>
  );
};

// ============================================================================
// Free users: what the feature does
// ============================================================================
const Teaser = ({ theme, isDark }: { theme: Theme; isDark: boolean }) => {
  const { t } = useI18n();

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <Animated.View entering={FadeIn.duration(400)} className="items-center">
        <View
          className="w-24 h-24 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: `${theme.primary}20` }}
        >
          <Radar size={44} color={theme.primary} />
        </View>
        <Text
          className={`text-xl font-bold text-center mb-3 ${
            isDark ? "text-text-primary-dark" : "text-text-primary"
          }`}
        >
          {t("arFinder.teaser.title")}
        </Text>
        <Text
          className={`text-sm text-center mb-6 ${
            isDark ? "text-text-secondary-dark" : "text-text-secondary"
          }`}
        >
          {t("arFinder.teaser.message")}
        </Text>
      </Animated.View>
      <PremiumGate feature="ar_signal_finder">{null}</PremiumGate>
    </ScrollView>
  );
};

// ============================================================================
// Pick the access point to locate
// ============================================================================
const NetworkPicker = ({
  theme,
  isDark,
  onPick,
}: {
  theme: Theme;
  isDark: boolean;
  onPick: (target: Target) => void;
}) => {
  const { t } = useI18n();
  const [networks, setNetworks] = useState<WifiNetwork[] | null>(null);

  const load = useCallback(() => {
    setNetworks(null);
    wifiService
      .scanNearbyNetworks()
      .then((list) => setNetworks([...list].sort((a, b) => b.rssi - a.rssi)))
      .catch(() => setNetworks([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const secondary = isDark ? "text-text-secondary-dark" : "text-text-secondary";
  const primary = isDark ? "text-text-primary-dark" : "text-text-primary";

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <View className="flex-row items-center justify-between mb-1">
        <Text className={`text-base font-bold ${primary}`}>
          {t("arFinder.pick.title")}
        </Text>
        <Pressable onPress={load} hitSlop={8} className="p-1.5">
          <RefreshCw size={16} color={theme.textTertiary} />
        </Pressable>
      </View>
      <Text className={`text-sm mb-4 ${secondary}`}>
        {t("arFinder.pick.hint")}
      </Text>

      {networks === null ? (
        <ActivityIndicator color={theme.primary} />
      ) : networks.length === 0 ? (
        <Text className={`text-sm text-center ${secondary}`}>
          {t("arFinder.pick.empty")}
        </Text>
      ) : (
        networks.map((net) => (
          <Pressable
            key={net.bssid}
            testID={`ar-finder-network-${net.bssid}`}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onPick({ bssid: net.bssid, ssid: net.ssid });
            }}
            className={`flex-row items-center p-4 mb-2 rounded-xl ${
              isDark ? "bg-surface-dark" : "bg-surface"
            }`}
          >
            <Wifi size={16} color={theme.primary} />
            <Text
              className={`flex-1 ml-3 text-sm font-semibold ${primary}`}
              numberOfLines={1}
            >
              {net.ssid || t("wifi.connection.hidden")}
            </Text>
            <Text className={`text-xs font-mono ${secondary}`}>
              {net.rssi} dBm
            </Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
};

// ============================================================================
// Camera + overlay
// ============================================================================
const FinderView = ({
  target,
  onBack,
  onChangeTarget,
}: {
  target: Target;
  onBack: () => void;
  onChangeTarget: () => void;
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const [permission, requestPermission] = useCameraPermissions();
  const granted = permission?.granted === true;

  const compass = useSignalCompass(granted ? target.bssid : null, {
    width,
    height,
  });
  const { snapshot } = compass;

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (!granted) {
    return (
      <View className="flex-1" style={{ paddingTop: insets.top }}>
        <Header title={t("arFinder.title")} onBack={onBack} isDark={isDark} />
        <View className="flex-1 items-center px-8 mt-24">
          <Camera size={48} color={theme.primary} />
          <Text
            className={`text-xl font-bold text-center mt-6 mb-3 ${
              isDark ? "text-text-primary-dark" : "text-text-primary"
            }`}
          >
            {t("arFinder.permission.title")}
          </Text>
          <Text
            className={`text-sm text-center mb-8 ${
              isDark ? "text-text-secondary-dark" : "text-text-secondary"
            }`}
          >
            {t("arFinder.permission.message")}
          </Text>
          <Pressable
            testID="ar-finder-grant-camera"
            onPress={() =>
              permission.canAskAgain
                ? requestPermission()
                : Linking.openSettings()
            }
            className="px-8 py-4 rounded-xl"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-white font-semibold text-base">
              {permission.canAskAgain
                ? t("arFinder.permission.grant")
                : t("arFinder.permission.settings")}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const quality =
    snapshot.rssi === null
      ? null
      : wifiService.getSignalQualityFromRssi(snapshot.rssi);
  const color = quality
    ? wifiService.getSignalColor(quality, theme)
    : "#FFFFFF";

  const estimate = snapshot.estimate;
  const showDirection =
    snapshot.status === "tracking" || snapshot.status === "calibrating";

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ position: "absolute", width, height }}
        facing="back"
      />

      {compass.sensorAvailable !== false && (
        <SignalWaveOverlay
          width={width}
          height={height}
          color={color}
          targetX={compass.targetX}
          targetY={compass.targetY}
          targetVisible={compass.targetVisible}
          turnHint={compass.turnHint}
        />
      )}

      <View style={{ paddingTop: insets.top }}>
        <Header
          title={target.ssid || t("wifi.connection.hidden")}
          onBack={onBack}
          isDark
          overlay
        />
      </View>

      <View
        className="absolute left-4 right-4 p-4 rounded-2xl"
        style={{
          bottom: insets.bottom + 16,
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      >
        {compass.sensorAvailable === false ? (
          <Text className="text-white text-sm">
            {t("arFinder.sensorUnavailable")}
          </Text>
        ) : (
          <>
            <Text
              testID="ar-finder-status"
              className="text-white font-bold text-base"
            >
              {t(`arFinder.status.${snapshot.status}`)}
            </Text>

            <View className="flex-row flex-wrap gap-x-4 gap-y-1 mt-2">
              {snapshot.rssi !== null && (
                <Text className="text-xs font-mono" style={{ color }}>
                  {Math.round(snapshot.rssi)} dBm
                </Text>
              )}
              {estimate && showDirection && (
                <Text className="text-xs text-white">
                  {t("arFinder.distance", {
                    distance: formatDistance(estimate.distance),
                  })}
                </Text>
              )}
              {estimate && (
                <Text className="text-xs text-white">
                  {t("arFinder.confidence", {
                    value: Math.round(estimate.confidence * 100),
                  })}
                </Text>
              )}
              <View className="flex-row items-center gap-1">
                <Footprints size={12} color="#FFFFFF" />
                <Text className="text-xs text-white">{snapshot.steps}</Text>
              </View>
            </View>

            <Text className="text-[11px] mt-3" style={{ color: "#D1D5DB" }}>
              {t("arFinder.scanNote")}
            </Text>
            <Text className="text-[11px] mt-1" style={{ color: "#D1D5DB" }}>
              {t("arFinder.disclaimer")}
            </Text>
          </>
        )}

        <Pressable
          testID="ar-finder-change-network"
          onPress={onChangeTarget}
          className="mt-3 py-2 rounded-xl border"
          style={{ borderColor: "rgba(255,255,255,0.4)" }}
        >
          <Text className="text-center text-white text-sm font-semibold">
            {t("arFinder.change")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ArFinderScreen;
