/**
 * EducationCard
 * Card component for education topics
 */

import { ChevronRight, LucideIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface EducationCardProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
  isDark: boolean;
  onPress: () => void;
}

function EducationCard({
  icon: Icon,
  iconColor,
  title,
  description,
  isDark,
  onPress,
}: EducationCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`p-4 rounded-2xl mb-3 flex-row items-center ${
        isDark
          ? "bg-surface-dark active:bg-surface-dark/80"
          : "bg-surface active:bg-surface/80"
      }`}
    >
      {/* Icon */}
      <View
        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: `${iconColor}20` }}
      >
        <Icon size={24} color={iconColor} strokeWidth={2} />
      </View>

      {/* Content */}
      <View className="flex-1 mr-2">
        <Text
          className={`text-base font-semibold mb-1 ${
            isDark ? "text-text-primary-dark" : "text-text-primary"
          }`}
        >
          {title}
        </Text>
        <Text
          className={`text-sm leading-5 ${
            isDark ? "text-text-secondary-dark" : "text-text-secondary"
          }`}
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>

      {/* Arrow */}
      <ChevronRight
        size={20}
        color={isDark ? "#6B7280" : "#9CA3AF"}
        strokeWidth={2}
      />
    </Pressable>
  );
}

export { EducationCard };
