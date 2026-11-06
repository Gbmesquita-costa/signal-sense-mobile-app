/**
 * Wi-Fi Info Screen
 * Network information and analysis
 *
 * States:
 * 1. Idle - Waiting for interaction
 * 2. Scanning - Fetching initial data
 * 3. Monitoring - Real-time connection info
 * 4. Unavailable - No network connection
 * 5. Error - Error accessing network info
 * 6. Tracking - Signal tracker mode (radar + distance)
 */

import * as Haptics from "expo-haptics";

import { useRouter } from "expo-router";
import React, { useState } from "react";

import {
  AlertTriangle,
  ChevronRight,
  Crosshair,
  Lightbulb,
  Radar,
  ScanSearch,
  WifiOff,
} from "lucide-react-native";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  WifiChannelChart,
  WifiConnectionCard,
  WifiIdleState,
  WifiNetworkList,
  WifiSignalTracker,
} from "@/components/wifi";

import { PremiumBadge } from "@/components/premium/PremiumBadge";
import { PremiumGate } from "@/components/premium/PremiumGate";
import { useWifi } from "@/hooks/useWifi";

import { useI18n } from "@/lib/i18n";
import { safePush } from "@/lib/navigation";
import type { WifiNetwork } from "@/services/wifi/wifi.types";
import { useTheme } from "@/theme";

const WifiScreen = () => {
  const { theme, isDark } = useTheme();
  const { t } = useI18n();

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isTracking, setIsTracking] = useState<boolean>(false);

  const openCameraDetector = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safePush(router, "/camera-detector");
  };

  const openArFinder = (network?: WifiNetwork) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safePush(
      router,
      network
        ? `/ar-finder?bssid=${encodeURIComponent(network.bssid)}&ssid=${encodeURIComponent(network.ssid)}`
        : "/ar-finder",
    );
  };

  const {
    state,
    connection,
    nearbyNetworks,
    channelAnalysis,
    error,
    isAndroid,
    isScanningNetworks,
    startMonitoring,
    stopMonitoring,
    refreshNetworks,
  } = useWifi();

  const isLoading = state === "scanning";

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startMonitoring();
  };

  const handleStop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setIsTracking(false);
    stopMonitoring();
  };

  const handleTrackSignal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsTracking(true);
  };

  const handleBackFromTracker = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsTracking(false);
  };

  // ========================= STATE 1: IDLE =========================
  if (state === "idle") {
    return (
      <View
        className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background"}`}
        style={{ paddingTop: insets.top }}
      >
        <WifiIdleState
          isDark={isDark}
          theme={theme}
          t={t}
          isLoading={isLoading}
          onStart={handleStart}
        />
      </View>
    );
  }

  // ========================= STATE 2: SCANNING =========================
  if (state === "scanning") {
    return (
      <View
        className={`flex-1 items-center ${
          isDark ? "bg-background-dark" : "bg-background"
        }`}
        style={{ paddingTop: insets.top }}
      >
        <Animated.View
          entering={FadeIn.duration(400)}
          className="flex-1 mt-52 items-center px-8"
        >
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: `${theme.primary}20` }}
          >
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
          <Text
            className={`text-xl font-bold text-center mb-2 ${
              isDark ? "text-text-primary-dark" : "text-text-primary"
            }`}
          >
            {t("common.loading")}
          </Text>
          <Text
            className={`text-base text-center mb-8 ${
              isDark ? "text-text-secondary-dark" : "text-text-secondary"
            }`}
          >
            {t("wifi.scanning")}
          </Text>

          <Pressable
            onPress={handleStop}
            className="py-3 px-8 rounded-xl border-2"
            style={{ borderColor: theme.primary }}
          >
            <Text
              className="text-center font-semibold text-base"
              style={{ color: theme.primary }}
            >
              {t("common.cancel")}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  // ========================= STATE 3: UNAVAILABLE =========================
  if (state === "unavailable") {
    return (
      <View
        className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background"}`}
        style={{ paddingTop: insets.top }}
      >
        <Animated.View
          entering={FadeIn.duration(400)}
          className="flex-1 items-center mt-44 px-8"
        >
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: `${theme.error}20` }}
          >
            <WifiOff size={48} color={theme.error} strokeWidth={2} />
          </View>

          <Text
            className={`text-2xl font-bold text-center mb-3 ${
              isDark ? "text-text-primary-dark" : "text-text-primary"
            }`}
          >
            {t("wifi.unavailable.title")}
          </Text>

          <Text
            className={`text-base text-center mb-8 ${
              isDark ? "text-text-secondary-dark" : "text-text-secondary"
            }`}
          >
            {t("wifi.unavailable.message")}
          </Text>

          <Pressable
            onPress={handleStart}
            className="px-8 py-4 rounded-xl"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-white font-semibold text-base">
              {t("common.retry")}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  // ========================= STATE 4: ERROR =========================
  if (state === "error" && error) {
    return (
      <View
        className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background"}`}
        style={{ paddingTop: insets.top }}
      >
        <Animated.View
          entering={FadeIn.duration(400)}
          className="flex-1 items-center mt-44 px-8"
        >
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: `${theme.error}20` }}
          >
            <AlertTriangle size={48} color={theme.error} strokeWidth={2} />
          </View>

          <Text
            className={`text-2xl font-bold text-center mb-3 ${
              isDark ? "text-text-primary-dark" : "text-text-primary"
            }`}
          >
            {t("wifi.error.title")}
          </Text>

          <Text
            className={`text-base text-center mb-8 ${
              isDark ? "text-text-secondary-dark" : "text-text-secondary"
            }`}
          >
            {error}
          </Text>

          <Pressable
            onPress={handleStart}
            disabled={isLoading}
            className="px-8 py-4 rounded-xl"
            style={{
              backgroundColor: theme.primary,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            <Text className="text-white font-semibold text-base">
              {t("common.retry")}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  // ========================= STATE 6: TRACKING =========================
  if (isTracking && connection) {
    return (
      <ScrollView
        className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background"}`}
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <WifiSignalTracker
          connection={connection}
          isDark={isDark}
          theme={theme}
          t={t}
          onBack={handleBackFromTracker}
        />

        {/* Stop button */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(400)}
          className="mt-2 px-6"
        >
          <Pressable
            onPress={handleStop}
            className="py-4 rounded-xl border-2"
            style={{ borderColor: theme.primary }}
          >
            <Text
              className="text-center font-semibold text-base"
              style={{ color: theme.primary }}
            >
              {t("wifi.stopMonitoring")}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    );
  }

  // ========================= STATE 5: MONITORING =========================
  return (
    <ScrollView
      className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background"}`}
      contentContainerStyle={{
        paddingTop: insets.top + 10,
        paddingBottom: insets.bottom + 24,
        paddingHorizontal: 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Connection Card (Free) — Tappable to enter tracker */}
      {connection && (
        <Animated.View
          className="mb-4"
          entering={FadeInDown.delay(100).duration(400)}
        >
          <WifiConnectionCard
            connection={connection}
            isDark={isDark}
            theme={theme}
            t={t}
          />
        </Animated.View>
      )}

      {/* Track Signal Button (Free) */}
      {connection?.isConnected && connection.type === "wifi" && (
        <Animated.View
          className="mb-4"
          entering={FadeInDown.delay(150).duration(400)}
        >
          <Pressable
            onPress={handleTrackSignal}
            className={`flex-row items-center justify-center gap-3 py-4 rounded-xl ${
              isDark ? "bg-surface-dark" : "bg-surface"
            }`}
            style={{
              borderWidth: 1,
              borderColor: `${theme.primary}40`,
            }}
          >
            <Crosshair size={20} color={theme.primary} strokeWidth={2} />
            <Text
              className="font-semibold text-base"
              style={{ color: theme.primary }}
            >
              {t("wifi.tracker.trackSignal")}
            </Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Hidden Camera Detector entry (Android only) */}
      {isAndroid && (
        <Animated.View
          className="mb-4"
          entering={FadeInDown.delay(175).duration(400)}
        >
          <Pressable
            onPress={openCameraDetector}
            className={`flex-row items-center gap-3 p-4 rounded-2xl ${
              isDark ? "bg-surface-dark" : "bg-surface"
            }`}
            style={{ borderWidth: 1, borderColor: `${theme.error}40` }}
          >
            <View
              className="w-11 h-11 rounded-xl items-center justify-center"
              style={{ backgroundColor: `${theme.error}1F` }}
            >
              <ScanSearch size={22} color={theme.error} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text
                  className={`text-sm font-bold ${
                    isDark ? "text-text-primary-dark" : "text-text-primary"
                  }`}
                >
                  {t("cameraDetector.entryTitle")}
                </Text>
                <PremiumBadge size="sm" />
              </View>
              <Text
                className={`text-xs mt-0.5 ${
                  isDark ? "text-text-secondary-dark" : "text-text-secondary"
                }`}
              >
                {t("cameraDetector.entrySubtitle")}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>
        </Animated.View>
      )}

      {/* AR Signal Finder entry (Premium, Android only) */}
      {isAndroid && (
        <Animated.View
          className="mb-4"
          entering={FadeInDown.delay(190).duration(400)}
        >
          <Pressable
            testID="wifi-ar-finder-entry"
            onPress={() => openArFinder()}
            className={`flex-row items-center gap-3 p-4 rounded-2xl ${
              isDark ? "bg-surface-dark" : "bg-surface"
            }`}
            style={{ borderWidth: 1, borderColor: `${theme.primary}40` }}
          >
            <View
              className="w-11 h-11 rounded-xl items-center justify-center"
              style={{ backgroundColor: `${theme.primary}1F` }}
            >
              <Radar size={22} color={theme.primary} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text
                  className={`text-sm font-bold ${
                    isDark ? "text-text-primary-dark" : "text-text-primary"
                  }`}
                >
                  {t("arFinder.entryTitle")}
                </Text>
                <PremiumBadge size="sm" />
              </View>
              <Text
                className={`text-xs mt-0.5 ${
                  isDark ? "text-text-secondary-dark" : "text-text-secondary"
                }`}
              >
                {t("arFinder.entrySubtitle")}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textSecondary} />
          </Pressable>
        </Animated.View>
      )}

      {/* Nearby Networks (Premium - Android only) */}
      {isAndroid && (
        <Animated.View
          className="mb-4"
          entering={FadeInDown.delay(200).duration(400)}
        >
          <PremiumGate feature="wifi_networks">
            <WifiNetworkList
              networks={nearbyNetworks}
              isScanning={isScanningNetworks}
              isDark={isDark}
              theme={theme}
              t={t}
              onRefresh={refreshNetworks}
              onLocate={openArFinder}
            />
          </PremiumGate>
        </Animated.View>
      )}

      {/* Channel Analysis (Premium) */}
      {isAndroid && channelAnalysis.length > 0 && (
        <Animated.View
          className="mb-4"
          entering={FadeInDown.delay(300).duration(400)}
        >
          <PremiumGate feature="wifi_channel_analysis">
            <WifiChannelChart
              channels={channelAnalysis}
              isDark={isDark}
              theme={theme}
              t={t}
            />
          </PremiumGate>
        </Animated.View>
      )}

      {/* Educational tip */}
      <Animated.View
        entering={FadeInDown.delay(400).duration(400)}
        className={`mt-2 p-4 rounded-xl flex-row items-start ${
          isDark ? "bg-surface-dark" : "bg-surface"
        }`}
      >
        <View className="mr-3 mt-0.5">
          <Lightbulb size={20} color={isDark ? "#FFFF00" : "#FFCC00"} />
        </View>
        <Text
          className={`flex-1 text-sm leading-5 ${
            isDark ? "text-text-secondary-dark" : "text-text-secondary"
          }`}
        >
          {t("wifi.tip")}
        </Text>
      </Animated.View>

      {/* Stop button */}
      <Animated.View
        entering={FadeInDown.delay(500).duration(400)}
        className="mt-6"
      >
        <Pressable
          onPress={handleStop}
          className="py-4 rounded-xl border-2"
          style={{ borderColor: theme.primary }}
        >
          <Text
            className="text-center font-semibold text-base"
            style={{ color: theme.primary }}
          >
            {t("wifi.stopMonitoring")}
          </Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
};

export default WifiScreen;
