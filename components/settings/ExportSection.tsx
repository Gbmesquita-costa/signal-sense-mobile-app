import { memo } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useTheme } from "@/theme";
import { Download, FileSpreadsheet } from "lucide-react-native";

interface ExportSectionProps {
  isExportingSessions: boolean;
  isExportingDevices: boolean;
  onExportSessions: () => void;
  onExportDevices: () => void;
  t: (key: string) => string;
}

const ExportSection = memo(function ExportSection({
  isExportingSessions,
  isExportingDevices,
  onExportSessions,
  onExportDevices,
  t,
}: ExportSectionProps) {
  const { theme, isDark } = useTheme();
  const isAnyExporting = isExportingSessions || isExportingDevices;

  return (
    <View>
      <ExportButton
        icon={
          <FileSpreadsheet size={18} color={theme.primary} strokeWidth={2} />
        }
        label={t("export.sessions")}
        description={t("export.sessionsDesc")}
        onPress={onExportSessions}
        isLoading={isExportingSessions}
        disabled={isAnyExporting}
        isDark={isDark}
        theme={theme}
      />
      <View
        className="h-px my-1"
        style={{ backgroundColor: `${theme.border}50` }}
      />
      <ExportButton
        icon={<Download size={18} color={theme.primary} strokeWidth={2} />}
        label={t("export.devices")}
        description={t("export.devicesDesc")}
        onPress={onExportDevices}
        isLoading={isExportingDevices}
        disabled={isAnyExporting}
        isDark={isDark}
        theme={theme}
      />
    </View>
  );
});

function ExportButton({
  icon,
  label,
  description,
  onPress,
  isLoading,
  disabled,
  isDark,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onPress: () => void;
  isLoading: boolean;
  disabled: boolean;
  isDark: boolean;
  theme: { textPrimary: string; textSecondary: string };
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="flex-row items-center
      py-3 px-4 active:opacity-70"
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      {icon}
      <View className="flex-1 ml-3">
        <Text
          className={`text-sm font-medium ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
        >
          {label}
        </Text>
        <Text
          className={`text-xs mt-0.5 ${isDark ? "text-text-tertiary-dark" : "text-text-tertiary"}`}
        >
          {description}
        </Text>
      </View>
      {isLoading && (
        <ActivityIndicator size="small" color={theme.textSecondary} />
      )}
    </Pressable>
  );
}

export { ExportSection };
