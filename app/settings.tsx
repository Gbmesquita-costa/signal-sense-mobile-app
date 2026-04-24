import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Crown, ShieldCheck, Trash2, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  SUPPORTED_LANGUAGES,
  useI18n,
  type SupportedLanguage,
} from "@/lib/i18n";

import { safePush } from "@/lib/navigation";
import { useTheme } from "@/theme";

import { PremiumBadge, PremiumGate } from "@/components/premium";
import {
  ExportSection,
  SettingsInfo,
  SettingsOption,
  SettingsSection,
} from "@/components/settings";

import { useExport } from "@/hooks/useExport";
import { useAntiStalking } from "@/hooks/useAntiStalking";

import { useIsPremium } from "@/stores/usePremiumStore";
import Constants from "expo-constants";

type ThemeMode = "light" | "dark" | "system";

const SettingsScreen = () => {
  const { theme, isDark, themeMode, setThemeMode } = useTheme();
  const { t, locale, setLocale } = useI18n();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isPremium = useIsPremium();
  const {
    isExportingSessions,
    isExportingDevices,
    exportSessions,
    exportDevices,
  } = useExport();

  const antiStalking = useAntiStalking();

  const openPaywall = () => safePush(router, "/paywall");
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  const themeOptions: { key: ThemeMode; labelKey: string }[] = [
    { key: "light", labelKey: "settings.theme.light" },
    { key: "dark", labelKey: "settings.theme.dark" },
    { key: "system", labelKey: "settings.theme.system" },
  ];

  const languageOptions: { key: SupportedLanguage; label: string }[] = [
    { key: "pt-BR", label: SUPPORTED_LANGUAGES["pt-BR"].name },
    { key: "en", label: SUPPORTED_LANGUAGES.en.name },
    { key: "es", label: SUPPORTED_LANGUAGES.es.name },
  ];

  return (
    <View
      className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background"}`}
    >
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className={`${isDark ? "bg-surface-dark" : "bg-surface"}`}
      >
        <View className="flex-row items-center justify-between px-4 py-4">
          <Text
            className={`text-xl font-bold ${
              isDark ? "text-text-primary-dark" : "text-text-primary"
            }`}
          >
            {t("settings.title")}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="p-2 -mr-2 active:opacity-70"
            hitSlop={8}
          >
            <X
              size={24}
              color={isDark ? theme.textPrimary : theme.textPrimary}
              strokeWidth={2}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme Section */}
        <SettingsSection title={t("settings.theme.title")}>
          {themeOptions.map((option, index) => (
            <SettingsOption
              key={option.key}
              label={t(option.labelKey)}
              selected={themeMode === option.key}
              onPress={() => setThemeMode(option.key)}
              isLast={index === themeOptions.length - 1}
            />
          ))}
        </SettingsSection>

        {/* Language Section */}
        <SettingsSection title={t("settings.language.title")}>
          {languageOptions.map((option, index) => (
            <SettingsOption
              key={option.key}
              label={option.label}
              selected={locale === option.key}
              onPress={() => setLocale(option.key)}
              isLast={index === languageOptions.length - 1}
            />
          ))}
        </SettingsSection>

        {/* Premium Section */}
        <SettingsSection title={t("settings.premium.title")}>
          {isPremium ? (
            <View className="flex-row items-center py-3 px-4">
              <Crown size={18} color="#F59E0B" strokeWidth={2} />
              <Text
                className={`ml-3 text-sm font-medium ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
              >
                {t("settings.premium.active")}
              </Text>
              <View className="ml-auto">
                <PremiumBadge size="sm" />
              </View>
            </View>
          ) : (
            <Pressable
              onPress={openPaywall}
              className="flex-row items-center py-3 px-4 active:opacity-70"
            >
              <Crown size={18} color="#F59E0B" strokeWidth={2} />
              <Text
                className={`ml-3 text-sm font-medium ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
              >
                {t("settings.premium.upgrade")}
              </Text>
              <Text
                className="ml-auto text-sm font-bold"
                style={{ color: "#F59E0B" }}
              >
                PRO
              </Text>
            </Pressable>
          )}
        </SettingsSection>

        {/* Anti-Stalking Section */}
        <SettingsSection title={t("settings.antiStalking.title")}>
          {/* Toggle - free */}
          <Pressable
            onPress={antiStalking.toggle}
            className="flex-row items-center py-3 px-4 active:opacity-70"
          >
            <ShieldCheck
              size={18}
              color={antiStalking.isMonitoring ? theme.success : theme.textSecondary}
              strokeWidth={2}
            />
            <View className="flex-1 ml-3">
              <Text
                className={`text-sm font-medium ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
              >
                {t("settings.antiStalking.enable")}
              </Text>
              <Text
                className={`text-xs ${isDark ? "text-text-tertiary-dark" : "text-text-tertiary"}`}
              >
                {t("settings.antiStalking.enableDesc")}
              </Text>
            </View>
            <View
              className="w-11 h-6 rounded-full justify-center"
              style={{
                backgroundColor: antiStalking.isMonitoring
                  ? theme.success
                  : `${theme.textSecondary}30`,
              }}
            >
              <View
                className="w-5 h-5 rounded-full bg-white shadow-sm"
                style={{ marginLeft: antiStalking.isMonitoring ? 22 : 2 }}
              />
            </View>
          </Pressable>

          {/* Trusted devices - premium */}
          <View
            className={`border-t ${isDark ? "border-border-dark" : "border-border"}`}
          >
            <PremiumGate feature="anti_stalking_config" inline>
              <View className="py-3 px-4">
                <Text
                  className={`text-sm font-medium mb-2 ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
                >
                  {t("settings.antiStalking.trustedDevices")}
                </Text>
                <Text
                  className={`text-xs mb-2 ${isDark ? "text-text-tertiary-dark" : "text-text-tertiary"}`}
                >
                  {t("settings.antiStalking.trustedDevicesDesc")}
                </Text>
                {antiStalking.trustedDevices.length === 0 ? (
                  <Text
                    className={`text-xs italic ${isDark ? "text-text-tertiary-dark" : "text-text-tertiary"}`}
                  >
                    {t("settings.antiStalking.noTrustedDevices")}
                  </Text>
                ) : (
                  antiStalking.trustedDevices.map((device) => (
                    <View
                      key={device.id}
                      className={`flex-row items-center py-2 ${isDark ? "border-border-dark" : "border-border"}`}
                    >
                      <ShieldCheck
                        size={14}
                        color={theme.success}
                        strokeWidth={2}
                      />
                      <Text
                        className={`flex-1 text-xs ml-2 ${isDark ? "text-text-secondary-dark" : "text-text-secondary"}`}
                        numberOfLines={1}
                      >
                        {device.deviceName ?? device.deviceId}
                      </Text>
                      <Pressable
                        onPress={() => antiStalking.untrustDevice(device.deviceId)}
                        className="p-1 active:opacity-70"
                        hitSlop={8}
                      >
                        <Trash2
                          size={14}
                          color={theme.error}
                          strokeWidth={2}
                        />
                      </Pressable>
                    </View>
                  ))
                )}
              </View>
            </PremiumGate>
          </View>
        </SettingsSection>

        {/* Export Section (premium) */}
        <SettingsSection title={t("settings.export.title")}>
          <PremiumGate feature="export" inline>
            <ExportSection
              isExportingSessions={isExportingSessions}
              isExportingDevices={isExportingDevices}
              onExportSessions={exportSessions}
              onExportDevices={exportDevices}
              t={t}
            />
          </PremiumGate>
        </SettingsSection>

        {/* About Section */}
        <SettingsSection title={t("settings.about.title")}>
          <SettingsInfo label={t("appName")} value={`v${appVersion}`} />
          <View
            className={`border-t ${
              isDark ? "border-border-dark" : "border-border"
            }`}
          >
            <SettingsInfo content={t("settings.about.description")} />
          </View>
        </SettingsSection>

        {/* Privacy Section */}
        <SettingsSection title={t("settings.privacy.title")}>
          <SettingsInfo content={t("settings.privacy.content")} />
        </SettingsSection>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
