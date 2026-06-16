/**
 * SignalBars
 *
 * Visual component to indicate signal strength
 */

import { memo } from "react";
import { View } from "react-native";

interface SignalBarsProps {
  strength: "weak" | "medium" | "strong";
  color: string;
}

const SignalBars = memo(function SignalBars({
  strength,
  color,
}: SignalBarsProps) {
  const bars = strength === "strong" ? 3 : strength === "medium" ? 2 : 1;

  return (
    <View className="flex-row items-end gap-0.5">
      {[1, 2, 3].map((bar) => (
        <View
          key={bar}
          style={{
            width: 4,
            height: 4 + bar * 3,
            backgroundColor: bar <= bars ? color : `${color}30`,
            borderRadius: 1,
          }}
        />
      ))}
    </View>
  );
});

export { SignalBars };
