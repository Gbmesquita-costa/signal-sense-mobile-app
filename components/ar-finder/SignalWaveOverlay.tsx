/**
 * Animated overlay drawn on top of the camera preview.
 *
 *  - A trail of dots flows from the bottom of the screen towards the
 *    estimated position of the source.
 *  - Rings pulse outwards around that position.
 *  - When the source is outside the field of view, an arrow on the left or
 *    right edge says which way to turn instead.
 *
 * Everything reads shared values, so the motion callback can move the
 * target 30 times a second without re-rendering this component.
 */

import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

import { ChevronLeft, ChevronRight } from "lucide-react-native";
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_COUNT = 3;
const TRAIL_DOTS = 6;
const MAX_RING_RADIUS = 90;

interface SignalWaveOverlayProps {
  width: number;
  height: number;
  color: string;
  targetX: SharedValue<number>;
  targetY: SharedValue<number>;
  targetVisible: SharedValue<number>;
  turnHint: SharedValue<number>;
}

const SignalWaveOverlay = ({
  width,
  height,
  color,
  targetX,
  targetY,
  targetVisible,
  turnHint,
}: SignalWaveOverlayProps) => {
  // 0 -> 1 loop that drives both the rings and the trail.
  const phase = useSharedValue(0);

  useEffect(() => {
    phase.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.linear }),
      -1,
      false,
    );
  }, [phase]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        {Array.from({ length: TRAIL_DOTS }, (_, i) => (
          <TrailDot
            key={`dot-${i}`}
            index={i}
            width={width}
            height={height}
            color={color}
            phase={phase}
            targetX={targetX}
            targetY={targetY}
            targetVisible={targetVisible}
          />
        ))}
        {Array.from({ length: RING_COUNT }, (_, i) => (
          <Ring
            key={`ring-${i}`}
            index={i}
            color={color}
            phase={phase}
            targetX={targetX}
            targetY={targetY}
            targetVisible={targetVisible}
          />
        ))}
      </Svg>

      <EdgeArrow side="left" color={color} turnHint={turnHint} />
      <EdgeArrow side="right" color={color} turnHint={turnHint} />
    </View>
  );
};

interface MarkerProps {
  index: number;
  color: string;
  phase: SharedValue<number>;
  targetX: SharedValue<number>;
  targetY: SharedValue<number>;
  targetVisible: SharedValue<number>;
}

function Ring({
  index,
  color,
  phase,
  targetX,
  targetY,
  targetVisible,
}: MarkerProps) {
  const animatedProps = useAnimatedProps(() => {
    const t = (phase.value + index / RING_COUNT) % 1;
    return {
      cx: targetX.value,
      cy: targetY.value,
      r: 12 + t * MAX_RING_RADIUS,
      strokeOpacity: (1 - t) * 0.9 * targetVisible.value,
    };
  });

  return (
    <AnimatedCircle
      animatedProps={animatedProps}
      stroke={color}
      strokeWidth={3}
      fill="none"
    />
  );
}

function TrailDot({
  index,
  width,
  height,
  color,
  phase,
  targetX,
  targetY,
  targetVisible,
}: MarkerProps & { width: number; height: number }) {
  const animatedProps = useAnimatedProps(() => {
    // Dots start at the bottom centre (the user) and flow to the target.
    const t = (phase.value + index / TRAIL_DOTS) % 1;
    const startX = width / 2;
    const startY = height * 0.88;
    return {
      cx: startX + (targetX.value - startX) * t,
      cy: startY + (targetY.value - startY) * t,
      r: 4 + 4 * t,
      fillOpacity: Math.sin(t * Math.PI) * 0.85 * targetVisible.value,
    };
  });

  return <AnimatedCircle animatedProps={animatedProps} fill={color} />;
}

function EdgeArrow({
  side,
  color,
  turnHint,
}: {
  side: "left" | "right";
  color: string;
  turnHint: SharedValue<number>;
}) {
  const wanted = side === "left" ? -1 : 1;

  const style = useAnimatedStyle(() => ({
    opacity: withTiming(turnHint.value === wanted ? 1 : 0, { duration: 200 }),
  }));

  const Icon = side === "left" ? ChevronLeft : ChevronRight;

  return (
    <Animated.View
      style={[
        styles.edge,
        side === "left" ? styles.edgeLeft : styles.edgeRight,
        { backgroundColor: `${color}33`, borderColor: color },
        style,
      ]}
    >
      <Icon size={36} color={color} strokeWidth={3} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  edge: {
    position: "absolute",
    top: "45%",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  edgeLeft: { left: 12 },
  edgeRight: { right: 12 },
});

export { SignalWaveOverlay };
