import { useCallback, useState } from "react";
import { Alert } from "react-native";

import { exportService } from "@/services/export";

function useExport() {
  const [exportingType, setExportingType] = useState<
    "sessions" | "devices" | null
  >(null);

  const exportSessions = useCallback(async () => {
    if (exportingType) return;
    try {
      setExportingType("sessions");

      const result = await exportService.exportSessionsCSV();
      await exportService.share(result);
    } catch (error) {
      Alert.alert("Export Error", "Failed to export sessions.");
    } finally {
      setExportingType(null);
    }
  }, [exportingType]);

  const exportDevices = useCallback(async () => {
    if (exportingType) return;
    try {
      setExportingType("devices");

      const result = await exportService.exportDevicesCSV();
      await exportService.share(result);
    } catch (error) {
      Alert.alert("Export Error", "Failed to export devices.");
    } finally {
      setExportingType(null);
    }
  }, [exportingType]);

  return {
    isExportingSessions: exportingType === "sessions",
    isExportingDevices: exportingType === "devices",
    exportSessions,
    exportDevices,
  };
}

export { useExport };
