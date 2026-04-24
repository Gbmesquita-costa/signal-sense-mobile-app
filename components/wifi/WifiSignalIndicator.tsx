import React from "react";
import { View } from "react-native";

interface WifiSignalIndicatorProps {
  strength: number | null; // 0-100
  color: string;
  size?: "sm" | "md" | "lg";
}

const BAR_CONFIGS = {
  sm: { count: 4, width: 3, gap: 2, heights: [4, 7, 10, 13] },
  md: { count: 4, width: 4, gap: 2, heights: [6, 10, 14, 18] },
  lg: { count: 4, width: 5, gap: 3, heights: [8, 14, 20, 26] },
};

const WifiSignalIndicator = ({
  strength,
  color,
  size = "md",
}: WifiSignalIndicatorProps) => {
  const config = BAR_CONFIGS[size];
  const activeBars =
    strength === null
      ? 0
      : strength >= 75
        ? 4
        : strength >= 50
          ? 3
          : strength >= 25
            ? 2
            : strength > 0
              ? 1
              : 0;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        gap: config.gap,
      }}
    >
      {config.heights.map((height, i) => (
        <View
          key={i}
          style={{
            width: config.width,
            height,
            borderRadius: config.width / 2,
            backgroundColor: i < activeBars ? color : `${color}30`,
          }}
        />
      ))}
    </View>
  );
};

export { WifiSignalIndicator };
