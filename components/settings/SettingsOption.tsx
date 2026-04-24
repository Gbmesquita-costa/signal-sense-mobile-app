import { Check } from "lucide-react-native";
import { Pressable, Text } from "react-native";

import { useTheme } from "@/theme";

interface SettingsOptionProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  isLast?: boolean;
}

const SettingsOption = ({
  label,
  selected = false,
  onPress,
  isLast = false,
}: SettingsOptionProps) => {
  const { theme, isDark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center justify-between px-4 py-3 active:opacity-70 ${
        !isLast
          ? isDark
            ? "border-b border-border-dark"
            : "border-b border-border"
          : ""
      }`}
    >
      <Text
        className={`text-base ${
          isDark ? "text-text-primary-dark" : "text-text-primary"
        }`}
      >
        {label}
      </Text>
      {selected && <Check size={20} color={theme.primary} strokeWidth={2.5} />}
    </Pressable>
  );
};

export { SettingsOption };
