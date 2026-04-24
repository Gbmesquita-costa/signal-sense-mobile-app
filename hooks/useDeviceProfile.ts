import { useCallback, useEffect, useRef, useState } from "react";

import { historyService } from "@/services/history";
import { bleManager } from "@/services/scan/ble.manager";

import type {
  DeviceProfile,
  DeviceSessionAppearance,
} from "@/services/history/history.types";

const PAGE_SIZE = 10;

function useDeviceProfile(deviceId: string | null) {
  const [device, setDevice] = useState<DeviceProfile | null>(null);
  const [sessions, setSessions] = useState<DeviceSessionAppearance[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(true);

  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const cursorRef = useRef<number | undefined>(undefined);

  // Load device profile + first page of sessions (instant from SQLite)
  useEffect(() => {
    if (!deviceId) {
      setIsLoading(false);
      setIsLoadingSessions(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setIsLoadingSessions(true);

      try {
        const [deviceData, sessionRows] = await Promise.all([
          historyService.getDevice(deviceId!),
          historyService.getDeviceSessions(deviceId!, PAGE_SIZE),
        ]);

        if (cancelled) return;

        setDevice(deviceData);
        setSessions(sessionRows);

        setHasMore(sessionRows.length >= PAGE_SIZE);
        cursorRef.current =
          sessionRows.length > 0
            ? sessionRows[sessionRows.length - 1].startedAt
            : undefined;
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsLoadingSessions(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [deviceId]);

  // Load more sessions (cursor-based)
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !deviceId) return;

    setIsLoadingMore(true);
    try {
      const rows = await historyService.getDeviceSessions(
        deviceId,
        PAGE_SIZE,
        cursorRef.current,
      );

      setSessions((prev) => [...prev, ...rows]);
      setHasMore(rows.length >= PAGE_SIZE);
      cursorRef.current =
        rows.length > 0 ? rows[rows.length - 1].startedAt : undefined;
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, deviceId]);

  const setCustomName = useCallback(
    async (name: string | null) => {
      if (!deviceId) return;

      try {
        await historyService.setDeviceCustomName(deviceId, name);
        setDevice((prev) => (prev ? { ...prev, customName: name } : prev));
      } catch {
        // Silently fail
      }
    },
    [deviceId],
  );

  // GATT name resolution
  const [isResolvingName, setIsResolvingName] = useState<boolean>(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const resolveName = useCallback(async () => {
    if (!device?.rawBleId || !deviceId) return;

    setIsResolvingName(true);
    setResolveError(null);

    try {
      const name = await bleManager.resolveDeviceName(device.rawBleId);
      if (name) {
        await historyService.setDeviceCustomName(deviceId, name);
        setDevice((prev) => (prev ? { ...prev, customName: name } : prev));
      } else {
        setResolveError("nameNotFound");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "CONNECTION_TIMEOUT") {
        setResolveError("connectionTimeout");
      } else if (msg === "GATT_DISCOVERY_FAILED") {
        setResolveError("gattFailed");
      } else {
        setResolveError("connectionFailed");
      }
    } finally {
      setIsResolvingName(false);
    }
  }, [device?.rawBleId, deviceId]);

  return {
    device,
    sessions,
    isLoading,
    isLoadingSessions,
    isLoadingMore,
    hasMore,
    loadMore,
    setCustomName,
    resolveName,
    isResolvingName,
    resolveError,
  };
}

export { useDeviceProfile };
