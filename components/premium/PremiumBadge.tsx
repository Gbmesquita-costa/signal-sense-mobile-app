import { Crown } from "lucide-react-native";
import { Text, View } from "react-native";

interface PremiumBadgeProps {
  size?: "sm" | "md";
}

const PremiumBadge = ({ size = "sm" }: PremiumBadgeProps) => {
  const iconSize = size === "sm" ? 10 : 14;

  return (
    <View
      className={`flex-row items-center rounded-full ${
        size === "sm" ? "px-1.5 py-0.5 gap-0.5" : "px-2 py-1 gap-1"
      }`}
      style={{ backgroundColor: "#F59E0B" }}
    >
      <Crown size={iconSize} color="#FFFFFF" fill="#FFFFFF" />
      <Text
        className={`font-bold text-white ${
          size === "sm" ? "text-[9px]" : "text-[11px]"
        }`}
      >
        PRO
      </Text>
    </View>
  );
};

export { PremiumBadge };
