import { useTheme } from "@/theme";
import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

const Card = ({ children, className = "", ...props }: CardProps) => {
  const { isDark } = useTheme();

  return (
    <View
      className={`rounded-2xl p-4 ${
        isDark ? "bg-surface-dark" : "bg-surface"
      } ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};

export { Card };
