/**
 * EducationDetailModal
 * Bottom sheet modal for displaying detailed education content
 * Uses @gorhom/bottom-sheet for smooth drag-to-dismiss
 */

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

import { Lightbulb, type LucideIcon, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";

interface EducationSection {
  title: string;
  content: string;
}

interface EducationTopic {
  id: string;
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
  sections: EducationSection[];
  tip?: string;
}

interface EducationDetailModalProps {
  visible: boolean;
  topic: EducationTopic | null;
  isDark: boolean;
  theme: {
    primary: string;
    background: string;
  };
  onClose: () => void;
  t: (key: string) => string;
}

function EducationDetailModal({
  visible,
  topic,
  isDark,
  onClose,
  t,
}: EducationDetailModalProps) {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Snap points - 90% of screen height
  const snapPoints = useMemo(() => ["90%"], []);

  // Theme colors
  const themeColors = isDark ? colors.dark : colors.light;

  // Open/close based on visibility
  useEffect(() => {
    if (visible && topic) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible, topic]);

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleClose = () => {
    bottomSheetRef.current?.dismiss();
  };

  if (!topic) return null;
  const Icon = topic.icon;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      onDismiss={onClose}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{
        backgroundColor: isDark ? "#6B7280" : "#9CA3AF",
        width: 48,
        height: 5,
      }}
      backgroundStyle={{
        backgroundColor: themeColors.background,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pb-4">
        <View className="flex-row items-center flex-1">
          <View
            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: `${topic.iconColor}20` }}
          >
            <Icon size={20} color={topic.iconColor} strokeWidth={2} />
          </View>
          <Text
            className={`text-lg font-bold flex-1 ${
              isDark ? "text-text-primary-dark" : "text-text-primary"
            }`}
            numberOfLines={1}
          >
            {topic.title}
          </Text>
        </View>

        <Pressable
          onPress={handleClose}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            isDark ? "bg-surface-dark" : "bg-surface"
          }`}
        >
          <X size={20} color={isDark ? "#9CA3AF" : "#6B7280"} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Content */}
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <Text
          className={`text-base leading-6 mb-6 ${
            isDark ? "text-text-secondary-dark" : "text-text-secondary"
          }`}
        >
          {topic.description}
        </Text>

        {/* Sections */}
        {topic.sections.map((section, index) => (
          <View
            key={index}
            className={`mb-4 p-4 rounded-xl ${
              isDark ? "bg-surface-dark" : "bg-surface"
            }`}
          >
            <Text
              className={`text-sm font-bold uppercase mb-2 ${
                isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
              }`}
            >
              {section.title}
            </Text>
            <Text
              className={`text-base leading-6 ${
                isDark ? "text-text-primary-dark" : "text-text-primary"
              }`}
            >
              {section.content}
            </Text>
          </View>
        ))}

        {/* Tip */}
        {topic.tip && (
          <View
            className={`mt-2 p-4 rounded-xl flex-row items-start ${
              isDark ? "bg-surface-dark" : "bg-surface"
            }`}
            style={{ borderLeftWidth: 4, borderLeftColor: themeColors.primary }}
          >
            <View className="mr-3 mt-0.5">
              <Lightbulb size={20} color={isDark ? "#FFFF00" : "#FFCC00"} />
            </View>
            <View className="flex-1">
              <Text
                className={`text-xs font-bold uppercase mb-1 ${
                  isDark ? "text-text-tertiary-dark" : "text-text-tertiary"
                }`}
              >
                {t("education.tip")}
              </Text>
              <Text
                className={`text-sm leading-5 ${
                  isDark ? "text-text-secondary-dark" : "text-text-secondary"
                }`}
              >
                {topic.tip}
              </Text>
            </View>
          </View>
        )}

        {/* Close Button */}
        <View className="mt-6">
          <Pressable
            onPress={handleClose}
            className="py-4 rounded-xl items-center"
            style={{ backgroundColor: themeColors.primary }}
          >
            <Text className="text-white font-semibold text-base">
              {t("common.close")}
            </Text>
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

export { EducationDetailModal, EducationSection, EducationTopic };
