/**
 * DeviceFilters
 * Inline filter bar for device list (search + chips + sort)
 * Premium-gated feature
 */

import React, { memo, useCallback } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import {
  ArrowUpDown,
  Search,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Tag,
  X,
} from "lucide-react-native";

import type {
  DeviceFilters as DeviceFiltersType,
  SortBy,
} from "@/hooks/useDeviceFilters";
import type { SignalStrength } from "@/services/scan";

interface DeviceFiltersProps {
  filters: DeviceFiltersType;
  updateFilter: <K extends keyof DeviceFiltersType>(
    key: K,
    value: DeviceFiltersType[K],
  ) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  filteredCount: number;
  totalCount: number;
  isDark: boolean;
  theme: {
    primary: string;
    success: string;
    warning: string;
    error: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    surface: string;
  };
  t: (key: string) => string;
}

const SORT_CYCLE: SortBy[] = ["rssi", "name", "lastSeen"];

const DeviceFilters = memo(function DeviceFilters({
  filters,
  updateFilter,
  resetFilters,
  hasActiveFilters,
  filteredCount,
  totalCount,
  isDark,
  theme,
  t,
}: DeviceFiltersProps) {
  const handleSignalToggle = useCallback(
    (strength: SignalStrength) => {
      updateFilter(
        "signalStrength",
        filters.signalStrength === strength ? null : strength,
      );
    },
    [filters.signalStrength, updateFilter],
  );

  const handleSortCycle = useCallback(() => {
    const currentIndex = SORT_CYCLE.indexOf(filters.sortBy);
    const nextIndex = (currentIndex + 1) % SORT_CYCLE.length;

    updateFilter("sortBy", SORT_CYCLE[nextIndex]);
  }, [filters.sortBy, updateFilter]);

  const sortLabel =
    filters.sortBy === "rssi"
      ? t("filters.sortRssi")
      : filters.sortBy === "name"
        ? t("filters.sortName")
        : t("filters.sortLastSeen");

  return (
    <View className="px-6 pb-3 gap-3">
      {/* Search bar */}
      <View
        className="flex-row items-center rounded-xl px-3 h-10"
        style={{
          backgroundColor: isDark ? "#1A1F27" : "#F3F4F6",
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        <Search size={16} color={theme.textTertiary} />
        <TextInput
          className="flex-1 ml-2 text-sm"
          style={{ color: theme.textPrimary, padding: 0 }}
          placeholder={t("filters.search")}
          placeholderTextColor={theme.textTertiary}
          value={filters.search}
          onChangeText={(text) => updateFilter("search", text)}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {filters.search.length > 0 && (
          <Pressable onPress={() => updateFilter("search", "")}>
            <X size={16} color={theme.textTertiary} />
          </Pressable>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {/* Signal strength chips */}
        <FilterChip
          label={t("scan.signalStrength.strong")}
          icon={<SignalHigh size={14} />}
          active={filters.signalStrength === "strong"}
          activeColor={theme.success}
          isDark={isDark}
          theme={theme}
          onPress={() => handleSignalToggle("strong")}
        />
        <FilterChip
          label={t("scan.signalStrength.medium")}
          icon={<SignalMedium size={14} />}
          active={filters.signalStrength === "medium"}
          activeColor={theme.warning}
          isDark={isDark}
          theme={theme}
          onPress={() => handleSignalToggle("medium")}
        />
        <FilterChip
          label={t("scan.signalStrength.weak")}
          icon={<SignalLow size={14} />}
          active={filters.signalStrength === "weak"}
          activeColor={theme.error}
          isDark={isDark}
          theme={theme}
          onPress={() => handleSignalToggle("weak")}
        />

        {/* Separator */}
        <View
          style={{
            width: 1,
            backgroundColor: theme.border,
            marginVertical: 4,
          }}
        />

        {/* Toggle chips */}
        <FilterChip
          label={t("filters.trackersOnly")}
          icon={<Signal size={14} />}
          active={filters.trackersOnly}
          activeColor={theme.primary}
          isDark={isDark}
          theme={theme}
          onPress={() => updateFilter("trackersOnly", !filters.trackersOnly)}
        />
        <FilterChip
          label={t("filters.namedOnly")}
          icon={<Tag size={14} />}
          active={filters.namedOnly}
          activeColor={theme.primary}
          isDark={isDark}
          theme={theme}
          onPress={() => updateFilter("namedOnly", !filters.namedOnly)}
        />
      </ScrollView>

      {/* Sort + Clear + Count row */}
      <View className="flex-row items-center justify-between">
        <Pressable
          className="flex-row items-center gap-1.5"
          onPress={handleSortCycle}
        >
          <ArrowUpDown size={14} color={theme.textSecondary} />
          <Text className="text-xs" style={{ color: theme.textSecondary }}>
            {t("filters.sortBy")}: {sortLabel}
          </Text>
        </Pressable>

        <View className="flex-row items-center gap-3">
          {hasActiveFilters && (
            <>
              <Text className="text-xs" style={{ color: theme.textTertiary }}>
                {filteredCount}/{totalCount}
              </Text>
              <Pressable
                className="flex-row items-center gap-1"
                onPress={resetFilters}
              >
                <X size={12} color={theme.primary} />
                <Text
                  className="text-xs font-medium"
                  style={{ color: theme.primary }}
                >
                  {t("filters.clear")}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </View>
  );
});

// ==================== FilterChip ====================

interface FilterChipProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  activeColor: string;
  isDark: boolean;
  theme: {
    border: string;
    textSecondary: string;
    surface: string;
  };
  onPress: () => void;
}

const FilterChip = memo(function FilterChip({
  label,
  icon,
  active,
  activeColor,
  isDark,
  theme,
  onPress,
}: FilterChipProps) {
  return (
    <Pressable
      className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg"
      style={{
        backgroundColor: active
          ? `${activeColor}15`
          : isDark
            ? "#1A1F27"
            : theme.surface,
        borderWidth: 1,
        borderColor: active ? activeColor : theme.border,
      }}
      onPress={onPress}
    >
      {React.cloneElement(icon as React.ReactElement<{ color: string }>, {
        color: active ? activeColor : theme.textSecondary,
      })}
      <Text
        className="text-xs font-medium"
        style={{ color: active ? activeColor : theme.textSecondary }}
      >
        {label}
      </Text>
    </Pressable>
  );
});

export { DeviceFilters };
