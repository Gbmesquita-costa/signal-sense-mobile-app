import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useRouter } from "expo-router";
import { X } from "lucide-react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/theme";

import { FilterChips, SessionList } from "@/components/history";
import { useHistory } from "@/hooks/useHistory";

const HistoryScreen = () => {
  const { theme, isDark } = useTheme();
  const { t, locale } = useI18n();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    sessions,
    sessionCount,
    isLoading,
    isRefreshing,
    isLoadingMore,
    freeLimit,
    isLimited,
    filterType,
    setFilterType,
    deleteSession,
    loadMore,
    refresh,
  } = useHistory();

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
            {t("history.title")}
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

      {/* Filter chips */}
      <FilterChips
        activeFilter={filterType}
        onFilterChange={setFilterType}
        isDark={isDark}
        theme={theme}
        t={t}
      />

      {/* Session count */}
      {sessionCount > 0 && (
        <View className="px-4 pb-2">
          <Text
            className={`text-xs ${isDark ? "text-text-tertiary-dark" : "text-text-tertiary"}`}
          >
            {sessionCount}{" "}
            {sessionCount === 1 ? t("history.session") : t("history.sessions")}
            {isLimited && ` • ${t("history.showingLast")} ${freeLimit}`}
          </Text>
        </View>
      )}

      {/* Session list */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <SessionList
          sessions={sessions}
          isDark={isDark}
          locale={locale}
          theme={theme}
          t={t}
          onDeleteSession={deleteSession}
          onLoadMore={loadMore}
          onRefresh={refresh}
          isLoadingMore={isLoadingMore}
          isRefreshing={isRefreshing}
          bottomPadding={isLimited ? 16 : insets.bottom + 24}
        />
      )}

      {/* Premium upsell for limited users */}
      {isLimited && (
        <View
          className="px-4 pb-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View
            className={`rounded-xl p-3 ${isDark ? "bg-surface-dark" : "bg-surface"}`}
          >
            <Text
              className={`text-xs text-center ${isDark ? "text-text-tertiary-dark" : "text-text-tertiary"}`}
            >
              {t("history.premiumHint")}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default HistoryScreen;
