/**
 * Environment Screen
 * Magnetic field and environmental interference monitoring
 * OPTIMIZED with Reanimated shared values ​​for maximum fluidity (60 FPS)
 *
 * States:
 * 1. Idle - Sensor off, waiting for interaction
 * 2. Initializing - Initializing sensor
 * 3. Monitoring - Monitoring in real time
 * 4. Unavailable - Device without magnetometer
 * 5. Error - Error accessing sensor
 */

import React from "react";
import * as Haptics from "expo-haptics";

import {
  AlertTriangle,
  Info,
  Lightbulb,
  ShieldCheck,
  Zap,
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
  AnimatedValue,
  EnvironmentIdleState,
  MagneticVisualizer,
} from "@/components/environment";
import { useEnvironment } from "@/hooks/useEnvironment";

import { useI18n } from "@/lib/i18n";
import { environmentService } from "@/services/environment/environment.service";

import { useTheme } from "@/theme";

const EnvironmentScreen = () => {
  const { theme, isDark } = useTheme();

  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const {
    state,
    magnitude,
    x,
    y,
    z,
    status,
    isAvailable,
    error,
    startMonitoring,
    stopMonitoring,
  } = useEnvironment();

  const statusColor = environmentService.getStatusColor(status, theme);

  const isLoading = state === "initializing";

  // Handler to initiate monitoring
  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startMonitoring();
  };

  // Handler to stop monitoring
  const handleStop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    stopMonitoring();
  };

  // status icon
  const getStatusIcon = () => {
    switch (status) {
      case "stable":
        return <ShieldCheck size={24} color={statusColor} />;
      case "moderate":
        return <Info size={24} color={statusColor} />;
      case "high":
        return <AlertTriangle size={24} color={statusColor} />;
      case "extreme":
        return <Zap size={24} color={statusColor} />;
    }
  };

  // ========================= STATE 1: IDLE =========================
  if (state === "idle") {
    return (
      <View
        className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background"}`}
        style={{ paddingTop: insets.top }}
      >
        <EnvironmentIdleState
          isDark={isDark}
          theme={theme}
          t={t}
          isLoading={isLoading}
          onStart={handleStart}
        />
      </View>
    );
  }

  // ========================= STAGE 2: INITIALIZING =========================
  if (state === "initializing") {
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
            {t("environment.initializing")}
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
  if (state === "unavailable" || !isAvailable) {
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
            {t("environment.unavailable.title")}
          </Text>

          <Text
            className={`text-base text-center ${
              isDark ? "text-text-secondary-dark" : "text-text-secondary"
            }`}
          >
            {t("environment.unavailable.message")}
          </Text>
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
            {t("environment.error.title")}
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

  // ========================= STATE 5: MONITORING =========================
  return (
    <ScrollView
      className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background"}`}
      contentContainerStyle={{
        paddingTop: insets.top + 50,
        paddingBottom: insets.bottom + 24,
        paddingHorizontal: 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Main Viewer - Uses shared value for fluidity */}
      <Animated.View
        className="mb-7"
        entering={FadeIn.delay(100).duration(400)}
      >
        <MagneticVisualizer
          magnitude={magnitude}
          color={statusColor}
          isDark={isDark}
        />
      </Animated.View>

      {/* Status Card */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <View
          className={`p-5 rounded-2xl flex-row items-center ${
            isDark ? "bg-surface-dark" : "bg-surface"
          }`}
          style={{ borderLeftWidth: 4, borderLeftColor: statusColor }}
        >
          <View className="mr-4">{getStatusIcon()}</View>
          <View className="flex-1">
            <Text
              className={`text-xs font-bold uppercase ${
                isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
              }`}
            >
              {t("environment.statusLabel")}
            </Text>
            <Text
              className={`text-lg font-bold ${
                isDark ? "text-text-primary-dark" : "text-text-primary"
              }`}
            >
              {t(`environment.status.${status}`)}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Technical Data (Axes) - Uses shared values ​​for fluidity */}
      <Animated.View
        entering={FadeInDown.delay(300).duration(400)}
        className="flex-row mt-4 gap-3"
      >
        {/* X axis */}
        <View
          className={`flex-1 p-3 rounded-xl items-center ${
            isDark ? "bg-surface-dark" : "bg-surface"
          }`}
        >
          <Text
            className={`text-xs font-bold uppercase ${
              isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
            }`}
          >
            {t("environment.axis")} X
          </Text>
          <AnimatedValue
            value={x}
            decimals={1}
            className={`text-base font-mono font-bold mt-1 text-center ${
              isDark ? "text-text-primary-dark" : "text-text-primary"
            }`}
          />
        </View>

        {/* Y axis */}
        <View
          className={`flex-1 p-3 rounded-xl items-center ${
            isDark ? "bg-surface-dark" : "bg-surface"
          }`}
        >
          <Text
            className={`text-xs font-bold uppercase ${
              isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
            }`}
          >
            {t("environment.axis")} Y
          </Text>
          <AnimatedValue
            value={y}
            decimals={1}
            className={`text-base font-mono font-bold mt-1 text-center ${
              isDark ? "text-text-primary-dark" : "text-text-primary"
            }`}
          />
        </View>

        {/* Z axis */}
        <View
          className={`flex-1 p-3 rounded-xl items-center ${
            isDark ? "bg-surface-dark" : "bg-surface"
          }`}
        >
          <Text
            className={`text-xs font-bold uppercase ${
              isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
            }`}
          >
            {t("environment.axis")} Z
          </Text>
          <AnimatedValue
            value={z}
            decimals={1}
            className={`text-base font-mono font-bold mt-1 text-center ${
              isDark ? "text-text-primary-dark" : "text-text-primary"
            }`}
          />
        </View>
      </Animated.View>

      {/* Educational tip */}
      <Animated.View
        entering={FadeInDown.delay(400).duration(400)}
        className={`mt-4 p-4 rounded-xl flex-row items-start ${
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
          {t("environment.tip")}
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
            {t("environment.stopMonitoring")}
          </Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
};

export default EnvironmentScreen;
