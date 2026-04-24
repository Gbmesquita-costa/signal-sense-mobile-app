import { memo } from "react";

import { Bluetooth, Compass, Layers, Radio, Wifi } from "lucide-react-native";
import { Pressable, ScrollView, Text } from "react-native";

import type { SessionType } from "@/services/history/history.types";

interface FilterChipsProps {
  activeFilter: SessionType | null;
  onFilterChange: (type: SessionType | null) => void;
  isDark: boolean;
  theme: { primary: string };
  t: (key: string) => string;
}

const TYPE_COLORS: Record<string, string> = {
  all: "#3B82F6",
  scan: "#3B82F6",
  proximity: "#8B5CF6",
  environment: "#10B981",
  wifi: "#0EA5E9",
};

const FILTERS: {
  type: SessionType | null;
  labelKey: string;
  colorKey: string;
}[] = [
  { type: null, labelKey: "history.filterAll", colorKey: "all" },
  { type: "scan", labelKey: "history.filterScan", colorKey: "scan" },
  {
    type: "proximity",
    labelKey: "history.filterProximity",
    colorKey: "proximity",
  },
  {
    type: "environment",
    labelKey: "history.filterEnvironment",
    colorKey: "environment",
  },
  {
    type: "wifi",
    labelKey: "history.filterWifi",
    colorKey: "wifi",
  },
];

function getIcon(colorKey: string, color: string, size: number) {
  switch (colorKey) {
    case "all":
      return <Layers size={size} color={color} strokeWidth={2} />;
    case "scan":
      return <Bluetooth size={size} color={color} strokeWidth={2} />;
    case "proximity":
      return <Radio size={size} color={color} strokeWidth={2} />;
    case "environment":
      return <Compass size={size} color={color} strokeWidth={2} />;
    case "wifi":
      return <Wifi size={size} color={color} strokeWidth={2} />;
    default:
      return null;
  }
}

const FilterChips = memo(function FilterChips({
  activeFilter,
  onFilterChange,
  isDark,
  t,
}: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        gap: 8,
        alignItems: "center",
      }}
      style={{ flexGrow: 0 }}
      className="py-3"
    >
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter.type;
        const color = TYPE_COLORS[filter.colorKey];

        return (
          <Pressable
            key={filter.labelKey}
            onPress={() => onFilterChange(filter.type)}
            className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl active:opacity-70"
            style={{
              backgroundColor: isActive
                ? `${color}18`
                : isDark
                  ? "#1F2937"
                  : "#F3F4F6",
              borderWidth: 1,
              borderColor: isActive
                ? `${color}40`
                : isDark
                  ? "#374151"
                  : "#E5E7EB",
            }}
          >
            {getIcon(
              filter.colorKey,
              isActive ? color : isDark ? "#6B7280" : "#9CA3AF",
              14,
            )}
            <Text
              className="text-xs font-semibold"
              style={{
                color: isActive ? color : isDark ? "#9CA3AF" : "#6B7280",
              }}
            >
              {t(filter.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
});

export { FilterChips };
