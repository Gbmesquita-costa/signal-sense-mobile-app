import { memo } from "react";
import {
  Bluetooth,
  Clock,
  Compass,
  Radio,
  Trash2,
  Wifi,
} from "lucide-react-native";

import { Pressable, Text, View } from "react-native";
import type {
  SessionType,
  UnifiedSession,
} from "@/services/history/history.types";

// Locale mapping for Intl formatting
const LOCALE_MAP: Record<string, string> = {
  "pt-BR": "pt-BR",
  en: "en-US",
  es: "es-ES",
};

const TYPE_COLORS: Record<SessionType, string> = {
  scan: "#3B82F6",
  proximity: "#8B5CF6",
  environment: "#10B981",
  wifi: "#0EA5E9",
};

interface SessionCardProps {
  session: UnifiedSession;
  isDark: boolean;
  locale: string;
  theme: {
    primary: string;
    error: string;
    textSecondary: string;
  };
  t: (key: string) => string;
  onPress?: () => void;
  onDelete?: () => void;
}

function formatDuration(ms: number, t: (key: string) => string): string {
  const totalSeconds = Math.floor(ms / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const seconds = totalSeconds % 60;

  const s = t("history.duration.seconds");
  const m = t("history.duration.minutes");

  const h = t("history.duration.hours");

  if (hours > 0) {
    return `${hours}${h} ${minutes}${m}`;
  }

  if (minutes > 0) {
    return `${minutes}${m} ${seconds}${s}`;
  }

  return `${seconds}${s}`;
}

function formatDate(
  timestamp: number,
  locale: string,
  t: (key: string) => string,
): string {
  const date = new Date(timestamp);
  const now = new Date();

  const intlLocale = LOCALE_MAP[locale] ?? "en-US";
  const time = date.toLocaleTimeString(intlLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: intlLocale === "en-US",
  });

  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return `${t("history.today")} ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isYesterday) return `${t("history.yesterday")} ${time}`;

  const dateStr = date.toLocaleDateString(intlLocale, {
    day: "2-digit",
    month: "short",
  });

  return `${dateStr} ${time}`;
}

function getTypeIcon(type: SessionType, color: string) {
  switch (type) {
    case "scan":
      return <Bluetooth size={20} color={color} strokeWidth={2} />;
    case "proximity":
      return <Radio size={20} color={color} strokeWidth={2} />;
    case "environment":
      return <Compass size={20} color={color} strokeWidth={2} />;
    case "wifi":
      return <Wifi size={20} color={color} strokeWidth={2} />;
  }
}

const SessionCard = memo(function SessionCard({
  session,
  isDark,
  locale,
  theme,
  t,
  onPress,
  onDelete,
}: SessionCardProps) {
  const typeColor = TYPE_COLORS[session.type];
  const typeLabel = t(`history.sessionTypes.${session.type}`);

  return (
    <Pressable onPress={onPress}>
      <View
        className={`p-4 rounded-xl mb-3 ${isDark ? "bg-surface-dark" : "bg-surface"}`}
      >
        <View className="flex-row items-center">
          {/* Type icon circle */}
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${typeColor}15` }}
          >
            {getTypeIcon(session.type, typeColor)}
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text
                className={`font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary"}`}
              >
                {formatDate(session.startedAt, locale, t)}
              </Text>
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${typeColor}15` }}
              >
                <Text
                  className="text-[10px] font-bold"
                  style={{ color: typeColor }}
                >
                  {typeLabel}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mt-1 gap-3">
              {session.type === "wifi" && session.ssid && (
                <View className="flex-row items-center gap-1">
                  <Wifi size={11} color={theme.textSecondary} strokeWidth={2} />
                  <Text
                    className={`text-xs ${isDark ? "text-text-tertiary-dark" : "text-text-tertiary"}`}
                    numberOfLines={1}
                  >
                    {session.ssid}
                  </Text>
                </View>
              )}
              {session.type === "scan" && session.deviceCount != null && (
                <View className="flex-row items-center gap-1">
                  <Bluetooth
                    size={11}
                    color={theme.textSecondary}
                    strokeWidth={2}
                  />
                  <Text
                    className={`text-xs ${isDark ? "text-text-tertiary-dark" : "text-text-tertiary"}`}
                  >
                    {session.deviceCount}{" "}
                    {session.deviceCount === 1
                      ? t("history.device")
                      : t("history.devices")}
                  </Text>
                </View>
              )}

              <View className="flex-row items-center gap-1">
                <Clock size={11} color={theme.textSecondary} strokeWidth={2} />
                <Text
                  className={`text-xs ${isDark ? "text-text-tertiary-dark" : "text-text-tertiary"}`}
                >
                  {formatDuration(session.durationMs, t)}
                </Text>
              </View>
            </View>
          </View>

          {/* Delete button */}
          {onDelete && (
            <Pressable
              onPress={onDelete}
              className="p-2 -mr-2 active:opacity-70"
              hitSlop={8}
            >
              <Trash2 size={18} color={theme.error} strokeWidth={2} />
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
});

export { SessionCard };
