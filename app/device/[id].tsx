import { FlashList } from "@shopify/flash-list";

import { useLocalSearchParams, useRouter } from "expo-router";
import { memo, useCallback, useState } from "react";

import {
  Activity,
  Bluetooth,
  Calendar,
  Clock,
  Edit3,
  Lock,
  RadioTower,
  Search,
  ShieldCheck,
  ShieldOff,
  X,
} from "lucide-react-native";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import * as Haptics from "expo-haptics";

import { PremiumBadge, PremiumGate } from "@/components/premium";
import { useAntiStalking } from "@/hooks";
import { useDeviceProfile } from "@/hooks/useDeviceProfile";

import { safePush } from "@/lib/navigation";

import type {
  DeviceProfile,
  DeviceSessionAppearance,
} from "@/services/history/history.types";

import { getIntlLocale, useI18n } from "@/lib/i18n";
import { useTheme } from "@/theme";

function formatDate(timestamp: number, locale: string): string {
  const intlLocale = getIntlLocale(locale);
  return new Date(timestamp).toLocaleDateString(intlLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: intlLocale === "en-US",
  });
}

const DeviceProfileScreen = () => {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { theme, isDark } = useTheme();

  const { t, locale } = useI18n();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    device,
    sessions,
    isLoading,
    isLoadingSessions,
    isLoadingMore,
    loadMore,
    setCustomName,
    resolveName,
    isResolvingName,
    resolveError,
  } = useDeviceProfile(id ?? null);

  const { trustedDevices, trustDevice, untrustDevice } = useAntiStalking();
  // Trusted devices store raw BLE IDs, but route param has "ble_" prefix
  const rawDeviceId = id?.replace(/^ble_/, "") ?? null;
  const isTrusted = trustedDevices.some((d) => d.deviceId === rawDeviceId);

  const handleToggleTrust = useCallback(async () => {
    if (!rawDeviceId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isTrusted) {
      await untrustDevice(rawDeviceId);
    } else {
      await trustDevice(rawDeviceId, device?.customName ?? device?.deviceName ?? null);
    }
  }, [
    rawDeviceId,
    isTrusted,
    trustDevice,
    untrustDevice,
    device?.customName,
    device?.deviceName,
  ]);

  // Use device data when available, fall back to route param, then "Unknown"
  const displayName =
    device?.customName ??
    device?.deviceName ??
    (name ? decodeURIComponent(name) : null) ??
    device?.rawBleId?.slice(-8).toUpperCase() ??
    "Unknown";

  // Edit name modal state
  const NAME_MAX_LENGTH = 30;
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");

  const trimmedName = editNameValue.trim();
  const hasMultipleSpaces = /\s{2,}/.test(editNameValue);
  const hasLeadingSpace =
    editNameValue.length > 0 && editNameValue[0] === " " && !hasMultipleSpaces;
  const isOverLimit = trimmedName.length > NAME_MAX_LENGTH;
  const hasSpaceError = hasMultipleSpaces || hasLeadingSpace;
  const isSaveDisabled =
    trimmedName.length === 0 || isOverLimit || hasSpaceError;

  const validationError = hasMultipleSpaces
    ? t("deviceProfile.editNameNoMultipleSpaces")
    : hasLeadingSpace
      ? t("deviceProfile.editNameNoLeadingSpace")
      : isOverLimit
        ? t("deviceProfile.editNameLimitReached")
        : null;

  const handleOpenEditName = useCallback(() => {
    setEditNameValue(device?.customName ?? device?.deviceName ?? "");
    setIsEditModalVisible(true);
  }, [device?.customName, device?.deviceName]);

  const handleSaveEditName = useCallback(async () => {
    const trimmed = editNameValue.trim();
    if (!trimmed || trimmed.length > NAME_MAX_LENGTH || /\s{2,}/.test(trimmed))
      return;
    await setCustomName(trimmed);
    setIsEditModalVisible(false);
  }, [editNameValue, setCustomName]);

  const handleConfirmClearName = useCallback(async () => {
    await setCustomName(null);
    setIsDeleteModalVisible(false);
  }, [setCustomName]);

  const handleClose = useCallback(() => {
    router.dismiss();
  }, [router]);

  const keyExtractor = useCallback(
    (item: DeviceSessionAppearance) => item.sessionId,
    [],
  );

  const renderSession = useCallback(
    ({ item }: { item: DeviceSessionAppearance }) => (
      <SessionAppearanceCard
        session={item}
        isDark={isDark}
        theme={theme}
        t={t}
        locale={locale}
      />
    ),
    [isDark, theme, t, locale],
  );

  const hasDeviceName = !!device?.deviceName;
  const hasCustomName = !!device?.customName;

  const renderHeader = useCallback(() => {
    if (!device) return null;

    return (
      <DeviceInfoHeader
        device={device}
        displayName={displayName}
        hasDeviceName={hasDeviceName}
        hasCustomName={hasCustomName}
        isDark={isDark}
        theme={theme}
        t={t}
        locale={locale}
        isLoadingSessions={isLoadingSessions}
        sessionsCount={sessions.length}
        onResolveName={resolveName}
        isResolvingName={isResolvingName}
        resolveError={resolveError}
        onEditName={handleOpenEditName}
        onDeleteName={() => setIsDeleteModalVisible(true)}
        isTrusted={isTrusted}
        onToggleTrust={handleToggleTrust}
      />
    );
  }, [
    device,
    displayName,
    hasDeviceName,
    hasCustomName,
    isDark,
    theme,
    t,
    locale,
    isLoadingSessions,
    sessions.length,
    resolveName,
    isResolvingName,
    resolveError,
    handleOpenEditName,
    isTrusted,
    handleToggleTrust,
  ]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  }, [isLoadingMore, theme.primary]);

  return (
    <View
      className={`flex-1 ${isDark ? "bg-background-dark" : "bg-background"}`}
    >
      {/* Header */}
      <View
        style={{ paddingTop: insets.top, zIndex: 10 }}
        className={isDark ? "bg-surface-dark" : "bg-surface"}
      >
        <View className="flex-row items-center justify-between px-4 py-4">
          <Text
            className={`text-xl font-bold flex-1 ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          <Pressable
            onPress={handleClose}
            className="p-2 -mr-2 active:opacity-70"
            hitSlop={8}
          >
            <X size={24} color={theme.textPrimary} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <PremiumGate
        feature="device_profiles"
        fallback={
          <DeviceProfilePremiumFallback
            displayName={displayName}
            deviceId={id ?? ""}
            isDark={isDark}
            theme={theme}
            t={t}
            insets={insets}
          />
        }
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : !device ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text
              className={`text-center ${isDark ? "text-text-secondary-dark" : "text-text-secondary"}`}
            >
              {t("deviceProfile.notFound")}
            </Text>
          </View>
        ) : (
          <FlashList<DeviceSessionAppearance>
            data={sessions}
            renderItem={renderSession}
            keyExtractor={keyExtractor}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: insets.bottom + 24,
            }}
            showsVerticalScrollIndicator={false}
            drawDistance={500}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            extraData={isDark}
          />
        )}
      </PremiumGate>

      {/* Edit Name Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <Pressable
            className="flex-1 justify-center items-center px-6"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onPress={() => setIsEditModalVisible(false)}
          >
            <Pressable
              className={`w-full rounded-2xl p-5 ${isDark ? "bg-surface-dark" : "bg-surface"}`}
              onPress={() => {}}
            >
              <Text
                className={`text-lg font-bold mb-4 ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
              >
                {t("deviceProfile.editName")}
              </Text>

              <TextInput
                value={editNameValue}
                onChangeText={setEditNameValue}
                placeholder={t("deviceProfile.editNamePlaceholder")}
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                maxLength={NAME_MAX_LENGTH + 5}
                autoFocus
                className={`px-4 py-3 rounded-xl text-base ${
                  isDark
                    ? "bg-background-dark text-text-primary-dark"
                    : "bg-background text-text-primary"
                }`}
                style={{
                  borderWidth: 1,
                  borderColor:
                    isOverLimit || hasSpaceError
                      ? theme.error
                      : isDark
                        ? "#374151"
                        : "#E5E7EB",
                }}
              />

              {/* Character counter + validation error (inline) */}
              <View className="flex-row justify-between items-center mt-1 mb-3">
                {validationError ? (
                  <Text
                    className="text-xs flex-1 mr-2"
                    style={{ color: theme.error }}
                    numberOfLines={1}
                  >
                    {validationError}
                  </Text>
                ) : (
                  <View className="flex-1" />
                )}
                <Text
                  className="text-xs"
                  style={{
                    color:
                      isOverLimit || hasSpaceError
                        ? theme.error
                        : isDark
                          ? "#6B7280"
                          : "#9CA3AF",
                  }}
                >
                  {trimmedName.length}/{NAME_MAX_LENGTH}
                </Text>
              </View>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setIsEditModalVisible(false)}
                  className={`flex-1 py-3 rounded-xl items-center ${
                    isDark ? "bg-background-dark" : "bg-background"
                  }`}
                  style={
                    isDark
                      ? { borderWidth: 1, borderColor: "#4B5563" }
                      : undefined
                  }
                >
                  <Text
                    className={`font-semibold text-sm ${isDark ? "text-text-primary-dark" : "text-text-secondary"}`}
                  >
                    {t("common.cancel")}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleSaveEditName}
                  disabled={isSaveDisabled}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{
                    backgroundColor: theme.primary,
                    opacity: isSaveDisabled ? 0.4 : 1,
                  }}
                >
                  <Text className="font-semibold text-sm text-white">
                    {t("deviceProfile.editNameSave")}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Name Confirmation Modal */}
      <Modal
        visible={isDeleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center px-6"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setIsDeleteModalVisible(false)}
        >
          <Pressable
            className={`w-full rounded-2xl p-5 ${isDark ? "bg-surface-dark" : "bg-surface"}`}
            onPress={() => {}}
          >
            <Text
              className={`text-lg font-bold mb-2 ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
            >
              {t("deviceProfile.deleteNameTitle")}
            </Text>
            <Text
              className={`text-sm mb-5 ${isDark ? "text-text-secondary-dark" : "text-text-secondary"}`}
            >
              {t("deviceProfile.deleteNameMessage")}
            </Text>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setIsDeleteModalVisible(false)}
                className={`flex-1 py-3 rounded-xl items-center ${
                  isDark ? "bg-background-dark" : "bg-background"
                }`}
              >
                <Text
                  className={`font-semibold text-sm ${isDark ? "text-text-secondary-dark" : "text-text-secondary"}`}
                >
                  {t("common.cancel")}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmClearName}
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: theme.error }}
              >
                <Text className="font-semibold text-sm text-white">
                  {t("deviceProfile.editNameClear")}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

// ===== Full-screen Premium Fallback =====

function DeviceProfilePremiumFallback({
  displayName,
  deviceId,
  isDark,
  theme,
  t,
  insets,
}: {
  displayName: string;
  deviceId: string;
  isDark: boolean;
  theme: {
    primary: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
  };
  t: (key: string) => string;
  insets: { bottom: number };
}) {
  const router = useRouter();
  const shortId = deviceId.replace(/^ble_/, "").slice(-8).toUpperCase();

  return (
    <View className="flex-1 items-center px-6 pt-8">
      {/* Device icon */}
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: `${theme.primary}15` }}
      >
        <Bluetooth size={32} color={theme.primary} strokeWidth={1.8} />
      </View>

      {/* Device name */}
      <Text
        className={`text-xl font-bold text-center mb-1 ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
        numberOfLines={1}
      >
        {displayName}
      </Text>

      {/* Device ID */}
      <Text
        className={`text-xs font-mono text-center mb-8 ${isDark ? "text-text-tertiary-dark" : "text-text-tertiary"}`}
      >
        {shortId}
      </Text>

      {/* Skeleton preview — simulates what the full profile looks like */}
      <View className="w-full mb-8">
        {/* Info card skeleton */}
        <View
          className={`rounded-xl p-4 mb-3 ${isDark ? "bg-surface-dark" : "bg-surface"}`}
          style={{ opacity: 0.5 }}
        >
          {[0.6, 0.75, 0.5, 0.65].map((w, i) => (
            <View
              key={i}
              className={`flex-row items-center py-3 ${
                i < 3
                  ? `border-b ${isDark ? "border-border-dark" : "border-border"}`
                  : ""
              }`}
            >
              <View
                className="w-4 h-4 rounded"
                style={{ backgroundColor: isDark ? "#374151" : "#D1D5DB" }}
              />
              <View
                className="h-3 rounded-full ml-2"
                style={{
                  width: `${w * 100}%`,
                  backgroundColor: isDark ? "#374151" : "#D1D5DB",
                }}
              />
            </View>
          ))}
        </View>

        {/* Session cards skeleton */}
        <View
          className={`rounded-xl p-4 mb-2 ${isDark ? "bg-surface-dark" : "bg-surface"}`}
          style={{ opacity: 0.35 }}
        >
          <View
            className="h-3.5 rounded-full mb-2.5"
            style={{
              width: "55%",
              backgroundColor: isDark ? "#374151" : "#D1D5DB",
            }}
          />
          <View className="flex-row gap-4">
            <View
              className="h-2.5 rounded-full"
              style={{
                width: "25%",
                backgroundColor: isDark ? "#374151" : "#D1D5DB",
              }}
            />
            <View
              className="h-2.5 rounded-full"
              style={{
                width: "20%",
                backgroundColor: isDark ? "#374151" : "#D1D5DB",
              }}
            />
          </View>
        </View>

        <View
          className={`rounded-xl p-4 ${isDark ? "bg-surface-dark" : "bg-surface"}`}
          style={{ opacity: 0.2 }}
        >
          <View
            className="h-3.5 rounded-full mb-2.5"
            style={{
              width: "45%",
              backgroundColor: isDark ? "#374151" : "#D1D5DB",
            }}
          />
          <View className="flex-row gap-4">
            <View
              className="h-2.5 rounded-full"
              style={{
                width: "30%",
                backgroundColor: isDark ? "#374151" : "#D1D5DB",
              }}
            />
            <View
              className="h-2.5 rounded-full"
              style={{
                width: "15%",
                backgroundColor: isDark ? "#374151" : "#D1D5DB",
              }}
            />
          </View>
        </View>
      </View>

      {/* CTA section */}
      <View
        className="items-center"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <View className="flex-row items-center gap-2 mb-2">
          <Lock size={18} color="#F59E0B" />
          <PremiumBadge size="md" />
        </View>

        <Text
          className="text-sm text-center mb-5 px-4"
          style={{ color: theme.textSecondary }}
        >
          {t("premium.gate.deviceProfile")}
        </Text>

        <Pressable
          className="rounded-xl px-8 py-3.5 active:opacity-80"
          style={{ backgroundColor: "#F59E0B" }}
          onPress={() => safePush(router, "/paywall")}
        >
          <Text className="text-white font-bold text-base">
            {t("premium.gate.button")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ===== Device Info Header (shown above session list) =====

const DeviceInfoHeader = memo(function DeviceInfoHeader({
  device,
  displayName,
  hasDeviceName,
  hasCustomName,
  isDark,
  theme,
  t,
  locale,
  isLoadingSessions,
  sessionsCount,
  onResolveName,
  isResolvingName,
  resolveError,
  onEditName,
  onDeleteName,
  isTrusted,
  onToggleTrust,
}: {
  device: DeviceProfile;
  displayName: string;
  hasDeviceName: boolean;
  hasCustomName: boolean;
  isDark: boolean;
  theme: {
    primary: string;
    success: string;
    error: string;
    textSecondary: string;
    border: string;
  };
  t: (key: string) => string;
  locale: string;
  isLoadingSessions: boolean;
  sessionsCount: number;
  onResolveName: () => void;
  isResolvingName: boolean;
  resolveError: string | null;
  onEditName: () => void;
  onDeleteName: () => void;
  isTrusted: boolean;
  onToggleTrust: () => void;
}) {
  return (
    <View style={{ paddingTop: 24 }}>
      {/* Device icon + name */}
      <View className="items-center mb-6">
        <View
          className="w-16 h-16 rounded-full items-center justify-center mb-3"
          style={{ backgroundColor: `${theme.primary}20` }}
        >
          {device.isTracker ? (
            <RadioTower size={28} color={theme.error} strokeWidth={2} />
          ) : (
            <Bluetooth size={28} color={theme.primary} strokeWidth={2} />
          )}
        </View>

        <View className="flex-row items-center gap-2">
          <Text
            className={`text-lg font-bold text-center ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
          >
            {displayName}
          </Text>
          <Pressable
            onPress={onEditName}
            hitSlop={8}
            className="active:opacity-50"
          >
            <Edit3 size={16} color={theme.textSecondary} strokeWidth={2} />
          </Pressable>
          {hasCustomName && (
            <Pressable
              onPress={onDeleteName}
              hitSlop={8}
              className="active:opacity-50"
            >
              <X size={16} color={theme.error} strokeWidth={2.5} />
            </Pressable>
          )}
        </View>

        {device.isTracker && device.trackerType && (
          <View
            className="mt-2 px-3 py-1 rounded-full"
            style={{ backgroundColor: `${theme.error}15` }}
          >
            <Text className="text-xs font-bold" style={{ color: theme.error }}>
              {device.trackerType.toUpperCase()}
            </Text>
          </View>
        )}

        {/* Trust/Untrust button — shown for all devices */}
        <Pressable
          onPress={onToggleTrust}
          className="flex-row items-center gap-2 mt-3 px-4 py-2 rounded-full active:opacity-70"
          style={{
            backgroundColor: isTrusted
              ? `${theme.success}15`
              : `${theme.textSecondary}10`,
          }}
        >
          {isTrusted ? (
            <ShieldCheck size={16} color={theme.success} strokeWidth={2} />
          ) : (
            <ShieldOff size={16} color={theme.textSecondary} strokeWidth={2} />
          )}
          <Text
            className="text-sm font-semibold"
            style={{
              color: isTrusted ? theme.success : theme.textSecondary,
            }}
          >
            {isTrusted
              ? t("deviceProfile.trustedDevice")
              : t("deviceProfile.trustDevice")}
          </Text>
        </Pressable>

        {/* GATT Name Resolution - show when device has no BLE advertising name */}
        {!hasDeviceName && (
          <View className="items-center mt-3">
            <Pressable
              onPress={onResolveName}
              disabled={isResolvingName}
              className="flex-row items-center gap-2 px-4 py-2 rounded-full active:opacity-70"
              style={{ backgroundColor: `${theme.primary}15` }}
            >
              {isResolvingName ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Search size={14} color={theme.primary} strokeWidth={2} />
              )}
              <Text
                className="text-sm font-semibold"
                style={{ color: theme.primary }}
              >
                {isResolvingName
                  ? t("common.loading")
                  : t("deviceProfile.resolveName")}
              </Text>
            </Pressable>

            <Text
              className={`text-xs text-center mt-2 px-6 ${isDark ? "text-text-tertiary-dark" : "text-text-tertiary"}`}
            >
              {t("deviceProfile.resolveNameHint")}
            </Text>

            {resolveError && (
              <Text
                className="text-xs text-center mt-2 px-6"
                style={{ color: theme.error }}
              >
                {resolveError === "nameNotFound"
                  ? t("deviceProfile.resolveNameNotFound")
                  : resolveError === "connectionTimeout"
                    ? t("deviceProfile.resolveNameTimeout")
                    : resolveError === "gattFailed"
                      ? t("deviceProfile.resolveNameGattFailed")
                      : t("deviceProfile.resolveNameError")}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Info cards */}
      <View
        className={`rounded-xl p-4 mb-4 ${isDark ? "bg-surface-dark" : "bg-surface"}`}
      >
        <InfoRow
          icon={<Bluetooth size={16} color={theme.primary} strokeWidth={2} />}
          label={t("deviceProfile.bleId")}
          value={device.rawBleId}
          isDark={isDark}
        />
        <InfoRow
          icon={
            <Calendar size={16} color={theme.textSecondary} strokeWidth={2} />
          }
          label={t("deviceProfile.firstSeen")}
          value={formatDate(device.firstSeenEver, locale)}
          isDark={isDark}
        />
        <InfoRow
          icon={<Clock size={16} color={theme.textSecondary} strokeWidth={2} />}
          label={t("deviceProfile.lastSeen")}
          value={formatDate(device.lastSeenEver, locale)}
          isDark={isDark}
        />
        <InfoRow
          icon={<Edit3 size={16} color={theme.textSecondary} strokeWidth={2} />}
          label={t("deviceProfile.appearances")}
          value={`${device.appearanceCount}x`}
          isDark={isDark}
          isLast
        />
      </View>

      {/* Session History title */}
      <Text
        className={`text-base font-bold mb-3 ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
      >
        {t("deviceProfile.sessionHistory")}
      </Text>

      {isLoadingSessions ? (
        <View
          className={`rounded-xl p-6 items-center ${isDark ? "bg-surface-dark" : "bg-surface"}`}
        >
          <ActivityIndicator size="small" color={theme.primary} />
        </View>
      ) : sessionsCount === 0 ? (
        <View
          className={`rounded-xl p-4 items-center ${isDark ? "bg-surface-dark" : "bg-surface"}`}
        >
          <Text
            className={`text-sm text-center ${isDark ? "text-text-secondary-dark" : "text-text-secondary"}`}
          >
            {t("deviceProfile.noSessions")}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

// ===== Session Appearance Card =====

const SessionAppearanceCard = memo(function SessionAppearanceCard({
  session,
  isDark,
  theme,
  t,
  locale,
}: {
  session: DeviceSessionAppearance;
  isDark: boolean;
  theme: { primary: string; textSecondary: string };
  t: (key: string) => string;
  locale: string;
}) {
  const durationSec = Math.floor(session.durationMs / 1000);
  const minutes = Math.floor(durationSec / 60);

  const seconds = durationSec % 60;
  const durationLabel =
    minutes > 0
      ? `${minutes}${t("history.duration.minutes")} ${seconds}${t("history.duration.seconds")}`
      : `${seconds}${t("history.duration.seconds")}`;

  return (
    <View
      className={`rounded-xl p-4 mb-3 ${isDark ? "bg-surface-dark" : "bg-surface"}`}
    >
      <Text
        className={`font-semibold mb-2 ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
      >
        {formatDate(session.startedAt, locale)}
      </Text>

      <View className="flex-row items-center gap-4">
        <View className="flex-row items-center gap-1">
          <Clock size={12} color={theme.textSecondary} strokeWidth={2} />
          <Text
            className={`text-xs ${isDark ? "text-text-tertiary-dark" : "text-text-tertiary"}`}
          >
            {durationLabel}
          </Text>
        </View>

        <View className="flex-row items-center gap-1">
          <Bluetooth size={12} color={theme.primary} strokeWidth={2} />
          <Text
            className={`text-xs ${isDark ? "text-text-tertiary-dark" : "text-text-tertiary"}`}
          >
            {session.deviceCount}{" "}
            {session.deviceCount === 1
              ? t("history.device")
              : t("history.devices")}
          </Text>
        </View>

        {session.rssiAvg != null && (
          <View className="flex-row items-center gap-1">
            <Activity size={12} color={theme.primary} strokeWidth={2} />
            <Text
              className={`text-xs ${isDark ? "text-text-tertiary-dark" : "text-text-tertiary"}`}
            >
              {t("deviceProfile.signal")} {Math.round(session.rssiAvg)} dBm
            </Text>
          </View>
        )}
      </View>
    </View>
  );
});

// ===== Info Row =====

function InfoRow({
  icon,
  label,
  value,
  isDark,
  isLast = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isDark: boolean;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center py-3 ${
        !isLast
          ? `border-b ${isDark ? "border-border-dark" : "border-border"}`
          : ""
      }`}
    >
      {icon}
      <Text
        className={`text-sm ml-2 flex-1 ${isDark ? "text-text-secondary-dark" : "text-text-secondary"}`}
      >
        {label}
      </Text>
      <Text
        className={`text-sm font-medium ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

export default DeviceProfileScreen;
