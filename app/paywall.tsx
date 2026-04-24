import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useRouter } from "expo-router";
import * as Localization from "expo-localization";

import {
  BarChart3,
  Crown,
  Download,
  Filter,
  Globe,
  History,
  RadioTower,
  ShieldCheck,
  Smartphone,
  Wifi,
  X,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePremium } from "@/hooks/usePremium";
import { useI18n } from "@/lib/i18n";

import { useTheme } from "@/theme";

// Regions eligible for regional pricing display
const REGIONAL_PRICING_REGIONS = new Set([
  "BR",
  "IN",
  "MX",
  "AR",
  "CO",
  "CL",
  "PE",
  "PH",
  "TR",
  "ID",
  "VN",
  "TH",
  "MY",
  "ZA",
  "NG",
  "EG",
  "PK",
  "BD",
  "UA",
  "RO",
  "PL",
  "CZ",
  "HU",
  "BG",
]);

const PREMIUM_COLOR = "#F59E0B";

interface FeatureRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isDark: boolean;
}

function FeatureRow({ icon, title, description, isDark }: FeatureRowProps) {
  return (
    <View className="flex-row items-start py-3">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: `${PREMIUM_COLOR}15` }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text
          className={`text-sm font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
        >
          {title}
        </Text>
        <Text
          className={`text-xs mt-0.5 ${isDark ? "text-text-tertiary-dark" : "text-text-tertiary"}`}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

function RegionalPricingBanner({
  isDark,
  t,
}: {
  isDark: boolean;
  t: (key: string) => string;
}) {
  const regionCode = useMemo(() => {
    const locales = Localization.getLocales();
    return locales[0]?.regionCode ?? null;
  }, []);

  if (!regionCode || !REGIONAL_PRICING_REGIONS.has(regionCode)) return null;

  return (
    <View
      className={`flex-row items-center rounded-xl px-4 py-3 mb-6 ${
        isDark ? "bg-surface-dark" : "bg-surface"
      }`}
      style={{ borderWidth: 1, borderColor: "#10B98130" }}
    >
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: "#10B98120" }}
      >
        <Globe size={16} color="#10B981" strokeWidth={2} />
      </View>
      <View className="flex-1">
        <Text
          className={`text-xs font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
          style={{ color: "#10B981" }}
        >
          {t("paywall.regionalPricing.title")}
        </Text>
        <Text
          className={`text-[11px] mt-0.5 ${isDark ? "text-text-tertiary-dark" : "text-text-tertiary"}`}
        >
          {t("paywall.regionalPricing.message")}
        </Text>
      </View>
    </View>
  );
}

const PaywallScreen = () => {
  const { theme, isDark } = useTheme();
  const { t } = useI18n();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { isPremium, isLoading, priceString, purchase, restore } = usePremium();
  const features = [
    {
      icon: <History size={20} color={PREMIUM_COLOR} strokeWidth={2} />,
      title: t("paywall.features.history.title"),
      description: t("paywall.features.history.desc"),
    },
    {
      icon: <Smartphone size={20} color={PREMIUM_COLOR} strokeWidth={2} />,
      title: t("paywall.features.deviceProfiles.title"),
      description: t("paywall.features.deviceProfiles.desc"),
    },
    {
      icon: <RadioTower size={20} color={PREMIUM_COLOR} strokeWidth={2} />,
      title: t("paywall.features.tracker.title"),
      description: t("paywall.features.tracker.desc"),
    },
    {
      icon: <BarChart3 size={20} color={PREMIUM_COLOR} strokeWidth={2} />,
      title: t("paywall.features.rssiGraph.title"),
      description: t("paywall.features.rssiGraph.desc"),
    },
    {
      icon: <Download size={20} color={PREMIUM_COLOR} strokeWidth={2} />,
      title: t("paywall.features.export.title"),
      description: t("paywall.features.export.desc"),
    },
    {
      icon: <Filter size={20} color={PREMIUM_COLOR} strokeWidth={2} />,
      title: t("paywall.features.filters.title"),
      description: t("paywall.features.filters.desc"),
    },
    {
      icon: <ShieldCheck size={20} color={PREMIUM_COLOR} strokeWidth={2} />,
      title: t("paywall.features.antiStalking.title"),
      description: t("paywall.features.antiStalking.desc"),
    },
    {
      icon: <Wifi size={20} color={PREMIUM_COLOR} strokeWidth={2} />,
      title: t("paywall.features.wifiInfo.title"),
      description: t("paywall.features.wifiInfo.desc"),
    },
  ];

  return (
    <View
      className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background"}`}
    >
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className={isDark ? "bg-surface-dark" : "bg-surface"}
      >
        <View className="flex-row items-center justify-between px-4 py-4">
          <Text
            className={`text-xl font-bold ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
          >
            {t("paywall.title")}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="p-2 -mr-2 active:opacity-70"
            hitSlop={8}
          >
            <X size={24} color={theme.textPrimary} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Crown icon */}
        <View className="items-center mb-6">
          <View
            className="w-20 h-20 rounded-full items-center justify-center"
            style={{ backgroundColor: `${PREMIUM_COLOR}20` }}
          >
            <Crown size={36} color={PREMIUM_COLOR} strokeWidth={2} />
          </View>
        </View>

        {/* Title */}
        <Text
          className={`text-2xl font-bold text-center mb-2 ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
        >
          {t("paywall.headline")}
        </Text>
        <Text
          className={`text-sm text-center mb-6 ${isDark ? "text-text-secondary-dark" : "text-text-secondary"}`}
        >
          {t("paywall.subheadline")}
        </Text>

        {/* Regional Pricing Banner */}
        <RegionalPricingBanner isDark={isDark} t={t} />

        {/* Features list */}
        <View
          className={`rounded-2xl p-4 mb-8 ${isDark ? "bg-surface-dark" : "bg-surface"}`}
        >
          {features.map((feature, i) => (
            <View key={i}>
              <FeatureRow
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                isDark={isDark}
              />
              {i < features.length - 1 && (
                <View
                  className={`h-px ${isDark ? "bg-border-dark" : "bg-border"}`}
                />
              )}
            </View>
          ))}
        </View>

        {/* Already premium */}
        {isPremium ? (
          <View
            className="rounded-xl p-4 items-center"
            style={{ backgroundColor: `${PREMIUM_COLOR}15` }}
          >
            <Crown size={24} color={PREMIUM_COLOR} strokeWidth={2} />
            <Text
              className="text-base font-bold mt-2"
              style={{ color: PREMIUM_COLOR }}
            >
              {t("paywall.alreadyPremium")}
            </Text>
          </View>
        ) : (
          <>
            {/* Purchase button */}
            <Pressable
              onPress={purchase}
              disabled={isLoading}
              className="rounded-xl py-4 items-center mb-3"
              style={{
                backgroundColor: PREMIUM_COLOR,
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              <Text className="text-white font-bold text-base">
                {priceString
                  ? t("paywall.buyButton").replace("{price}", priceString)
                  : t("paywall.buyButtonLoading")}
              </Text>
              <Text className="text-white/70 text-xs mt-0.5">
                {t("paywall.oneTimePurchase")}
              </Text>
            </Pressable>

            {/* Restore */}
            <Pressable
              onPress={restore}
              disabled={isLoading}
              className="py-3 items-center"
              style={{ opacity: isLoading ? 0.5 : 1 }}
            >
              <Text
                className={`text-sm ${isDark ? "text-text-secondary-dark" : "text-text-secondary"}`}
              >
                {t("paywall.restore")}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default PaywallScreen;
