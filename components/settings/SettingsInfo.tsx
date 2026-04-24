import { useTheme } from "@/theme";
import { Text, View } from "react-native";

interface SettingsInfoProps {
  label?: string;
  value?: string;
  content?: string;
}

const SettingsInfo = ({ label, value, content }: SettingsInfoProps) => {
  const { isDark } = useTheme();

  if (content) {
    return (
      <View className="px-4 py-3">
        <Text
          className={`text-sm leading-relaxed ${
            isDark ? "text-text-secondary-dark" : "text-text-secondary"
          }`}
        >
          {content}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <Text
        className={`text-base ${
          isDark ? "text-text-primary-dark" : "text-text-primary"
        }`}
      >
        {label}
      </Text>
      <Text
        className={`text-base ${
          isDark ? "text-text-secondary-dark" : "text-text-secondary"
        }`}
      >
        {value}
      </Text>
    </View>
  );
};

export { SettingsInfo };
