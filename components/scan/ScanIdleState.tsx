import { Bluetooth } from "lucide-react-native";
import { Text, View } from "react-native";

import Animated, { FadeIn, FadeInUp, FadeOut } from "react-native-reanimated";
import { RadarAnimation } from "./RadarAnimation";

interface ScanIdleStateProps {
  isDark: boolean;
  theme: {
    primary: string;
    textSecondary: string;
  };
  t: (key: string) => string;
  isLoading: boolean;
  onRadarPress: () => void;
}

function ScanIdleState({
  isDark,
  theme,
  t,
  isLoading,
  onRadarPress,
}: ScanIdleStateProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      className="flex-1 items-center mt-24 px-6"
    >
      {/* Central radar */}
      <RadarAnimation
        isScanning={isLoading}
        size={200}
        waveScale={2.5}
        onPress={onRadarPress}
        disabled={isLoading}
      />

      {/* Instruction text */}
      <Animated.Text
        entering={FadeInUp.delay(200).duration(400)}
        className={`text-center text-xl font-semibold mt-8 ${
          isDark ? "text-text-primary-dark" : "text-text-primary"
        }`}
      >
        {isLoading ? t("scan.states.checking") : t("scan.tapToStart")}
      </Animated.Text>

      {/* Description */}
      <Animated.Text
        entering={FadeInUp.delay(300).duration(400)}
        className={`text-base text-center mt-2 px-8 ${
          isDark ? "text-text-secondary-dark" : "text-text-secondary"
        }`}
      >
        {t("scan.description")}
      </Animated.Text>

      {/* Scan type icon */}
      <Animated.View
        entering={FadeInUp.delay(400).duration(400)}
        className="flex-row items-center justify-center mt-6 gap-6"
      >
        <View className="items-center">
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: `${theme.primary}20` }}
          >
            <Bluetooth size={24} color={theme.primary} strokeWidth={2} />
          </View>
          <Text
            className={`text-xs mt-2 ${
              isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
            }`}
          >
            Bluetooth
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export { ScanIdleState };
