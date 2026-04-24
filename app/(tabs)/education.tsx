/**
 * Education Screen
 * App Knowledge Center - explains each module and concept
 *
 * Topics:
 * 1. Introduction - What the app does
 * 2. Scan - How scanning works
 * 3. Proximity - RSSI, RTT, distance estimation
 * 4. Environment - Magnetometer, magnetic fields
 * 5. Anti-Stalking - Tracker detection protection
 * 6. Interference - What affects measurements
 * 7. Limitations - What the app does NOT do
 * 8. Best Practices - Usage tips
 */

import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import {
  BookOpen,
  Crown,
  History,
  Lightbulb,
  Magnet,
  Radar,
  Ruler,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react-native";

import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  EducationCard,
  EducationDetailModal,
  type EducationTopic,
} from "@/components/education";

import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/theme";

interface TopicConfig {
  id: string;
  icon: LucideIcon;
  colorKey: "primary" | "success" | "warning" | "error" | "info";
}

const TOPIC_CONFIGS: TopicConfig[] = [
  { id: "intro", icon: BookOpen, colorKey: "primary" },
  { id: "scan", icon: Radar, colorKey: "success" },
  { id: "proximity", icon: Ruler, colorKey: "info" },
  { id: "environment", icon: Magnet, colorKey: "warning" },
  { id: "history", icon: History, colorKey: "primary" },
  { id: "deviceProfiles", icon: Smartphone, colorKey: "info" },
  { id: "premium", icon: Crown, colorKey: "warning" },
  { id: "antiStalking", icon: ShieldCheck, colorKey: "error" },
  { id: "wifiInfo", icon: Wifi, colorKey: "info" },
  { id: "interference", icon: Zap, colorKey: "error" },
  { id: "limitations", icon: ShieldAlert, colorKey: "error" },
  { id: "bestPractices", icon: Lightbulb, colorKey: "success" },
];

const EducationScreen = () => {
  const { theme, isDark } = useTheme();
  const { t } = useI18n();

  const insets = useSafeAreaInsets();

  const [selectedTopic, setSelectedTopic] = useState<EducationTopic | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Build topics from translations
  const topics = useMemo<EducationTopic[]>(() => {
    const colorMap: Record<string, string> = {
      primary: theme.primary,
      success: theme.success,
      warning: theme.warning,
      error: theme.error,
      info: "#3B82F6",
    };

    return TOPIC_CONFIGS.map((config) => {
      const basePath = `education.topics.${config.id}`;

      // Get sections count dynamically
      const sections: { title: string; content: string }[] = [];
      let sectionIndex = 0;

      // Try to get up to 10 sections (safety limit)
      while (sectionIndex < 10) {
        const sectionTitle = t(`${basePath}.sections.${sectionIndex}.title`);
        const sectionContent = t(
          `${basePath}.sections.${sectionIndex}.content`,
        );

        // If the translation key returns itself, we've reached the end
        if (
          sectionTitle.includes(`sections.${sectionIndex}.title`) ||
          sectionContent.includes(`sections.${sectionIndex}.content`)
        ) {
          break;
        }

        sections.push({
          title: sectionTitle,
          content: sectionContent,
        });

        sectionIndex++;
      }

      const tipKey = `${basePath}.tip`;
      const tipValue = t(tipKey);

      const tip = tipValue.includes(".tip") ? undefined : tipValue;

      return {
        id: config.id,
        icon: config.icon,
        iconColor: colorMap[config.colorKey],
        title: t(`${basePath}.title`),
        description: t(`${basePath}.description`),
        sections,
        tip,
      };
    });
  }, [t, theme]);

  const handleOpenTopic = (topic: EducationTopic) => {
    setSelectedTopic(topic);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedTopic(null), 300);
  };

  return (
    <View
      className={` flex-1 ${isDark ? "bg-background-dark" : "bg-background"}`}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(50).duration(400)}
          className="mb-6 mt-6"
        >
          <Text
            className={`text-2xl font-bold mb-2 ${
              isDark ? "text-text-primary-dark" : "text-text-primary"
            }`}
          >
            {t("education.title")}
          </Text>
          <Text
            className={`text-base leading-6 ${
              isDark ? "text-text-secondary-dark" : "text-text-secondary"
            }`}
          >
            {t("education.subtitle")}
          </Text>
        </Animated.View>

        {/* Topic Cards */}
        {topics.map((topic, index) => (
          <Animated.View
            key={topic.id}
            entering={FadeInDown.delay(100 + index * 50).duration(400)}
          >
            <EducationCard
              icon={topic.icon}
              iconColor={topic.iconColor}
              title={topic.title}
              description={topic.description}
              isDark={isDark}
              onPress={() => handleOpenTopic(topic)}
            />
          </Animated.View>
        ))}

        {/* Footer Disclaimer */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(400)}
          className={`mt-4 p-4 rounded-xl ${
            isDark ? "bg-surface-dark" : "bg-surface"
          }`}
        >
          <Text
            className={`text-sm text-center leading-5 ${
              isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
            }`}
          >
            {t("education.disclaimer")}
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Detail Modal */}
      <EducationDetailModal
        visible={modalVisible}
        topic={selectedTopic}
        isDark={isDark}
        theme={theme}
        onClose={handleCloseModal}
        t={t}
      />
    </View>
  );
};

export default EducationScreen;
