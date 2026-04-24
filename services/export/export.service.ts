import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { i18n } from "@/lib/i18n";
import { historyService } from "@/services/history";

import type { ExportResult } from "./export.types";

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, "0");

  const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

  return `${date} ${time}`;
}

class ExportService {
  async exportSessionsCSV(): Promise<ExportResult> {
    const t = (key: string) => i18n.t(key);
    const sessions = await historyService.getSessions(1000);

    const headers = [
      t("export.csv.id"),
      t("export.csv.startedAt"),
      t("export.csv.finishedAt"),
      t("export.csv.durationMs"),
      t("export.csv.deviceCount"),
    ].join(",");

    const rows = sessions.map((s) =>
      [
        s.id,
        formatDate(s.startedAt),
        s.finishedAt ? formatDate(s.finishedAt) : "",
        s.durationMs,
        s.deviceCount,
      ].join(","),
    );

    const csv = [headers, ...rows].join("\n");
    const fileName = `signalsense_sessions_${Date.now()}.csv`;

    return this.writeFile(fileName, csv);
  }

  async exportDevicesCSV(): Promise<ExportResult> {
    const t = (key: string) => i18n.t(key);
    const devices = await historyService.getAllDevices();

    const headers = [
      t("export.csv.id"),
      t("export.csv.bleId"),
      t("export.csv.name"),
      t("export.csv.customName"),
      t("export.csv.firstSeen"),
      t("export.csv.lastSeen"),
      t("export.csv.appearances"),
      t("export.csv.isTracker"),
      t("export.csv.trackerType"),
    ].join(",");

    const rows = devices.map((d) =>
      [
        d.id,
        d.rawBleId,
        this.escapeCsv(d.deviceName ?? ""),
        this.escapeCsv(d.customName ?? ""),
        formatDate(d.firstSeenEver),
        formatDate(d.lastSeenEver),
        d.appearanceCount,
        d.isTracker ? t("export.csv.yes") : t("export.csv.no"),
        d.trackerType ?? "",
      ].join(","),
    );

    const csv = [headers, ...rows].join("\n");
    const fileName = `signalsense_devices_${Date.now()}.csv`;

    return this.writeFile(fileName, csv);
  }

  async share(result: ExportResult): Promise<void> {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error("Sharing is not available on this device");
    }

    await Sharing.shareAsync(result.filePath, {
      mimeType: result.mimeType,
      dialogTitle: result.fileName,
    });
  }

  private writeFile(fileName: string, content: string): ExportResult {
    const file = new File(Paths.cache, fileName);

    if (!file.exists) {
      file.create();
    }

    file.write(content);

    return {
      filePath: file.uri,
      fileName,
      mimeType: "text/csv",
    };
  }

  private escapeCsv(value: string): string {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }

    return value;
  }
}

export const exportService = new ExportService();
