import type {
  DeviceRow,
  EnvironmentSessionRow,
  ProximitySessionRow,
  ScanSessionRow,
  SessionDeviceRow,
  WifiSessionRow,
} from "@/services/database";

import { databaseService, generateId } from "@/services/database";
import type {
  CreateSessionInput,
  DeviceProfile,
  DeviceSessionAppearance,
  EnvironmentSample,
  HistorySession,
  ProximitySample,
  RssiStats,
  SessionDevice,
  SessionType,
  UnifiedSession,
  UpsertDeviceInput,
  WifiSample,
} from "./history.types";

class HistoryService {
  // ===== Scan Sessions =====

  async createSession(input: CreateSessionInput): Promise<string> {
    await databaseService.execute(
      `INSERT INTO scan_sessions (id, started_at, finished_at, duration_ms, device_count)
       VALUES (?, ?, ?, ?, ?)`,
      [
        input.id,
        input.startedAt,
        input.finishedAt,
        input.durationMs,
        input.deviceCount,
      ],
    );

    return input.id;
  }

  async getSessions(
    limit: number = 50,
    cursor?: number,
  ): Promise<HistorySession[]> {
    const params: number[] = [];
    let cursorClause = "";

    if (cursor != null) {
      cursorClause = "WHERE started_at < ?";
      params.push(cursor);
    }

    params.push(limit);

    const rows = await databaseService.query<ScanSessionRow>(
      `SELECT * FROM scan_sessions ${cursorClause} ORDER BY started_at DESC LIMIT ?`,
      params,
    );

    return rows.map(this.mapSession);
  }

  async getSession(id: string): Promise<HistorySession | null> {
    const row = await databaseService.getFirst<ScanSessionRow>(
      `SELECT * FROM scan_sessions WHERE id = ?`,
      [id],
    );

    return row ? this.mapSession(row) : null;
  }

  async getSessionCount(): Promise<number> {
    const result = await databaseService.getFirst<{ count: number }>(
      `SELECT COUNT(*) as count FROM scan_sessions`,
    );

    return result?.count ?? 0;
  }

  async deleteSession(id: string): Promise<void> {
    await databaseService.execute(
      `DELETE FROM session_devices WHERE session_id = ?`,
      [id],
    );

    await databaseService.execute(`DELETE FROM scan_sessions WHERE id = ?`, [
      id,
    ]);
  }

  // ===== Devices =====

  async upsertDevice(input: UpsertDeviceInput): Promise<void> {
    const existing = await databaseService.getFirst<DeviceRow>(
      `SELECT * FROM devices WHERE id = ?`,
      [input.id],
    );

    if (existing) {
      await databaseService.execute(
        `UPDATE devices SET
          device_name = COALESCE(?, device_name),
          last_seen_ever = MAX(?, last_seen_ever),
          appearance_count = appearance_count + 1,
          is_tracker = ?,
          tracker_type = COALESCE(?, tracker_type),
          manufacturer_data = COALESCE(?, manufacturer_data),
          service_uuids = COALESCE(?, service_uuids)
        WHERE id = ?`,
        [
          input.deviceName,
          input.lastSeen,
          input.isTracker ? 1 : 0,
          input.trackerType,
          input.manufacturerData,
          JSON.stringify(input.serviceUuids),
          input.id,
        ],
      );
    } else {
      await databaseService.execute(
        `INSERT INTO devices (id, raw_ble_id, device_name, first_seen_ever, last_seen_ever, appearance_count, is_tracker, tracker_type, manufacturer_data, service_uuids)
         VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
        [
          input.id,
          input.rawBleId,
          input.deviceName,
          input.firstSeen,
          input.lastSeen,
          input.isTracker ? 1 : 0,
          input.trackerType,
          input.manufacturerData,
          JSON.stringify(input.serviceUuids),
        ],
      );
    }
  }

  async getDevice(id: string): Promise<DeviceProfile | null> {
    const row = await databaseService.getFirst<DeviceRow>(
      `SELECT * FROM devices WHERE id = ?`,
      [id],
    );

    return row ? this.mapDevice(row) : null;
  }

  async getAllDevices(): Promise<DeviceProfile[]> {
    const rows = await databaseService.query<DeviceRow>(
      `SELECT * FROM devices ORDER BY last_seen_ever DESC`,
    );

    return rows.map(this.mapDevice);
  }

  async setDeviceCustomName(id: string, name: string | null): Promise<void> {
    await databaseService.execute(
      `UPDATE devices SET custom_name = ? WHERE id = ?`,
      [name, id],
    );
  }

  async getCustomNames(): Promise<Map<string, string>> {
    const rows = await databaseService.query<{
      id: string;
      custom_name: string;
    }>(`SELECT id, custom_name FROM devices WHERE custom_name IS NOT NULL`);

    return new Map(rows.map((r) => [r.id, r.custom_name]));
  }

  async getKnownDeviceIds(): Promise<Set<string>> {
    const rows = await databaseService.query<{ id: string }>(
      `SELECT id FROM devices`,
    );

    return new Set(rows.map((r) => r.id));
  }

  // ===== Session Devices =====

  async addDeviceToSession(
    sessionId: string,
    deviceId: string,
    rssi: RssiStats,
  ): Promise<void> {
    await databaseService.execute(
      `INSERT INTO session_devices (id, session_id, device_id, rssi_min, rssi_max, rssi_avg, first_seen, last_seen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        sessionId,
        deviceId,
        rssi.min,
        rssi.max,
        rssi.avg,
        rssi.firstSeen,
        rssi.lastSeen,
      ],
    );
  }

  async getSessionDevices(sessionId: string): Promise<SessionDevice[]> {
    const rows = await databaseService.query<
      SessionDeviceRow & {
        device_name: string | null;
        custom_name: string | null;
        is_tracker: number;
        tracker_type: string | null;
      }
    >(
      `SELECT sd.*, d.device_name, d.custom_name, d.is_tracker, d.tracker_type
       FROM session_devices sd
       LEFT JOIN devices d ON sd.device_id = d.id
       WHERE sd.session_id = ?
       ORDER BY sd.rssi_max DESC`,
      [sessionId],
    );

    return rows.map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      deviceId: row.device_id,
      rssiMin: row.rssi_min,
      rssiMax: row.rssi_max,
      rssiAvg: row.rssi_avg,
      firstSeen: row.first_seen,
      lastSeen: row.last_seen,
      deviceName: row.device_name,
      customName: row.custom_name,
      isTracker: row.is_tracker === 1,
      trackerType: row.tracker_type,
    }));
  }

  // ===== Device Session History =====

  async getDeviceSessions(
    deviceId: string,
    limit: number = 10,
    cursor?: number,
  ): Promise<DeviceSessionAppearance[]> {
    const params: (string | number)[] = [deviceId];
    let cursorClause = "";

    if (cursor != null) {
      cursorClause = "AND ss.started_at < ?";
      params.push(cursor);
    }

    params.push(limit);

    const rows = await databaseService.query<{
      session_id: string;
      started_at: number;
      duration_ms: number;
      device_count: number;
      rssi_min: number | null;
      rssi_max: number | null;
      rssi_avg: number | null;
    }>(
      `SELECT ss.id as session_id, ss.started_at, ss.duration_ms, ss.device_count,
              MIN(sd.rssi_min) as rssi_min, MAX(sd.rssi_max) as rssi_max, AVG(sd.rssi_avg) as rssi_avg
       FROM session_devices sd
       JOIN scan_sessions ss ON sd.session_id = ss.id
       WHERE sd.device_id = ? ${cursorClause}
       GROUP BY ss.id
       ORDER BY ss.started_at DESC
       LIMIT ?`,
      params,
    );

    return rows.map((row) => ({
      sessionId: row.session_id,
      startedAt: row.started_at,
      durationMs: row.duration_ms,
      deviceCount: row.device_count,
      rssiMin: row.rssi_min,
      rssiMax: row.rssi_max,
      rssiAvg: row.rssi_avg,
    }));
  }

  // ===== Proximity Sessions =====

  async createProximitySession(deviceId: string): Promise<string> {
    const id = generateId();
    await databaseService.execute(
      `INSERT INTO proximity_sessions (id, device_id, started_at, rssi_samples)
       VALUES (?, ?, ?, ?)`,
      [id, deviceId, Date.now(), "[]"],
    );

    return id;
  }

  async addProximitySamples(
    id: string,
    samples: ProximitySample[],
  ): Promise<void> {
    const existing = await databaseService.getFirst<ProximitySessionRow>(
      `SELECT rssi_samples FROM proximity_sessions WHERE id = ?`,
      [id],
    );

    const current: ProximitySample[] = existing?.rssi_samples
      ? JSON.parse(existing.rssi_samples)
      : [];

    // Cap at 10000 samples
    const combined = [...current, ...samples].slice(-10000);

    await databaseService.execute(
      `UPDATE proximity_sessions SET rssi_samples = ? WHERE id = ?`,
      [JSON.stringify(combined), id],
    );
  }

  async finishProximitySession(id: string): Promise<void> {
    await databaseService.execute(
      `UPDATE proximity_sessions SET finished_at = ? WHERE id = ?`,
      [Date.now(), id],
    );
  }

  async getProximitySessions(): Promise<ProximitySessionRow[]> {
    return databaseService.query<ProximitySessionRow>(
      `SELECT * FROM proximity_sessions ORDER BY started_at DESC`,
    );
  }

  // ===== Environment Sessions =====

  async createEnvironmentSession(): Promise<string> {
    const id = generateId();
    await databaseService.execute(
      `INSERT INTO environment_sessions (id, started_at, samples)
       VALUES (?, ?, ?)`,
      [id, Date.now(), "[]"],
    );

    return id;
  }

  async addEnvironmentSamples(
    id: string,
    samples: EnvironmentSample[],
  ): Promise<void> {
    const existing = await databaseService.getFirst<EnvironmentSessionRow>(
      `SELECT samples FROM environment_sessions WHERE id = ?`,
      [id],
    );

    const current: EnvironmentSample[] = existing?.samples
      ? JSON.parse(existing.samples)
      : [];

    const combined = [...current, ...samples].slice(-10000);
    await databaseService.execute(
      `UPDATE environment_sessions SET samples = ? WHERE id = ?`,
      [JSON.stringify(combined), id],
    );
  }

  async finishEnvironmentSession(id: string): Promise<void> {
    await databaseService.execute(
      `UPDATE environment_sessions SET finished_at = ? WHERE id = ?`,
      [Date.now(), id],
    );
  }

  async getEnvironmentSessions(): Promise<EnvironmentSessionRow[]> {
    return databaseService.query<EnvironmentSessionRow>(
      `SELECT * FROM environment_sessions ORDER BY started_at DESC`,
    );
  }

  // ===== Wi-Fi Sessions =====

  async createWifiSession(ssid: string | null): Promise<string> {
    const id = generateId();
    await databaseService.execute(
      `INSERT INTO wifi_sessions (id, started_at, ssid, samples)
       VALUES (?, ?, ?, ?)`,
      [id, Date.now(), ssid, "[]"],
    );

    return id;
  }

  async addWifiSamples(id: string, samples: WifiSample[]): Promise<void> {
    const existing = await databaseService.getFirst<WifiSessionRow>(
      `SELECT samples FROM wifi_sessions WHERE id = ?`,
      [id],
    );

    const current: WifiSample[] = existing?.samples
      ? JSON.parse(existing.samples)
      : [];

    const combined = [...current, ...samples].slice(-10000);
    await databaseService.execute(
      `UPDATE wifi_sessions SET samples = ?, ssid = COALESCE(?, ssid) WHERE id = ?`,
      [JSON.stringify(combined), samples[samples.length - 1]?.ssid ?? null, id],
    );
  }

  async finishWifiSession(id: string): Promise<void> {
    await databaseService.execute(
      `UPDATE wifi_sessions SET finished_at = ? WHERE id = ?`,
      [Date.now(), id],
    );
  }

  // ===== Unified Sessions =====

  async getUnifiedSessions(
    limit: number = 50,
    cursor?: number,
    type?: SessionType,
  ): Promise<UnifiedSession[]> {
    const parts: string[] = [];
    const params: (string | number)[] = [];

    if (!type || type === "scan") {
      parts.push(
        `SELECT id, 'scan' as type, started_at, finished_at, duration_ms, device_count, NULL as device_id, NULL as ssid
         FROM scan_sessions`,
      );
    }
    if (!type || type === "proximity") {
      parts.push(
        `SELECT id, 'proximity' as type, started_at, finished_at,
         COALESCE(finished_at - started_at, 0) as duration_ms, NULL as device_count, device_id, NULL as ssid
         FROM proximity_sessions`,
      );
    }
    if (!type || type === "environment") {
      parts.push(
        `SELECT id, 'environment' as type, started_at, finished_at,
         COALESCE(finished_at - started_at, 0) as duration_ms, NULL as device_count, NULL as device_id, NULL as ssid
         FROM environment_sessions`,
      );
    }
    if (!type || type === "wifi") {
      parts.push(
        `SELECT id, 'wifi' as type, started_at, finished_at,
         COALESCE(finished_at - started_at, 0) as duration_ms, NULL as device_count, NULL as device_id, ssid
         FROM wifi_sessions`,
      );
    }

    let cursorClause = "";
    if (cursor != null) {
      cursorClause = "WHERE started_at < ?";
      params.push(cursor);
    }

    params.push(limit);

    const sql = `SELECT * FROM (${parts.join(" UNION ALL ")}) ${cursorClause} ORDER BY started_at DESC LIMIT ?`;

    const rows = await databaseService.query<{
      id: string;
      type: SessionType;
      started_at: number;
      finished_at: number | null;
      duration_ms: number;
      device_count: number | null;
      device_id: string | null;
      ssid: string | null;
    }>(sql, params);

    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      durationMs: row.duration_ms,
      deviceCount: row.device_count ?? undefined,
      deviceId: row.device_id ?? undefined,
      ssid: row.ssid ?? undefined,
    }));
  }

  async getUnifiedSessionCount(type?: SessionType): Promise<number> {
    if (type) {
      const tableMap: Record<SessionType, string> = {
        scan: "scan_sessions",
        proximity: "proximity_sessions",
        environment: "environment_sessions",
        wifi: "wifi_sessions",
      };

      const result = await databaseService.getFirst<{ count: number }>(
        `SELECT COUNT(*) as count FROM ${tableMap[type]}`,
      );

      return result?.count ?? 0;
    }

    const result = await databaseService.getFirst<{ count: number }>(
      `SELECT
        (SELECT COUNT(*) FROM scan_sessions) +
        (SELECT COUNT(*) FROM proximity_sessions) +
        (SELECT COUNT(*) FROM environment_sessions) +
        (SELECT COUNT(*) FROM wifi_sessions) as count`,
    );

    return result?.count ?? 0;
  }

  async deleteUnifiedSession(id: string, type: SessionType): Promise<void> {
    switch (type) {
      case "scan":
        await this.deleteSession(id);
        break;
      case "proximity":
        await databaseService.execute(
          `DELETE FROM proximity_sessions WHERE id = ?`,
          [id],
        );
        break;
      case "environment":
        await databaseService.execute(
          `DELETE FROM environment_sessions WHERE id = ?`,
          [id],
        );
        break;
      case "wifi":
        await databaseService.execute(
          `DELETE FROM wifi_sessions WHERE id = ?`,
          [id],
        );
        break;
    }
  }

  // ===== Mappers =====

  private mapSession(row: ScanSessionRow): HistorySession {
    return {
      id: row.id,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      durationMs: row.duration_ms,
      deviceCount: row.device_count,
    };
  }

  private mapDevice(row: DeviceRow): DeviceProfile {
    return {
      id: row.id,
      rawBleId: row.raw_ble_id,
      customName: row.custom_name,
      deviceName: row.device_name,
      firstSeenEver: row.first_seen_ever,
      lastSeenEver: row.last_seen_ever,
      appearanceCount: row.appearance_count,
      isTracker: row.is_tracker === 1,
      trackerType: row.tracker_type,
      manufacturerData: row.manufacturer_data,
      serviceUuids: row.service_uuids ? JSON.parse(row.service_uuids) : [],
    };
  }
}

export const historyService = new HistoryService();
