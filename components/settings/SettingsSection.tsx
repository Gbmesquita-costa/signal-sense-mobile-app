import { useTheme } from "@/theme";
import { Text, View } from "react-native";

import type { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

const SettingsSection = ({ title, children }: SettingsSectionProps) => {
  const { isDark } = useTheme();

  return (
    <View className="mb-6">
      <Text
        className={`text-xs font-semibold uppercase tracking-wide mb-2 px-4 ${
          isDark ? "text-text-secondary-dark" : "text-text-secondary"
        }`}
      >
        {title}
      </Text>
      <View
        className={`rounded-xl overflow-hidden mx-4 ${
          isDark ? "bg-surface-dark" : "bg-surface"
        }`}
      >
        {children}
      </View>
    </View>
  );
};

export { SettingsSection };
