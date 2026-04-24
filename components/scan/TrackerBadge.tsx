import { memo } from "react";

import { RadioTower } from "lucide-react-native";
import { Text, View } from "react-native";

interface TrackerBadgeProps {
  type: string | null;
  brand: string | null;
  confidence: "high" | "medium";
  isDark: boolean;
}

const TrackerBadge = memo(function TrackerBadge({
  type,
  brand,
  confidence,
  isDark,
}: TrackerBadgeProps) {
  const label = brand ?? "Tracker";

  const bgColor =
    confidence === "high"
      ? isDark
        ? "rgba(239, 68, 68, 0.15)"
        : "rgba(220, 38, 38, 0.1)"
      : isDark
        ? "rgba(250, 204, 21, 0.15)"
        : "rgba(202, 138, 4, 0.1)";

  const textColor =
    confidence === "high"
      ? isDark
        ? "#EF4444"
        : "#DC2626"
      : isDark
        ? "#FACC15"
        : "#CA8A04";

  return (
    <View
      className="flex-row items-center px-2 py-0.5 rounded-full"
      style={{ backgroundColor: bgColor }}
    >
      <RadioTower size={10} color={textColor} strokeWidth={2.5} />
      <Text className="text-[10px] font-bold ml-1" style={{ color: textColor }}>
        {label}
      </Text>
    </View>
  );
});

export { TrackerBadge };
