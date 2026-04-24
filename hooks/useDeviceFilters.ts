import type { ScannedDevice, SignalStrength } from "@/services/scan";
import { useCallback, useMemo, useState } from "react";

type SortBy = "rssi" | "name" | "lastSeen";
type SortOrder = "asc" | "desc";

interface DeviceFilters {
  search: string;
  signalStrength: SignalStrength | null;
  trackersOnly: boolean;
  namedOnly: boolean;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

const DEFAULT_FILTERS: DeviceFilters = {
  search: "",
  signalStrength: null,
  trackersOnly: false,
  namedOnly: false,
  sortBy: "rssi",
  sortOrder: "desc",
};

function getDisplayName(
  d: ScannedDevice,
  customNames?: Map<string, string>,
): string {
  return customNames?.get(d.id) || d.name || d.bleData?.localName || "";
}

function useDeviceFilters(
  devices: ScannedDevice[],
  customNames?: Map<string, string>,
) {
  const [filters, setFilters] = useState<DeviceFilters>(DEFAULT_FILTERS);

  const updateFilter = useCallback(
    <K extends keyof DeviceFilters>(key: K, value: DeviceFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== "" ||
      filters.signalStrength !== null ||
      filters.trackersOnly ||
      filters.namedOnly ||
      filters.sortBy !== "rssi"
    );
  }, [filters]);

  const filteredDevices = useMemo(() => {
    let result = [...devices];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter((d) => {
        const custom = customNames?.get(d.id);
        return (
          custom?.toLowerCase().includes(search) ||
          d.name?.toLowerCase().includes(search) ||
          d.id.toLowerCase().includes(search) ||
          d.bleData?.localName?.toLowerCase().includes(search)
        );
      });
    }

    // Signal strength filter
    if (filters.signalStrength) {
      result = result.filter((d) => d.rssi.strength === filters.signalStrength);
    }

    // Trackers only
    if (filters.trackersOnly) {
      result = result.filter((d) => d.trackerInfo?.isTracker);
    }

    // Named only
    if (filters.namedOnly) {
      result = result.filter(
        (d) => customNames?.has(d.id) || d.name || d.bleData?.localName,
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case "rssi":
          comparison = a.rssi.smoothed - b.rssi.smoothed;
          break;
        case "name": {
          const nameA = getDisplayName(a, customNames) || "zzz";
          const nameB = getDisplayName(b, customNames) || "zzz";
          comparison = nameA.localeCompare(nameB);
          break;
        }
        case "lastSeen":
          comparison = a.lastSeen - b.lastSeen;
          break;
      }

      return filters.sortOrder === "desc" ? -comparison : comparison;
    });

    return result;
  }, [devices, filters, customNames]);

  return {
    filters,
    filteredDevices,
    filteredCount: filteredDevices.length,
    totalCount: devices.length,
    hasActiveFilters,
    updateFilter,
    resetFilters,
  };
}

export { DeviceFilters, SortBy, SortOrder, useDeviceFilters };
