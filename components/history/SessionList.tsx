import { FlashList } from "@shopify/flash-list";
import { memo, useCallback } from "react";

import type { SessionType, UnifiedSession } from "@/services/history/history.types";
import { ActivityIndicator, RefreshControl, Text, View } from "react-native";

import { SessionCard } from "./SessionCard";

interface SessionListProps {
  sessions: UnifiedSession[];
  isDark: boolean;
  locale: string;
  theme: {
    primary: string;
    error: string;
    textSecondary: string;
  };
  t: (key: string) => string;
  onPressSession?: (session: UnifiedSession) => void;
  onDeleteSession?: (id: string, type: SessionType) => void;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  isLoadingMore?: boolean;
  isRefreshing?: boolean;
  bottomPadding?: number;
}

const SessionList = memo(function SessionList({
  sessions,
  isDark,
  locale,
  theme,
  t,
  onPressSession,
  onDeleteSession,
  onLoadMore,
  onRefresh,
  isLoadingMore = false,
  isRefreshing = false,
  bottomPadding = 24,
}: SessionListProps) {
  const keyExtractor = useCallback((item: UnifiedSession) => item.id, []);
  const renderItem = useCallback(
    ({ item }: { item: UnifiedSession }) => (
      <SessionCard
        session={item}
        isDark={isDark}
        locale={locale}
        theme={theme}
        t={t}
        onPress={() => onPressSession?.(item)}
        onDelete={() => onDeleteSession?.(item.id, item.type)}
      />
    ),
    [isDark, locale, theme, t, onPressSession, onDeleteSession],
  );

  const ListFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={theme.textSecondary} />
      </View>
    );
  }, [isLoadingMore, theme.textSecondary]);

  if (sessions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text
          className={`text-center ${isDark ? "text-text-secondary-dark" : "text-text-secondary"}`}
        >
          {t("history.empty")}
        </Text>
      </View>
    );
  }

  return (
    <FlashList<UnifiedSession>
      data={sessions}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListFooterComponent={ListFooter}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: bottomPadding,
      }}
      showsVerticalScrollIndicator={false}
      drawDistance={500}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      extraData={isDark}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        ) : undefined
      }
    />
  );
});

export { SessionList };
