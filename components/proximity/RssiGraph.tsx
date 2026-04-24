import { memo, useCallback, useMemo, useState } from "react";
import { Text, View, type LayoutChangeEvent } from "react-native";

import type { RssiSample } from "@/hooks/useRssiGraph";
import { LineChart } from "react-native-gifted-charts";

interface RssiGraphProps {
  samples: RssiSample[];
  isDark: boolean;
  theme: {
    primary: string;
    success: string;
    warning: string;
    error: string;
    textSecondary: string;
    surface: string;
  };
  t: (key: string) => string;
}

function getColorForRssi(
  rssi: number,
  theme: { success: string; warning: string; error: string },
) {
  if (rssi >= -50) return theme.success;
  if (rssi >= -70) return theme.warning;

  return theme.error;
}

const CHART_PADDING = 32; // p-4 = 16px each side
const RssiGraph = memo(function RssiGraph({
  samples,
  isDark,
  theme,
  t,
}: RssiGraphProps) {
  const [chartWidth, setChartWidth] = useState(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width - CHART_PADDING;
    if (w > 0) setChartWidth(w);
  }, []);

  const chartData = useMemo(() => {
    return samples.map((s) => ({
      value: Math.abs(s.value),
    }));
  }, [samples]);

  const { currentRssi, minRssi, maxRssi } = useMemo(() => {
    if (samples.length === 0) return { currentRssi: 0, minRssi: 0, maxRssi: 0 };

    const values = samples.map((s) => s.value);
    return {
      currentRssi: values[values.length - 1],
      minRssi: Math.min(...values),
      maxRssi: Math.max(...values),
    };
  }, [samples]);

  const lineColor = getColorForRssi(currentRssi, theme);

  if (samples.length < 2) {
    return (
      <View
        onLayout={onLayout}
        className={`rounded-xl p-4 items-center justify-center ${isDark ? "bg-surface-dark" : "bg-surface"}`}
        style={{ height: 200 }}
      >
        <Text
          className={`text-sm ${isDark ? "text-text-secondary-dark" : "text-text-secondary"}`}
        >
          {t("rssiGraph.waiting")}
        </Text>
      </View>
    );
  }

  const tertiaryColor = isDark
    ? "text-text-tertiary-dark"
    : "text-text-tertiary";

  return (
    <View
      onLayout={onLayout}
      className={`rounded-xl p-4 ${isDark ? "bg-surface-dark" : "bg-surface"}`}
    >
      {chartWidth > 0 && (
        <LineChart
          data={chartData}
          width={chartWidth}
          height={150}
          spacing={chartWidth / Math.max(samples.length - 1, 1)}
          color={lineColor}
          thickness={2}
          hideDataPoints
          curved
          adjustToWidth
          hideYAxisText
          yAxisLabelWidth={0}
          hideAxesAndRules
          xAxisLabelsHeight={0}
          isAnimated={false}
          initialSpacing={0}
          endSpacing={0}
          areaChart
          startFillColor={`${lineColor}30`}
          endFillColor={`${lineColor}05`}
          startOpacity={0.3}
          endOpacity={0.05}
        />
      )}

      <View className="flex-row justify-between items-center mt-2">
        <Text className={`text-[10px] ${tertiaryColor}`}>
          {t("rssiGraph.min")}: {minRssi}
        </Text>
        <Text className="text-[10px] font-bold" style={{ color: lineColor }}>
          {currentRssi} dBm
        </Text>
        <Text className={`text-[10px] ${tertiaryColor}`}>
          {t("rssiGraph.max")}: {maxRssi}
        </Text>
      </View>
    </View>
  );
});

export { RssiGraph };
