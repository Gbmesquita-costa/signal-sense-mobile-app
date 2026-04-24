// Database row types (match SQLite schema)

interface ScanSessionRow {
  id: string;
  started_at: number;
  finished_at: number | null;
  duration_ms: number;
  device_count: number;
}

interface DeviceRow {
  id: string;
  raw_ble_id: string;
  custom_name: string | null;
  device_name: string | null;
  first_seen_ever: number;
  last_seen_ever: number;
  appearance_count: number;
  is_tracker: number; // 0 or 1
  tracker_type: string | null;
  manufacturer_data: string | null;
  service_uuids: string | null; // JSON array
}

interface SessionDeviceRow {
  id: string;
  session_id: string;
  device_id: string;
  rssi_min: number | null;
  rssi_max: number | null;
  rssi_avg: number | null;
  first_seen: number;
  last_seen: number;
}

interface ProximitySessionRow {
  id: string;
  device_id: string;
  started_at: number;
  finished_at: number | null;
  rssi_samples: string | null; // JSON array
}

interface EnvironmentSessionRow {
  id: string;
  started_at: number;
  finished_at: number | null;
  samples: string | null; // JSON array
}

interface WifiSessionRow {
  id: string;
  started_at: number;
  finished_at: number | null;
  ssid: string | null;
  samples: string | null; // JSON array
}

export {
  DeviceRow,
  EnvironmentSessionRow,
  ProximitySessionRow,
  ScanSessionRow,
  SessionDeviceRow,
  WifiSessionRow,
};
