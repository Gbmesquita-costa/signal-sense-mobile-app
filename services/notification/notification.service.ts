import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { i18n } from "@/lib/i18n";
import type { StalkerAlert } from "@/services/stalker/stalker.types";

class NotificationService {
  private initialized = false;

  /** Request permissions and set up channels */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    const granted = await this.requestPermissions();
    if (!granted) return false;

    await this.setupChannels();
    this.initialized = true;
    return true;
  }

  /** Request notification permissions from the user */
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    if (existingStatus === "granted") return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  }

  /** Set up Android notification channel */
  private async setupChannels(): Promise<void> {
    if (Platform.OS !== "android") return;

    await Notifications.setNotificationChannelAsync("stalker-alerts", {
      name: i18n.t("antiStalking.notification.title"),
      description: i18n.t("antiStalking.notification.bodyUnknown"),
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
      enableLights: true,
      lightColor: "#EF4444",
    });
  }

  /** Send a local notification for a stalker alert */
  async sendStalkerAlert(alert: StalkerAlert): Promise<string> {
    const durationMin = Math.max(1, Math.round(alert.durationMs / 60_000));
    const deviceLabel =
      alert.deviceName ?? alert.trackerType ?? i18n.t("common.unknown");
    const unit =
      durationMin === 1
        ? i18n.t("antiStalking.notification.minute")
        : i18n.t("antiStalking.notification.minutes");

    const title = i18n.t("antiStalking.notification.title");
    const body = alert.trackerBrand
      ? i18n
          .t("antiStalking.notification.body")
          .replace("{type}", alert.trackerType ?? "device")
          .replace("{brand}", alert.trackerBrand)
          .replace("{duration}", durationMin.toString())
          .replace("{unit}", unit)
      : i18n
          .t("antiStalking.notification.bodyUnknown")
          .replace("{duration}", durationMin.toString())
          .replace("{unit}", unit);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        subtitle: deviceLabel,
        data: { alertId: alert.id, deviceId: alert.deviceId },
        ...(Platform.OS === "android" && { channelId: "stalker-alerts" }),
      },
      trigger: null, // Send immediately
    });

    return id;
  }

  /** Configure notification handler (foreground behavior) */
  setupForegroundHandler(): void {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
}

export const notificationService = new NotificationService();
