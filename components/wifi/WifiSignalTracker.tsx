/**
 * WifiSignalTracker
 * Full-screen signal tracking view with radar, signal bar, distance estimate,
 * and signal history graph (premium).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { ArrowLeft, Router } from "lucide-react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import type { WifiConnectionInfo } from "@/services/wifi/wifi.types";
import type { SignalSample } from "./WifiSignalGraph";

import { PremiumGate } from "@/components/premium/PremiumGate";
import { wifiService } from "@/services/wifi/wifi.service";

import { WifiRadar } from "./WifiRadar";
import { WifiSignalBar } from "./WifiSignalBar";

import { WifiSignalGraph } from "./WifiSignalGraph";

interface WifiSignalTrackerProps {
  connection: WifiConnectionInfo;
  isDark: boolean;
  theme: {
    primary: string;
    success: string;
    warning: string;
    error: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    surface: string;
  };
  t: (key: string) => string;
  onBack: () => void;
}

const MAX_SIGNAL_SAMPLES = 80;

/** Estimate distance from Wi-Fi signal strength (rough approximation) */
function estimateDistance(strength: number | null): number | null {
  if (strength === null || strength <= 0) return null;

  // Convert 0-100 strength to approximate RSSI
  // strength 100 ≈ -30 dBm, strength 0 ≈ -100 dBm
  const rssi = (strength / 100) * 70 - 100;

  // Free-space path loss model (approximate for indoor)
  // distance = 10 ^ ((txPower - rssi) / (10 * n))
  const txPower = -30; // Typical Wi-Fi AP TX power at 1m
  const n = 3.0; // Indoor environment factor

  const distance = Math.pow(10, (txPower - rssi) / (10 * n));

  return Math.max(0.1, Math.min(distance, 50)); // Clamp 0.1m to 50m
}

function formatDistance(distance: number | null): string {
  if (distance === null) return "—";

  if (distance < 1) return `${(distance * 100).toFixed(0)} cm`;
  if (distance < 10) return `${distance.toFixed(1)} m`;

  return `${distance.toFixed(0)} m`;
}

const WifiSignalTracker = ({
  connection,
  isDark,
  theme,
  t,
  onBack,
}: WifiSignalTrackerProps) => {
  const quality = wifiService.getSignalQuality(connection.strength);
  const signalColor = wifiService.getSignalColor(quality, theme);

  const distance = estimateDistance(connection.strength);

  // Signal history samples
  const [samples, setSamples] = useState<SignalSample[]>([]);
  const samplesRef = useRef<SignalSample[]>([]);

  const addSample = useCallback((strength: number | null) => {
    if (strength === null) return;
    const sample: SignalSample = {
      value: Math.round(strength),
      timestamp: Date.now(),
    };

    samplesRef.current = [...samplesRef.current, sample].slice(
      -MAX_SIGNAL_SAMPLES,
    );
    setSamples(samplesRef.current);
  }, []);

  // Collect samples from connection updates
  useEffect(() => {
    addSample(connection.strength);
  }, [connection.strength, connection.timestamp, addSample]);

  return (
    <Animated.View entering={FadeIn.duration(300)} className="flex-1">
      {/* Header with back button, title and SSID */}
      <Animated.View
        entering={FadeInDown.delay(50).duration(300)}
        className="flex-row items-center px-6 mb-2"
      >
        <Pressable
          onPress={onBack}
          className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
            isDark ? "bg-surface-dark" : "bg-surface"
          }`}
        >
          <ArrowLeft size={20} color={isDark ? "#E5E7EB" : "#374151"} />
        </Pressable>
        <View className="flex-1">
          <Text
            className={`text-xs uppercase font-bold ${
              isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
            }`}
          >
            {t("wifi.tracker.title")}
          </Text>
          <Text
            className={`text-lg font-bold ${
              isDark ? "text-text-primary-dark" : "text-text-primary"
            }`}
            numberOfLines={1}
          >
            {connection.ssid ?? t("wifi.connection.hidden")}
          </Text>
        </View>
      </Animated.View>

      {/* Radar */}
      <Animated.View
        className="mt-8"
        entering={FadeInDown.delay(100).duration(400)}
      >
        <WifiRadar
          strength={connection.strength}
          quality={quality}
          size={180}
          isDark={isDark}
          theme={theme}
        />
      </Animated.View>

      {/* Distance estimate */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        className="items-center mb-4"
      >
        <View className="items-center mb-1">
          <Router size={18} color={signalColor} />
          <Text
            className="text-xs uppercase font-bold mt-1"
            style={{ color: isDark ? "#D1D5DB" : "#4B5563" }}
          >
            {t("wifi.tracker.estimatedDistance")}
          </Text>
        </View>
        <Text className="text-4xl font-bold" style={{ color: signalColor }}>
          {formatDistance(distance)}
        </Text>
        <Text
          className="text-xs mt-1"
          style={{ color: isDark ? "#9CA3AF" : "#6B7280" }}
        >
          {t("wifi.tracker.approximation")}
        </Text>
      </Animated.View>

      {/* Signal bar */}
      <Animated.View
        entering={FadeInDown.delay(300).duration(400)}
        className="px-6 mb-4"
      >
        <View
          className={`p-4 rounded-2xl ${
            isDark ? "bg-surface-dark" : "bg-surface"
          }`}
        >
          <WifiSignalBar
            strength={connection.strength}
            quality={quality}
            isDark={isDark}
            theme={theme}
            t={t}
          />

          {/* Band and frequency info */}
          {connection.band !== "unknown" && (
            <View className="flex-row items-center justify-between mt-3">
              <Text
                className={`text-xs ${
                  isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
                }`}
              >
                {connection.band}
                {connection.frequency ? ` · ${connection.frequency} MHz` : ""}
              </Text>
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${theme.primary}20` }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: theme.primary }}
                >
                  {connection.band}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Signal graph (Premium) */}
      <Animated.View
        entering={FadeInDown.delay(400).duration(400)}
        className="px-6 mb-4"
      >
        <PremiumGate feature="wifi_signal_graph">
          <WifiSignalGraph
            samples={samples}
            isDark={isDark}
            theme={theme}
            t={t}
          />
        </PremiumGate>
      </Animated.View>
    </Animated.View>
  );
};

export { WifiSignalTracker };
