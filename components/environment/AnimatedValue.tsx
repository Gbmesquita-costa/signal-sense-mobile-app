/**
 * AnimatedValue
 * Text component that displays numeric values ​​with fluid animation
 * Uses Reanimated for 60 FPS updates without re-rendering
 */

import React from "react";
import Animated, {
  SharedValue,
  useAnimatedProps,
} from "react-native-reanimated";

import { TextInput } from "react-native";

// Create an animated TextInput component (hack for animated text in RN)
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedValueProps {
  value: SharedValue<number>;
  decimals?: number;
  suffix?: string;
  className?: string;
  style?: any;
}

const AnimatedValue = ({
  value,
  decimals = 1,
  suffix = "",
  className,
  style,
}: AnimatedValueProps) => {
  const animatedProps = useAnimatedProps(() => {
    return {
      text: `${value.value.toFixed(decimals)}${suffix}`,
      defaultValue: `${value.value.toFixed(decimals)}${suffix}`,
    };
  });

  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      className={className}
      style={[{ padding: 0, margin: 0 }, style]}
      animatedProps={animatedProps}
    />
  );
};

export { AnimatedValue };
