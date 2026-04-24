import { databaseService, generateId } from "@/services/database";
import type { StalkerAlert, TrustedDevice } from "./stalker.types";

interface StalkerAlertRow {
  id: string;
  device_id: string;
  device_name: string | null;
  tracker_type: string | null;
  tracker_brand: string | null;
  confidence: string;
  first_seen: number;
  last_seen: number;
  duration_ms: number;
  sighting_count: number;
  avg_rssi: number | null;
  created_at: number;
  dismissed: number;
}

interface TrustedDeviceRow {
  id: string;
  device_id: string;
  device_name: string | null;
  added_at: number;
}

class StalkerRepository {
  // ===== Alerts =====

  async createAlert(alert: Omit<StalkerAlert, "id">): Promise<string> {
    const id = generateId();
    await databaseService.execute(
      `INSERT INTO stalker_alerts (id, device_id, device_name, tracker_type, tracker_brand, confidence, first_seen, last_seen, duration_ms, sighting_count, avg_rssi, created_at, dismissed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        alert.deviceId,
        alert.deviceName,
        alert.trackerType,
        alert.trackerBrand,
        alert.confidence,
        alert.firstSeen,
        alert.lastSeen,
        alert.durationMs,
        alert.sightingCount,
        alert.avgRssi,
        alert.createdAt,
        alert.dismissed ? 1 : 0,
      ],
    );

    return id;
  }

  async getAlerts(limit: number = 50): Promise<StalkerAlert[]> {
    const rows = await databaseService.query<StalkerAlertRow>(
      `SELECT * FROM stalker_alerts ORDER BY created_at DESC LIMIT ?`,
      [limit],
    );

    return rows.map(this.mapAlert);
  }

  async getActiveAlerts(): Promise<StalkerAlert[]> {
    const rows = await databaseService.query<StalkerAlertRow>(
      `SELECT * FROM stalker_alerts WHERE dismissed = 0 ORDER BY created_at DESC`,
    );

    return rows.map(this.mapAlert);
  }

  async dismissAlert(id: string): Promise<void> {
    await databaseService.execute(
      `UPDATE stalker_alerts SET dismissed = 1 WHERE id = ?`,
      [id],
    );
  }

  async getAlertCount(): Promise<number> {
    const result = await databaseService.getFirst<{ count: number }>(
      `SELECT COUNT(*) as count FROM stalker_alerts WHERE dismissed = 0`,
    );

    return result?.count ?? 0;
  }

  // ===== Trusted Devices =====

  async addTrustedDevice(
    deviceId: string,
    deviceName: string | null,
  ): Promise<string> {
    const id = generateId();
    await databaseService.execute(
      `INSERT OR REPLACE INTO trusted_devices (id, device_id, device_name, added_at)
       VALUES (?, ?, ?, ?)`,
      [id, deviceId, deviceName, Date.now()],
    );

    return id;
  }

  async removeTrustedDevice(deviceId: string): Promise<void> {
    await databaseService.execute(
      `DELETE FROM trusted_devices WHERE device_id = ?`,
      [deviceId],
    );
  }

  async getTrustedDevices(): Promise<TrustedDevice[]> {
    const rows = await databaseService.query<TrustedDeviceRow>(
      `SELECT * FROM trusted_devices ORDER BY added_at DESC`,
    );

    return rows.map((row) => ({
      id: row.id,
      deviceId: row.device_id,
      deviceName: row.device_name,
      addedAt: row.added_at,
    }));
  }

  async isTrusted(deviceId: string): Promise<boolean> {
    const result = await databaseService.getFirst<{ count: number }>(
      `SELECT COUNT(*) as count FROM trusted_devices WHERE device_id = ?`,
      [deviceId],
    );

    return (result?.count ?? 0) > 0;
  }

  // ===== Mappers =====

  private mapAlert(row: StalkerAlertRow): StalkerAlert {
    return {
      id: row.id,
      deviceId: row.device_id,
      deviceName: row.device_name,
      trackerType: row.tracker_type as StalkerAlert["trackerType"],
      trackerBrand: row.tracker_brand as StalkerAlert["trackerBrand"],
      confidence: row.confidence as StalkerAlert["confidence"],
      firstSeen: row.first_seen,
      lastSeen: row.last_seen,
      durationMs: row.duration_ms,
      sightingCount: row.sighting_count,
      avgRssi: row.avg_rssi ?? -100,
      createdAt: row.created_at,
      dismissed: row.dismissed === 1,
    };
  }
}

export const stalkerRepository = new StalkerRepository();
