/**
 * DeviceList
 * High-performance list of devices detected using FlashList
 *
 * - Progressive pagination: Loads 10 items at a time
 * - Memoized callbacks
 * - drawDistance: Pre-renders off-screen items
 */

import { FlashList } from "@shopify/flash-list";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ActivityIndicator, Text, View } from "react-native";

import type { ScannedDevice } from "@/services/scan";

import { useIsPremium } from "@/stores/usePremiumStore";
import { DeviceCard } from "./DeviceCard";

// Number of items loaded at a time
const PAGE_SIZE = 10;

interface DeviceListProps {
  devices: ScannedDevice[];
  isDark: boolean;
  theme: {
    primary: string;
    success: string;
    warning: string;
    error: string;
  };
  t: (key: string) => string;
  customNames: Map<string, string>;
  onSelectDevice: (device: ScannedDevice) => void;
  onLongPressDevice?: (device: ScannedDevice) => void;
  bottomPadding?: number;
  isLoading?: boolean;
}

const DeviceList = memo(function DeviceList({
  devices,
  isDark,
  theme,
  t,
  customNames,
  onSelectDevice,
  onLongPressDevice,
  bottomPadding = 100,
  isLoading = false,
}: DeviceListProps) {
  const isPremium = useIsPremium();
  // Pagination state
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset pagination when device list changes significantly (e.g. filters applied)
  const prevLengthRef = useRef(devices.length);
  useEffect(() => {
    if (devices.length < prevLengthRef.current) {
      setVisibleCount(PAGE_SIZE);
    }
    prevLengthRef.current = devices.length;
  }, [devices.length]);

  // ⚡ OPTIMIZATION: Paginated data - shows only visible items
  const paginatedDevices = useMemo(() => {
    return devices.slice(0, visibleCount);
  }, [devices, visibleCount]);

  // Check if you have more items to load.
  const hasMore = visibleCount < devices.length;

  // ⚡ OPTIMIZATION: Memoized KeyExtractor
  const keyExtractor = useCallback((item: ScannedDevice) => item.id, []);

  // ⚡ OPTIMIZATION: Rendering from a memoized device
  const renderDevice = useCallback(
    ({ item }: { item: ScannedDevice }) => (
      <DeviceCard
        device={item}
        isDark={isDark}
        isPremium={isPremium}
        customName={customNames.get(item.id)}
        theme={theme}
        t={t}
        onPress={() => onSelectDevice(item)}
        onLongPress={() => onLongPressDevice?.(item)}
      />
    ),
    [
      isDark,
      isPremium,
      customNames,
      theme,
      t,
      onSelectDevice,
      onLongPressDevice,
    ],
  );

  // Separator between items
  const ItemSeparator = useCallback(() => <View style={{ height: 12 }} />, []);

  // ⚡ OPTIMIZATION: Loads more items when you reach the end
  const loadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, devices.length));
    }
  }, [hasMore, devices.length]);

  // Footer showing loading or "load more"
  const ListFooter = useCallback(() => {
    if (!hasMore && !isLoading) return null;

    return (
      <View className="items-center py-4">
        {isLoading || hasMore ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" color={theme.primary} />
            <Text
              className={`text-sm ${
                isDark ? "text-text-secondary-dark" : "text-text-secondary"
              }`}
            >
              {hasMore
                ? `${t("scan.states.loadingMore")} (${paginatedDevices.length}/${devices.length})`
                : t("scan.states.searchingDevices")}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }, [
    hasMore,
    isLoading,
    isDark,
    theme.primary,
    paginatedDevices.length,
    devices.length,
    t,
  ]);

  return (
    <FlashList<ScannedDevice>
      data={paginatedDevices}
      renderItem={renderDevice}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={ItemSeparator}
      ListFooterComponent={ListFooter}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: bottomPadding,
      }}
      showsVerticalScrollIndicator={false}
      drawDistance={500}
      getItemType={(item) =>
        item.trackerInfo?.isTracker ? "tracker" : "device"
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      extraData={isDark}
    />
  );
});

export { DeviceList };
