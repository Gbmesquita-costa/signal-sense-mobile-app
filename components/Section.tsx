import { useTheme } from "@/theme";
import { Text, View, type ViewProps } from "react-native";

interface SectionProps extends ViewProps {
  title?: string;
  children: React.ReactNode;
}

const Section = ({
  title,
  children,
  className = "",
  ...props
}: SectionProps) => {
  const { isDark } = useTheme();

  return (
    <View className={`mb-6 ${className}`} {...props}>
      {title && (
        <Text
          className={`text-sm font-semibold mb-3 uppercase tracking-wide ${
            isDark ? "text-text-secondary-dark" : "text-text-secondary"
          }`}
        >
          {title}
        </Text>
      )}
      {children}
    </View>
  );
};

export { Section };
