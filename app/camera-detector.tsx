/**
 * Camera Detector Screen
 *
 * Premium pillar: helps find hidden Wi-Fi cameras using two techniques.
 *  - Type A: nearby Wi-Fi APs ranked by camera suspicion → RF "hunt" by RSSI.
 *  - Type B: scan the local network for camera-like hosts (open RTSP/ONVIF...).
 *
 * Honest by design: surfaces suspects and guidance, never a "you are safe"
 * verdict. All copy is internationalized (no hardcoded strings).
 */

import { useEffect } from "react";

import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  ChevronRight,
  Crosshair,
  Lightbulb,
  Lock,
  MapPin,
  Network,
  ScanSearch,
  ShieldAlert,
  Wifi,
} from "lucide-react-native";

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

import { PremiumBadge } from "@/components/premium/PremiumBadge";
import { RssiGraph } from "@/components/proximity/RssiGraph";
import { WifiRadar } from "@/components/wifi/WifiRadar";
import { WifiSignalBar } from "@/components/wifi/WifiSignalBar";

import { useCameraDetector } from "@/hooks";
import { useRssiGraph } from "@/hooks/useRssiGraph";

import { useI18n } from "@/lib/i18n";
import { safePush } from "@/lib/navigation";

import { formatDistance } from "@/services/proximity";
import { wifiService } from "@/services/wifi/wifi.service";

import type {
  NetworkCameraHost,
  SuspectAp,
  SuspicionLevel,
} from "@/services/camera-detector";

import { useIsPremium } from "@/stores/usePremiumStore";
import { useTheme } from "@/theme";

type Theme = ReturnType<typeof useTheme>["theme"];

// ============================================================================
// Screen
// ============================================================================
const CameraDetectorScreen = () => {
  const { theme, isDark } = useTheme();
  const { t } = useI18n();

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const isPremium = useIsPremium();
  const detector = useCameraDetector();
  const rssiGraph = useRssiGraph();

  const { phase, huntData } = detector;

  // Feed RSSI samples to the graph while hunting.
  useEffect(() => {
    if (huntData) rssiGraph.addSample(huntData.rssi);
  }, [huntData?.lastUpdate, rssiGraph.addSample]); // eslint-disable-line react-hooks/exhaustive-deps

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (phase === "hunting") {
      detector.stopHunt();
      rssiGraph.clear();
      return;
    }
    router.back();
  };

  const handleScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isPremium) {
      safePush(router, "/paywall");
      return;
    }
    detector.scanAps();
  };

  const bg = isDark ? "bg-background-dark" : "bg-background";

  return (
    <View className={`flex-1 ${bg}`} style={{ paddingTop: insets.top }}>
      <Header
        theme={theme}
        isDark={isDark}
        t={t}
        onBack={goBack}
        showPro={!isPremium}
      />

      {phase === "idle" && (
        <IntroState
          theme={theme}
          isDark={isDark}
          t={t}
          isPremium={isPremium}
          onScan={handleScan}
          insets={insets}
        />
      )}

      {phase === "scanning" && (
        <CenteredLoader theme={theme} isDark={isDark} label={t("cameraDetector.scanning")} />
      )}

      {phase === "results" && (
        <ResultsState
          detector={detector}
          theme={theme}
          isDark={isDark}
          t={t}
          insets={insets}
        />
      )}

      {phase === "hunting" && detector.selectedAp && (
        <HuntState
          ap={detector.selectedAp}
          huntData={huntData}
          rssiSamples={rssiGraph.samples}
          theme={theme}
          isDark={isDark}
          t={t}
          insets={insets}
          onStop={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            detector.stopHunt();
            rssiGraph.clear();
          }}
        />
      )}

      {phase === "error" && (
        <ErrorState
          detector={detector}
          theme={theme}
          isDark={isDark}
          t={t}
        />
      )}

      {phase === "unavailable" && (
        <SimpleMessage
          icon={<AlertTriangle size={48} color={theme.error} strokeWidth={2} />}
          title={t("cameraDetector.errors.notAndroid.title")}
          message={t("cameraDetector.errors.notAndroid.message")}
          theme={theme}
          isDark={isDark}
        />
      )}
    </View>
  );
};

// ============================================================================
// Header
// ============================================================================
const Header = ({
  theme,
  isDark,
  t,
  onBack,
  showPro,
}: {
  theme: Theme;
  isDark: boolean;
  t: (k: string) => string;
  onBack: () => void;
  showPro: boolean;
}) => (
  <View className="flex-row items-center px-4 py-3">
    <Pressable
      onPress={onBack}
      className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
        isDark ? "bg-surface-dark" : "bg-surface"
      }`}
      hitSlop={8}
    >
      <ArrowLeft size={20} color={isDark ? "#E5E7EB" : "#374151"} />
    </Pressable>
    <View className="flex-1">
      <View className="flex-row items-center gap-2">
        <Text
          className={`text-lg font-bold ${
            isDark ? "text-text-primary-dark" : "text-text-primary"
          }`}
        >
          {t("cameraDetector.title")}
        </Text>
        {showPro && <PremiumBadge size="sm" />}
      </View>
      <Text
        className={`text-xs ${
          isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
        }`}
      >
        {t("cameraDetector.subtitle")}
      </Text>
    </View>
  </View>
);

// ============================================================================
// Intro
// ============================================================================
const IntroState = ({
  theme,
  isDark,
  t,
  isPremium,
  onScan,
  insets,
}: {
  theme: Theme;
  isDark: boolean;
  t: (k: string) => string;
  isPremium: boolean;
  onScan: () => void;
  insets: { bottom: number };
}) => {
  const tips: { icon: React.ReactNode; key: string }[] = [
    { icon: <Wifi size={18} color={theme.primary} />, key: "wifi" },
    { icon: <Network size={18} color={theme.primary} />, key: "network" },
    { icon: <Camera size={18} color={theme.primary} />, key: "physical" },
  ];

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        entering={FadeInDown.delay(60).duration(400)}
        className="items-center mb-6"
      >
        <View
          className="w-20 h-20 rounded-3xl items-center justify-center mb-4"
          style={{ backgroundColor: `${theme.primary}1A` }}
        >
          <ScanSearch size={40} color={theme.primary} strokeWidth={2} />
        </View>
        <Text
          className={`text-2xl font-bold text-center mb-2 ${
            isDark ? "text-text-primary-dark" : "text-text-primary"
          }`}
        >
          {t("cameraDetector.intro.title")}
        </Text>
        <Text
          className={`text-base text-center leading-6 ${
            isDark ? "text-text-secondary-dark" : "text-text-secondary"
          }`}
        >
          {t("cameraDetector.intro.body")}
        </Text>
      </Animated.View>

      {/* How it helps */}
      <View className="gap-3 mb-6">
        {tips.map((tip, i) => (
          <Animated.View
            key={tip.key}
            entering={FadeInDown.delay(120 + i * 60).duration(400)}
            className={`flex-row items-start gap-3 p-4 rounded-2xl ${
              isDark ? "bg-surface-dark" : "bg-surface"
            }`}
          >
            <View className="mt-0.5">{tip.icon}</View>
            <View className="flex-1">
              <Text
                className={`text-sm font-semibold mb-0.5 ${
                  isDark ? "text-text-primary-dark" : "text-text-primary"
                }`}
              >
                {t(`cameraDetector.intro.tips.${tip.key}.title`)}
              </Text>
              <Text
                className={`text-sm leading-5 ${
                  isDark ? "text-text-secondary-dark" : "text-text-secondary"
                }`}
              >
                {t(`cameraDetector.intro.tips.${tip.key}.body`)}
              </Text>
            </View>
          </Animated.View>
        ))}
      </View>

      {/* Honest disclaimer */}
      <Animated.View
        entering={FadeInDown.delay(320).duration(400)}
        className="flex-row items-start gap-3 p-4 rounded-2xl mb-6"
        style={{ backgroundColor: `${theme.warning}1A` }}
      >
        <ShieldAlert size={18} color={theme.warning} className="mt-0.5" />
        <Text
          className={`flex-1 text-xs leading-5 ${
            isDark ? "text-text-secondary-dark" : "text-text-secondary"
          }`}
        >
          {t("cameraDetector.intro.disclaimer")}
        </Text>
      </Animated.View>

      {/* Scan CTA */}
      <Animated.View entering={FadeInDown.delay(380).duration(400)}>
        <Pressable
          onPress={onScan}
          className="py-4 rounded-xl flex-row items-center justify-center gap-2"
          style={{ backgroundColor: theme.primary }}
        >
          {!isPremium && <Lock size={16} color="#FFFFFF" />}
          <Text className="text-white font-semibold text-base">
            {t("cameraDetector.scanButton")}
          </Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
};

// ============================================================================
// Results (Type A suspects + Type B network)
// ============================================================================
const ResultsState = ({
  detector,
  theme,
  isDark,
  t,
  insets,
}: {
  detector: ReturnType<typeof useCameraDetector>;
  theme: Theme;
  isDark: boolean;
  t: (k: string) => string;
  insets: { bottom: number };
}) => {
  const { suspects, networkScanState, networkHosts, networkProgress } = detector;

  const onScanNetwork = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    detector.scanNetwork();
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: insets.bottom + 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* ---- Type A: nearby APs ---- */}
      <SectionHeader
        icon={<Wifi size={18} color={theme.primary} />}
        title={t("cameraDetector.results.suspectsTitle")}
        subtitle={t("cameraDetector.results.suspectsSubtitle")}
        theme={theme}
        isDark={isDark}
      />

      {suspects.length === 0 ? (
        <EmptyHint text={t("cameraDetector.results.noSuspects")} isDark={isDark} />
      ) : (
        <View className="gap-2.5 mb-6">
          {suspects.map((ap, i) => (
            <SuspectCard
              key={ap.bssid || `ap-${i}`}
              ap={ap}
              theme={theme}
              isDark={isDark}
              t={t}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                detector.selectAp(ap);
              }}
            />
          ))}
        </View>
      )}

      {/* ---- Type B: network scan ---- */}
      <SectionHeader
        icon={<Network size={18} color={theme.primary} />}
        title={t("cameraDetector.results.networkTitle")}
        subtitle={t("cameraDetector.results.networkSubtitle")}
        theme={theme}
        isDark={isDark}
      />

      {networkScanState === "scanning" ? (
        <View
          className={`p-4 rounded-2xl items-center mb-4 ${
            isDark ? "bg-surface-dark" : "bg-surface"
          }`}
        >
          <ActivityIndicator color={theme.primary} />
          <Text
            className={`text-sm mt-2 ${
              isDark ? "text-text-secondary-dark" : "text-text-secondary"
            }`}
          >
            {t("cameraDetector.results.networkScanning")}{" "}
            {Math.round(networkProgress * 100)}%
          </Text>
        </View>
      ) : networkScanState === "unavailable" ? (
        <EmptyHint
          text={t("cameraDetector.results.networkUnavailable")}
          isDark={isDark}
        />
      ) : networkScanState === "error" ? (
        <EmptyHint
          text={t("cameraDetector.results.networkError")}
          isDark={isDark}
        />
      ) : (
        <>
          {networkHosts.length > 0 && (
            <View className="gap-2.5 mb-3">
              {networkHosts.map((host) => (
                <NetworkHostCard
                  key={host.ip}
                  host={host}
                  theme={theme}
                  isDark={isDark}
                  t={t}
                />
              ))}
            </View>
          )}
          {networkScanState === "done" && networkHosts.length === 0 && (
            <EmptyHint
              text={t("cameraDetector.results.networkNone")}
              isDark={isDark}
            />
          )}
          <Pressable
            onPress={onScanNetwork}
            className={`flex-row items-center justify-center gap-2 py-3.5 rounded-xl mb-6 ${
              isDark ? "bg-surface-dark" : "bg-surface"
            }`}
            style={{ borderWidth: 1, borderColor: `${theme.primary}40` }}
          >
            <Network size={18} color={theme.primary} />
            <Text className="font-semibold text-sm" style={{ color: theme.primary }}>
              {networkScanState === "done"
                ? t("cameraDetector.results.networkRescan")
                : t("cameraDetector.results.networkScanButton")}
            </Text>
          </Pressable>
        </>
      )}

      {/* ---- Footer + rescan ---- */}
      <View
        className="flex-row items-start gap-3 p-4 rounded-2xl mb-4"
        style={{ backgroundColor: `${theme.warning}14` }}
      >
        <ShieldAlert size={16} color={theme.warning} className="mt-0.5" />
        <Text
          className={`flex-1 text-xs leading-5 ${
            isDark ? "text-text-secondary-dark" : "text-text-secondary"
          }`}
        >
          {t("cameraDetector.footer")}
        </Text>
      </View>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          detector.scanAps();
        }}
        className="py-4 rounded-xl border-2"
        style={{ borderColor: theme.primary }}
      >
        <Text
          className="text-center font-semibold text-base"
          style={{ color: theme.primary }}
        >
          {t("cameraDetector.rescanButton")}
        </Text>
      </Pressable>
    </ScrollView>
  );
};

// ============================================================================
// Hunt (RF proximity to selected AP)
// ============================================================================
const HuntState = ({
  ap,
  huntData,
  rssiSamples,
  theme,
  isDark,
  t,
  insets,
  onStop,
}: {
  ap: SuspectAp;
  huntData: ReturnType<typeof useCameraDetector>["huntData"];
  rssiSamples: { value: number; timestamp: number }[];
  theme: Theme;
  isDark: boolean;
  t: (k: string) => string;
  insets: { bottom: number };
  onStop: () => void;
}) => {
  const level = huntData?.level ?? "unknown";
  const strength = huntData?.strength ?? 0;
  const quality = huntData
    ? wifiService.getSignalQualityFromRssi(huntData.smoothedRssi)
    : "poor";

  const guidance = t(`cameraDetector.hunt.guidance.${level}`);

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingBottom: insets.bottom + 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.Text
        entering={FadeInDown.delay(60).duration(400)}
        className={`text-xl font-bold text-center mt-2 ${
          isDark ? "text-text-primary-dark" : "text-text-primary"
        }`}
        numberOfLines={1}
      >
        {ap.ssid?.trim() || t("cameraDetector.hiddenSsid")}
      </Animated.Text>
      <Text
        className={`text-xs text-center mb-4 font-mono ${
          isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
        }`}
      >
        {ap.bssid}
        {ap.vendor ? ` · ${ap.vendor}` : ""}
      </Text>

      <Animated.View entering={FadeIn.delay(150).duration(500)}>
        <WifiRadar
          strength={strength}
          quality={quality}
          size={180}
          isActive={!!huntData}
          isDark={isDark}
          theme={theme}
        />
      </Animated.View>

      {/* Distance */}
      <Animated.View
        entering={FadeInDown.delay(220).duration(400)}
        className="items-center mb-3"
      >
        <Crosshair size={18} color={theme.primary} />
        <Text
          className="text-xs uppercase font-bold mt-1"
          style={{ color: isDark ? "#D1D5DB" : "#4B5563" }}
        >
          {t("cameraDetector.hunt.estimatedDistance")}
        </Text>
        <Text className="text-4xl font-bold" style={{ color: theme.primary }}>
          {formatDistance(huntData?.distance ?? null)}
        </Text>
        <Text className="text-xs mt-1" style={{ color: isDark ? "#9CA3AF" : "#6B7280" }}>
          {t("cameraDetector.hunt.approximation")}
        </Text>
      </Animated.View>

      {/* Warmer/colder guidance */}
      <Animated.View
        entering={FadeInDown.delay(280).duration(400)}
        className="p-3 rounded-2xl mb-4 items-center"
        style={{ backgroundColor: `${theme.primary}14` }}
      >
        <Text className="text-base font-semibold" style={{ color: theme.primary }}>
          {guidance}
        </Text>
      </Animated.View>

      {/* Signal bar */}
      <Animated.View
        entering={FadeInDown.delay(340).duration(400)}
        className={`p-4 rounded-2xl mb-4 ${isDark ? "bg-surface-dark" : "bg-surface"}`}
      >
        <WifiSignalBar
          strength={strength}
          quality={quality}
          isDark={isDark}
          theme={theme}
          t={t}
        />
      </Animated.View>

      {/* RSSI graph */}
      <Animated.View
        entering={FadeInDown.delay(400).duration(400)}
        className="mb-4"
      >
        <Text
          className={`text-xs font-semibold uppercase tracking-wide mb-3 ${
            isDark ? "text-text-secondary-dark" : "text-text-secondary"
          }`}
        >
          {t("cameraDetector.hunt.rssiTitle")}
        </Text>
        <RssiGraph samples={rssiSamples} isDark={isDark} theme={theme} t={t} />
      </Animated.View>

      {/* Throttle honesty note */}
      <View className="flex-row items-start gap-2 mb-5 px-1">
        <Lightbulb size={14} color={theme.textTertiary} className="mt-0.5" />
        <Text
          className={`flex-1 text-xs leading-5 ${
            isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
          }`}
        >
          {t("cameraDetector.hunt.throttleNote")}
        </Text>
      </View>

      <Pressable
        onPress={onStop}
        className="py-4 rounded-xl border-2"
        style={{ borderColor: theme.primary }}
      >
        <Text className="text-center font-semibold text-base" style={{ color: theme.primary }}>
          {t("cameraDetector.hunt.back")}
        </Text>
      </Pressable>
    </ScrollView>
  );
};

// ============================================================================
// Error
// ============================================================================
const ErrorState = ({
  detector,
  theme,
  isDark,
  t,
}: {
  detector: ReturnType<typeof useCameraDetector>;
  theme: Theme;
  isDark: boolean;
  t: (k: string) => string;
}) => {
  const code = detector.error?.code;
  const isLocation = code === "LOCATION_OFF";

  const title = isLocation
    ? t("cameraDetector.errors.locationOff.title")
    : t("cameraDetector.errors.scanFailed.title");
  const message = isLocation
    ? t("cameraDetector.errors.locationOff.message")
    : t("cameraDetector.errors.scanFailed.message");

  return (
    <View className="flex-1 items-center px-8 mt-24">
      <View
        className="w-24 h-24 rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: `${theme.error}20` }}
      >
        {isLocation ? (
          <MapPin size={48} color={theme.error} strokeWidth={2} />
        ) : (
          <AlertTriangle size={48} color={theme.error} strokeWidth={2} />
        )}
      </View>
      <Text
        className={`text-2xl font-bold text-center mb-3 ${
          isDark ? "text-text-primary-dark" : "text-text-primary"
        }`}
      >
        {title}
      </Text>
      <Text
        className={`text-base text-center mb-8 ${
          isDark ? "text-text-secondary-dark" : "text-text-secondary"
        }`}
      >
        {message}
      </Text>

      <View className="w-full gap-3">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            detector.scanAps();
          }}
          className="py-4 rounded-xl"
          style={{ backgroundColor: theme.primary }}
        >
          <Text className="text-white font-semibold text-base text-center">
            {t("cameraDetector.errors.retry")}
          </Text>
        </Pressable>
        {isLocation && (
          <Pressable
            onPress={() => Linking.openSettings()}
            className="py-4 rounded-xl border-2"
            style={{ borderColor: theme.primary }}
          >
            <Text
              className="text-center font-semibold text-base"
              style={{ color: theme.primary }}
            >
              {t("cameraDetector.errors.openSettings")}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

// ============================================================================
// Small shared building blocks
// ============================================================================
const SUSPICION_KEYS: Record<SuspicionLevel, string> = {
  high: "high",
  medium: "medium",
  low: "low",
  none: "none",
};

function suspicionColor(level: SuspicionLevel, theme: Theme): string {
  switch (level) {
    case "high":
      return theme.error;
    case "medium":
      return theme.warning;
    case "low":
      return theme.primary;
    default:
      return theme.textTertiary;
  }
}

const SuspectCard = ({
  ap,
  theme,
  isDark,
  t,
  onPress,
}: {
  ap: SuspectAp;
  theme: Theme;
  isDark: boolean;
  t: (k: string) => string;
  onPress: () => void;
}) => {
  const color = suspicionColor(ap.suspicion, theme);
  const name = ap.ssid?.trim() || t("cameraDetector.hiddenSsid");

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-3 p-3.5 rounded-2xl ${
        isDark ? "bg-surface-dark" : "bg-surface"
      }`}
      style={{ borderWidth: 1, borderColor: `${color}40` }}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={{ backgroundColor: `${color}1F` }}
      >
        <Wifi size={20} color={color} />
      </View>

      <View className="flex-1 min-w-0">
        <View className="flex-row items-center gap-2">
          <Text
            className={`text-sm font-semibold flex-shrink ${
              isDark ? "text-text-primary-dark" : "text-text-primary"
            }`}
            numberOfLines={1}
          >
            {name}
          </Text>
          <View
            className="px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${color}26` }}
          >
            <Text className="text-[10px] font-bold" style={{ color }}>
              {t(`cameraDetector.suspicion.${SUSPICION_KEYS[ap.suspicion]}`)}
            </Text>
          </View>
        </View>

        {/* Reasons */}
        {ap.reasons.length > 0 && (
          <Text
            className={`text-[11px] mt-0.5 ${
              isDark ? "text-text-secondary-dark" : "text-text-secondary"
            }`}
            numberOfLines={1}
          >
            {ap.reasons
              .map((r) => t(`cameraDetector.reasons.${r}`))
              .join(" · ")}
          </Text>
        )}

        <Text
          className={`text-[10px] mt-0.5 font-mono ${
            isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
          }`}
          numberOfLines={1}
        >
          {ap.rssi} dBm · {ap.band}
          {ap.vendor ? ` · ${ap.vendor}` : ""}
        </Text>
      </View>

      <ChevronRight size={18} color={theme.textTertiary} />
    </Pressable>
  );
};

const NetworkHostCard = ({
  host,
  theme,
  isDark,
  t,
}: {
  host: NetworkCameraHost;
  theme: Theme;
  isDark: boolean;
  t: (k: string) => string;
}) => {
  const color =
    host.confidence === "high"
      ? theme.error
      : host.confidence === "medium"
        ? theme.warning
        : theme.primary;

  return (
    <View
      className={`flex-row items-center gap-3 p-3.5 rounded-2xl ${
        isDark ? "bg-surface-dark" : "bg-surface"
      }`}
      style={{ borderWidth: 1, borderColor: `${color}40` }}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={{ backgroundColor: `${color}1F` }}
      >
        <Camera size={20} color={color} />
      </View>
      <View className="flex-1 min-w-0">
        <Text
          className={`text-sm font-semibold ${
            isDark ? "text-text-primary-dark" : "text-text-primary"
          }`}
        >
          {host.label ?? t(`cameraDetector.hostKind.${host.kind}`)}
        </Text>
        <Text
          className={`text-[11px] font-mono ${
            isDark ? "text-text-secondary-dark" : "text-text-secondary"
          }`}
        >
          {host.ip} · {t("cameraDetector.host.ports")}: {host.openPorts.join(", ")}
        </Text>
      </View>
    </View>
  );
};

const SectionHeader = ({
  icon,
  title,
  subtitle,
  theme,
  isDark,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  theme: Theme;
  isDark: boolean;
}) => (
  <View className="mt-5 mb-3">
    <View className="flex-row items-center gap-2">
      {icon}
      <Text
        className={`text-base font-bold ${
          isDark ? "text-text-primary-dark" : "text-text-primary"
        }`}
      >
        {title}
      </Text>
    </View>
    <Text
      className={`text-xs mt-0.5 ${
        isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
      }`}
    >
      {subtitle}
    </Text>
  </View>
);

const EmptyHint = ({ text, isDark }: { text: string; isDark: boolean }) => (
  <View
    className={`p-4 rounded-2xl mb-4 ${isDark ? "bg-surface-dark" : "bg-surface"}`}
  >
    <Text
      className={`text-sm text-center leading-5 ${
        isDark ? "text-text-secondary-dark" : "text-text-secondary"
      }`}
    >
      {text}
    </Text>
  </View>
);

const CenteredLoader = ({
  theme,
  isDark,
  label,
}: {
  theme: Theme;
  isDark: boolean;
  label: string;
}) => (
  <View className="flex-1 items-center justify-center px-8">
    <View
      className="w-24 h-24 rounded-full items-center justify-center mb-6"
      style={{ backgroundColor: `${theme.primary}20` }}
    >
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
    <Text
      className={`text-base text-center ${
        isDark ? "text-text-secondary-dark" : "text-text-secondary"
      }`}
    >
      {label}
    </Text>
  </View>
);

const SimpleMessage = ({
  icon,
  title,
  message,
  theme,
  isDark,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  theme: Theme;
  isDark: boolean;
}) => (
  <View className="flex-1 items-center px-8 mt-24">
    <View
      className="w-24 h-24 rounded-full items-center justify-center mb-6"
      style={{ backgroundColor: `${theme.error}20` }}
    >
      {icon}
    </View>
    <Text
      className={`text-2xl font-bold text-center mb-3 ${
        isDark ? "text-text-primary-dark" : "text-text-primary"
      }`}
    >
      {title}
    </Text>
    <Text
      className={`text-base text-center ${
        isDark ? "text-text-secondary-dark" : "text-text-secondary"
      }`}
    >
      {message}
    </Text>
  </View>
);

export default CameraDetectorScreen;
