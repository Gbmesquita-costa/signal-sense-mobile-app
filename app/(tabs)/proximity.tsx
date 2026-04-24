/**
 * Proximity Screen
 * Monitors proximity to a selected device
 */

import { AlertCircle, Bluetooth, MapPin } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef } from "react";

import * as Haptics from "expo-haptics";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useRouter } from "expo-router";

import { PremiumGate } from "@/components/premium";
import {
  EmptyProximity,
  ProximityIndicator,
  ProximityRadar,
  RssiGraph,
} from "@/components/proximity";

import { useProximity } from "@/hooks";
import { useRssiGraph } from "@/hooks/useRssiGraph";

import { useI18n } from "@/lib/i18n";

import { formatDistance } from "@/services/proximity";
import { useSelectedDevice } from "@/stores/useScanStore";

import { useTheme } from "@/theme";

const ProximityScreen = () => {
  const { theme, isDark } = useTheme();
  const { t } = useI18n();

  const insets = useSafeAreaInsets();
  const selectedDevice = useSelectedDevice();

  const proximity = useProximity();
  const rssiGraph = useRssiGraph();

  const { isRttActive } = proximity;

  // Feed RSSI data to graph — use lastUpdate as trigger so every update is captured
  useEffect(() => {
    if (proximity.proximityData) {
      rssiGraph.addSample(proximity.proximityData.rssi);
    }
  }, [proximity.proximityData?.lastUpdate, rssiGraph.addSample]);

  const isLoading = proximity.state === "initializing";

  const navigatingRef = useRef(false);
  const router = useRouter();

  const displayName = useMemo(() => {
    if (!selectedDevice) return t("common.unknownDevice");

    if (selectedDevice.name) return selectedDevice.name;
    if (selectedDevice.type === "ble" && selectedDevice.bleData?.localName) {
      return selectedDevice.bleData.localName;
    }

    const shortId = selectedDevice.id
      .replace(/^ble_/, "")
      .slice(-5)
      .toUpperCase();
    return `${t("common.unknownDevice")} (${shortId})`;
  }, [selectedDevice, t]);

  const handleStartMonitoring = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    proximity.startMonitoring();
  }, [proximity.startMonitoring]);

  const handleStopMonitoring = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    proximity.stopMonitoring();
  }, [proximity.stopMonitoring]);

  const handleGoToScan = useCallback(() => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(tabs)/scan");

    setTimeout(() => {
      navigatingRef.current = false;
    }, 500);
  }, [router]);

  const handleOpenSettings = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openSettings();
  }, []);

  // ============ STATE 1: NO DEVICE SELECTED ============
  if (!selectedDevice) {
    return (
      <View
        className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background"}`}
        style={{ paddingTop: insets.top }}
      >
        <EmptyProximity
          title={t("proximity.empty.title")}
          message={t("proximity.empty.message")}
          buttonText={t("proximity.empty.button")}
          isDark={isDark}
        />
      </View>
    );
  }

  // ========================= STATE 2: INITIALIZING =========================
  if (proximity.state === "initializing") {
    return (
      <View
        className={`flex-1 items-center ${
          isDark ? "bg-background-dark" : "bg-background"
        }`}
        style={{ paddingTop: insets.top }}
      >
        <Animated.View
          entering={FadeIn.duration(400)}
          className="flex-1 mt-52
          items-center px-8"
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
            {t("proximity.monitoringLoading")}
          </Text>

          <Pressable
            onPress={handleStopMonitoring}
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

  // ========================= STATE 3: ERROR (Bluetooth/Location disabled) ============
  if (proximity.state === "error" && proximity.error) {
    const isBluetoothError = proximity.error.code === "BLUETOOTH_OFF";
    const isLocationError = proximity.error.code === "LOCATION_OFF";

    // Determines the icon and text based on the error type
    const ErrorIcon = isBluetoothError ? Bluetooth : MapPin;

    const errorTitle = isBluetoothError
      ? t("proximity.errors.bluetoothOff.title")
      : isLocationError
        ? t("proximity.errors.locationOff.title")
        : t("proximity.errors.generic.title");

    const errorMessage = isBluetoothError
      ? t("proximity.errors.bluetoothOff.message")
      : isLocationError
        ? t("proximity.errors.locationOff.message")
        : proximity.error.message;

    return (
      <View
        className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background"}`}
        style={{ paddingTop: insets.top }}
      >
        <Animated.View
          entering={FadeIn.duration(400)}
          className="flex-1 items-center mt-32 px-8"
        >
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: `${theme.error}20` }}
          >
            <ErrorIcon size={48} color={theme.error} strokeWidth={2} />
          </View>

          <Text
            className={`text-2xl font-bold text-center mb-3 ${
              isDark ? "text-text-primary-dark" : "text-text-primary"
            }`}
          >
            {errorTitle}
          </Text>

          <Text
            className={`text-base text-center mb-8 ${
              isDark ? "text-text-secondary-dark" : "text-text-secondary"
            }`}
          >
            {errorMessage}
          </Text>

          <View className="w-full gap-3">
            <Pressable
              onPress={handleStartMonitoring}
              disabled={isLoading}
              className="py-4 rounded-xl flex-row items-center justify-center"
              style={{
                backgroundColor: theme.primary,
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? (
                <>
                  <Text className="text-white font-semibold text-base text-center">
                    {t("proximity.monitoringLoading")}
                  </Text>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                    className="ml-3"
                  />
                </>
              ) : (
                <Text className="text-white font-semibold text-base text-center">
                  {t("common.retry")}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={handleOpenSettings}
              className="py-4 rounded-xl border-2"
              style={{ borderColor: theme.primary }}
            >
              <Text
                className="text-center font-semibold text-base"
                style={{ color: theme.primary }}
              >
                {t("proximity.errors.openSettings")}
              </Text>
            </Pressable>

            {/* Button: Switch device */}
            <Pressable
              onPress={handleGoToScan}
              className={`py-4 rounded-xl ${
                isDark ? "bg-surface-dark" : "bg-surface"
              }`}
            >
              <Text
                className={`text-center font-semibold text-base ${
                  isDark ? "text-text-primary-dark" : "text-text-primary"
                }`}
              >
                {t("proximity.changeDevice")}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    );
  }

  // ============ STATE 3: MONITORING ============
  if (proximity.isMonitoring && proximity.proximityData) {
    const { level, rssi, smoothedRssi, distance } = proximity.proximityData;

    return (
      <ScrollView
        className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background"}`}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 24,
        }}
      >
        {/* Device name */}
        <Animated.Text
          entering={FadeInDown.delay(100).duration(400)}
          className={`text-2xl font-bold text-center mb-2 ${
            isDark ? "text-text-primary-dark" : "text-text-primary"
          }`}
        >
          {displayName}
        </Animated.Text>

        {/* Device ID (formatted) */}
        <Animated.Text
          entering={FadeInDown.delay(200).duration(400)}
          className={`text-sm text-center mb-8 font-mono ${
            isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
          }`}
        >
          {selectedDevice.id.replace(/^ble_/, "")}
        </Animated.Text>

        {/* Animated radar */}
        <Animated.View
          entering={FadeIn.delay(300).duration(500)}
          className="items-center mb-8"
        >
          <ProximityRadar
            level={level}
            smoothedRssi={smoothedRssi}
            size={180}
            isActive
            isDark={isDark}
          />
        </Animated.View>

        {/* Estimated distance */}
        {distance !== null && (
          <View className="items-center mb-6">
            <Animated.Text
              entering={FadeInDown.delay(400).duration(400)}
              className={`text-3xl font-bold text-center ${
                isDark ? "text-text-primary-dark" : "text-text-primary"
              }`}
            >
              {formatDistance(distance)}
            </Animated.Text>
            <View className="flex-row items-center mt-1">
              <Text
                className={`text-xs ${isDark ? "text-text-secondary-dark" : "text-text-secondary"}`}
              >
                {isRttActive
                  ? t("proximity.distance.real")
                  : t("proximity.distance.estimated")}
              </Text>
              {isRttActive && (
                <View className="ml-2 bg-green-500/20 px-2 py-0.5 rounded">
                  <Text className="text-green-500 text-[10px] font-bold">
                    {t("proximity.distance.precise")}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* intensity indicator */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(400)}
          className="mb-8"
        >
          <ProximityIndicator
            level={level}
            rssi={rssi}
            smoothedRssi={smoothedRssi}
            isDark={isDark}
          />
        </Animated.View>

        {/* RSSI Graph (premium) */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(400)}
          className="mb-8"
        >
          <Text
            className={`text-xs font-semibold uppercase tracking-wide mb-3 ${
              isDark ? "text-text-secondary-dark" : "text-text-secondary"
            }`}
          >
            {t("rssiGraph.title")}
          </Text>
          <PremiumGate feature="rssi_graph">
            <RssiGraph
              samples={rssiGraph.samples}
              isDark={isDark}
              theme={theme}
              t={t}
            />
          </PremiumGate>
        </Animated.View>

        <View className="gap-3">
          {/* Button: Stop monitoring */}
          <Pressable
            onPress={handleStopMonitoring}
            className="py-4 rounded-xl border-2"
            style={{ borderColor: theme.primary }}
          >
            <Text
              className="text-center font-semibold text-base"
              style={{ color: theme.primary }}
            >
              {t("proximity.stopMonitoring")}
            </Text>
          </Pressable>

          {/* Button: Switch device */}
          <Pressable
            onPress={handleGoToScan}
            className={`py-4 rounded-xl ${
              isDark ? "bg-surface-dark" : "bg-surface"
            }`}
          >
            <Text
              className={`text-center font-semibold text-base ${
                isDark ? "text-text-primary-dark" : "text-text-primary"
              }`}
            >
              {t("proximity.changeDevice")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // ============ STATE 4: SIGNAL LOST ============
  if (proximity.state === "signal-lost") {
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
            <AlertCircle size={48} color={theme.error} strokeWidth={2} />
          </View>

          <Text
            className={`text-2xl font-bold text-center mb-3 ${
              isDark ? "text-text-primary-dark" : "text-text-primary"
            }`}
          >
            {t("proximity.signalLost.title")}
          </Text>

          <Text
            className={`text-base text-center mb-8 ${
              isDark ? "text-text-secondary-dark" : "text-text-secondary"
            }`}
          >
            {t("proximity.signalLost.message")}
          </Text>

          <View className="w-full gap-3">
            {/* Button: Try again */}
            <Pressable
              onPress={handleStartMonitoring}
              disabled={isLoading}
              className="py-4 rounded-xl flex-row items-center justify-center"
              style={{
                backgroundColor: theme.primary,
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? (
                <>
                  <Text className="text-white font-semibold text-base text-center">
                    {t("proximity.monitoringLoading")}
                  </Text>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                    className="ml-3"
                  />
                </>
              ) : (
                <Text className="text-white font-semibold text-base text-center">
                  {t("proximity.signalLost.retry")}
                </Text>
              )}
            </Pressable>

            {/* Button: New Scan */}
            <Pressable
              onPress={handleGoToScan}
              className="py-4 rounded-xl border-2"
              style={{ borderColor: theme.primary }}
            >
              <Text
                className="text-center font-semibold text-base"
                style={{ color: theme.primary }}
              >
                {t("proximity.signalLost.newScan")}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    );
  }

  // ============ INITIAL STATUS: DEVICE SELECTED BUT NOT BEING MONITORED ============
  return (
    <View
      className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background"}`}
      style={{ paddingTop: insets.top }}
    >
      <Animated.View
        entering={FadeIn.duration(400)}
        className="flex-1 items-center mt-12 px-8"
      >
        {/* Device name */}
        <Text
          className={`text-2xl font-bold text-center mb-2 ${
            isDark ? "text-text-primary-dark" : "text-text-primary"
          }`}
        >
          {displayName}
        </Text>

        {/* Device ID (formatted) */}
        <Text
          className={`text-sm text-center mb-8 font-mono ${
            isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
          }`}
        >
          {selectedDevice.id.replace(/^ble_/, "")}
        </Text>

        {/* Radar (inactive) */}
        <View className="mb-8">
          <ProximityRadar
            level="unknown"
            size={180}
            isActive={false}
            isDark={isDark}
          />
        </View>

        <Text
          className={`text-base text-center mb-8 ${
            isDark ? "text-text-secondary-dark" : "text-text-secondary"
          }`}
        >
          {t("proximity.ready.message")}
        </Text>

        <View className="w-full gap-3">
          {/* Button: Start monitoring */}
          <Pressable
            onPress={handleStartMonitoring}
            disabled={isLoading}
            className="py-4 rounded-xl flex-row items-center justify-center"
            style={{
              backgroundColor: theme.primary,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? (
              <>
                <Text className="text-white font-semibold text-base text-center">
                  {t("proximity.monitoringLoading")}
                </Text>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                  className="ml-3"
                />
              </>
            ) : (
              <Text className="text-white font-semibold text-base text-center">
                {t("proximity.startMonitoring")}
              </Text>
            )}
          </Pressable>

          {/* Button: Switch device */}
          <Pressable
            onPress={handleGoToScan}
            className="py-4 rounded-xl border-2"
            style={{ borderColor: theme.primary }}
          >
            <Text
              className="text-center font-semibold text-base"
              style={{ color: theme.primary }}
            >
              {t("proximity.changeDevice")}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
};

export default ProximityScreen;
