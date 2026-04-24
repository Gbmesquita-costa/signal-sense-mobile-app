import { ScrollView, View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/theme";

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padded?: boolean;
}

const ScreenContainer = ({
  children,
  scrollable = false,
  padded = true,
  className = "",
  ...props
}: ScreenContainerProps) => {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const bgClass = isDark ? "bg-background-dark" : "bg-background";
  const paddingClass = padded ? "px-4" : "";

  if (scrollable) {
    return (
      <ScrollView
        className={`flex-1 ${bgClass}`}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
        {...props}
      >
        <View className={`flex-1 ${paddingClass} ${className}`}>
          {children}
        </View>
      </ScrollView>
    );
  }

  return (
    <View
      className={`flex-1 ${bgClass} ${paddingClass} ${className}`}
      style={{ paddingBottom: insets.bottom }}
      {...props}
    >
      {children}
    </View>
  );
};

export { ScreenContainer };
