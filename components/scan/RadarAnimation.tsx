import { useEffect, useRef } from "react";
import { Pressable, View } from "react-native";

import { useTheme } from "@/theme";
import * as Haptics from "expo-haptics";

import { Radar } from "lucide-react-native";
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface RadarAnimationProps {
  isScanning: boolean;
  /** Size of the center button (clickable area and layout space) */
  size?: number;
  /** Wavelength multiplier relative to the button (default: 2.5) */
  waveScale?: number;
  onPress?: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const RadarAnimation = ({
  isScanning,
  size = 200,
  waveScale = 2.5,
  onPress,
  disabled = false,
}: RadarAnimationProps) => {
  const { theme, isDark } = useTheme();

  // Wave size (does not affect the layout, only the visual aspect)
  const waveSize = size * waveScale;

  // Central icon rotation animation
  const rotation = useSharedValue(0);

  // Wave animations (2 waves with different delays)
  const wave1 = useSharedValue(0);
  const wave2 = useSharedValue(0);

  // Central icon pulse when idle
  const pulse = useSharedValue(1);

  // Touch scale for feedback
  const touchScale = useSharedValue(1);

  // Reference to check if animations have already started
  const animationsStartedRef = useRef(false);

  const handlePressIn = () => {
    touchScale.value = withSpring(0.92, { damping: 15 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    touchScale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(
      isScanning
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Heavy,
    );

    onPress?.();
  };

  // Function to initiate scanning animations
  const startScanningAnimations = () => {
    // Cancel previous animations
    cancelAnimation(rotation);

    cancelAnimation(wave1);
    cancelAnimation(wave2);

    cancelAnimation(pulse);

    // For the wrist
    pulse.value = 1;

    // Continuous rotation of the icon
    rotation.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false,
    );

    // Waves expanding IMMEDIATELY
    wave1.value = 0;
    wave1.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.out(Easing.cubic) }),
      -1,
      false,
    );

    wave2.value = 0;
    wave2.value = withDelay(
      600,
      withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.out(Easing.cubic) }),
        -1,
        false,
      ),
    );
  };

  // Function to stop animations
  const stopScanningAnimations = () => {
    // For all animations
    cancelAnimation(rotation);

    cancelAnimation(wave1);
    cancelAnimation(wave2);

    // Soft reset
    rotation.value = withTiming(0, { duration: 300 });

    wave1.value = withTiming(0, { duration: 300 });
    wave2.value = withTiming(0, { duration: 300 });

    // Gentle pulse when idle
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  };

  useEffect(() => {
    if (isScanning) {
      startScanningAnimations();
      animationsStartedRef.current = true;
    } else {
      stopScanningAnimations();
      animationsStartedRef.current = false;
    }

    return () => {
      cancelAnimation(rotation);

      cancelAnimation(wave1);
      cancelAnimation(wave2);

      cancelAnimation(pulse);
    };
  }, [isScanning]);

  // Button style with touch scale
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: touchScale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: pulse.value }],
  }));

  // Animated wave styles
  const wave1Style = useAnimatedStyle(() => ({
    opacity: interpolate(wave1.value, [0, 0.3, 1], [0.6, 0.3, 0]),
    transform: [{ scale: interpolate(wave1.value, [0, 1], [0.3, 1]) }],
  }));

  const wave2Style = useAnimatedStyle(() => ({
    opacity: interpolate(wave2.value, [0, 0.3, 1], [0.6, 0.3, 0]),
    transform: [{ scale: interpolate(wave2.value, [0, 1], [0.3, 1]) }],
  }));

  const waveColor = theme.primary;
  const iconColor = isScanning
    ? theme.primary
    : isDark
      ? theme.textSecondary
      : theme.textTertiary;

  // The background circle color changes when activated
  const circleBackgroundColor = isScanning
    ? `${theme.primary}15`
    : isDark
      ? theme.surface
      : theme.surface;

  // Subtle border when idle to indicate that it is clickable
  const circleBorderColor = !isScanning ? `${theme.primary}30` : "transparent";

  // Offset to center the waves (which are larger than the button)
  const waveOffset = (waveSize - size) / 2;

  return (
    // Container with the size of the BUTTON (not the waves)
    // overflow: visible allows the waves to go beyond the boundaries without affecting the layout
    <View
      style={{
        width: size,
        height: size,
        overflow: "visible",
      }}
      className="items-center justify-center"
    >
      {/* Radar waves - ALWAYS rendered when isScanning */}
      {isScanning && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: waveSize,
            height: waveSize,
            top: -waveOffset,
            left: -waveOffset,
            zIndex: 1000,
          }}
          className="items-center justify-center"
        >
          <Animated.View
            style={[
              {
                position: "absolute",
                width: waveSize,
                height: waveSize,
                borderRadius: waveSize / 2,
                borderWidth: 2,
                borderColor: waveColor,
              },
              wave1Style,
            ]}
          />
          <Animated.View
            style={[
              {
                position: "absolute",
                width: waveSize,
                height: waveSize,
                borderRadius: waveSize / 2,
                borderWidth: 2,
                borderColor: waveColor,
              },
              wave2Style,
            ]}
          />
        </View>
      )}

      {/* Center button - clickable area with size = size */}
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: circleBackgroundColor,
            borderWidth: !isScanning ? 2 : 0,
            borderColor: circleBorderColor,
            opacity: disabled ? 0.5 : 1,
          },
          buttonStyle,
        ]}
        className="items-center justify-center"
      >
        {/* Center icon */}
        <Animated.View style={iconStyle}>
          <Radar size={size * 0.5} color={iconColor} strokeWidth={1.5} />
        </Animated.View>
      </AnimatedPressable>
    </View>
  );
};

export { RadarAnimation };
