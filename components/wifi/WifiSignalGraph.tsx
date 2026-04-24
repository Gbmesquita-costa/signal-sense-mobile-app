/**
 * WifiSignalGraph
 * Line chart showing Wi-Fi signal strength over time.
 * Adapted from RssiGraph — uses strength (0-100) values.
 */

import { memo, useCallback, useMemo, useState } from "react";
import { Text, View, type LayoutChangeEvent } from "react-native";

import { LineChart } from "react-native-gifted-charts";

interface SignalSample {
  value: number; // 0-100 strength
  timestamp: number;
}

interface WifiSignalGraphProps {
  samples: SignalSample[];
  isDark: boolean;
  theme: {
    success: string;
    warning: string;
    error: string;
    textSecondary: string;
    surface: string;
  };
  t: (key: string) => string;
}

function getColorForStrength(
  strength: number,
  theme: { success: string; warning: string; error: string },
) {
  if (strength >= 60) return theme.success;
  if (strength >= 40) return theme.warning;
  return theme.error;
}

const CHART_PADDING = 32;

const WifiSignalGraph = memo(function WifiSignalGraph({
  samples,
  isDark,
  theme,
  t,
}: WifiSignalGraphProps) {
  const [chartWidth, setChartWidth] = useState(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width - CHART_PADDING;
    if (w > 0) setChartWidth(w);
  }, []);

  const chartData = useMemo(() => {
    return samples.map((s) => ({
      value: s.value,
    }));
  }, [samples]);

  const { current, min, max } = useMemo(() => {
    if (samples.length === 0) return { current: 0, min: 0, max: 0 };

    const values = samples.map((s) => s.value);
    return {
      current: values[values.length - 1],
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [samples]);

  const lineColor = getColorForStrength(current, theme);

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
          {t("wifi.tracker.graphWaiting")}
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
      <Text
        className={`text-sm font-semibold mb-3 ${
          isDark ? "text-text-primary-dark" : "text-text-primary"
        }`}
      >
        {t("wifi.tracker.graphTitle")}
      </Text>

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
          maxValue={100}
          areaChart
          startFillColor={`${lineColor}30`}
          endFillColor={`${lineColor}05`}
          startOpacity={0.3}
          endOpacity={0.05}
        />
      )}

      <View className="flex-row justify-between items-center mt-2">
        <Text className={`text-[10px] ${tertiaryColor}`}>
          {t("wifi.tracker.min")}: {min}%
        </Text>
        <Text className="text-[10px] font-bold" style={{ color: lineColor }}>
          {current}%
        </Text>
        <Text className={`text-[10px] ${tertiaryColor}`}>
          {t("wifi.tracker.max")}: {max}%
        </Text>
      </View>
    </View>
  );
});

export { WifiSignalGraph };
export type { SignalSample };
