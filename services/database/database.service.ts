import * as SQLite from "expo-sqlite";

type BindValue = string | number | null | boolean | Uint8Array;

const DB_NAME = "signalsense.db";

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.db) return;

    // Dedupe concurrent initialize() calls so we never open the DB twice
    // (which leaks the first handle and causes NullPointerExceptions later).
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        this.db = await SQLite.openDatabaseAsync(DB_NAME);

        await this.db.execAsync("PRAGMA journal_mode = WAL;");
        await this.runMigrations();
      } catch (err) {
        this.db = null;
        throw err;
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS scan_sessions (
        id            TEXT PRIMARY KEY,
        started_at    INTEGER NOT NULL,
        finished_at   INTEGER,
        duration_ms   INTEGER NOT NULL DEFAULT 0,
        device_count  INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS devices (
        id                TEXT PRIMARY KEY,
        raw_ble_id        TEXT NOT NULL,
        custom_name       TEXT,
        device_name       TEXT,
        first_seen_ever   INTEGER NOT NULL,
        last_seen_ever    INTEGER NOT NULL,
        appearance_count  INTEGER NOT NULL DEFAULT 1,
        is_tracker        INTEGER NOT NULL DEFAULT 0,
        tracker_type      TEXT,
        manufacturer_data TEXT,
        service_uuids     TEXT
      );

      CREATE TABLE IF NOT EXISTS session_devices (
        id              TEXT PRIMARY KEY,
        session_id      TEXT NOT NULL,
        device_id       TEXT NOT NULL,
        rssi_min        INTEGER,
        rssi_max        INTEGER,
        rssi_avg        REAL,
        first_seen      INTEGER NOT NULL,
        last_seen       INTEGER NOT NULL,
        FOREIGN KEY (session_id) REFERENCES scan_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_session_devices_session ON session_devices(session_id);
      CREATE INDEX IF NOT EXISTS idx_session_devices_device ON session_devices(device_id);

      CREATE TABLE IF NOT EXISTS proximity_sessions (
        id              TEXT PRIMARY KEY,
        device_id       TEXT NOT NULL,
        started_at      INTEGER NOT NULL,
        finished_at     INTEGER,
        rssi_samples    TEXT,
        FOREIGN KEY (device_id) REFERENCES devices(id)
      );

      CREATE TABLE IF NOT EXISTS environment_sessions (
        id              TEXT PRIMARY KEY,
        started_at      INTEGER NOT NULL,
        finished_at     INTEGER,
        samples         TEXT
      );

      CREATE TABLE IF NOT EXISTS wifi_sessions (
        id              TEXT PRIMARY KEY,
        started_at      INTEGER NOT NULL,
        finished_at     INTEGER,
        ssid            TEXT,
        samples         TEXT
      );

      CREATE TABLE IF NOT EXISTS stalker_alerts (
        id              TEXT PRIMARY KEY,
        device_id       TEXT NOT NULL,
        device_name     TEXT,
        tracker_type    TEXT,
        tracker_brand   TEXT,
        confidence      TEXT NOT NULL DEFAULT 'medium',
        first_seen      INTEGER NOT NULL,
        last_seen       INTEGER NOT NULL,
        duration_ms     INTEGER NOT NULL,
        sighting_count  INTEGER NOT NULL,
        avg_rssi        REAL,
        created_at      INTEGER NOT NULL,
        dismissed       INTEGER NOT NULL DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_stalker_alerts_device ON stalker_alerts(device_id);
      CREATE INDEX IF NOT EXISTS idx_stalker_alerts_created ON stalker_alerts(created_at);

      CREATE TABLE IF NOT EXISTS trusted_devices (
        id          TEXT PRIMARY KEY,
        device_id   TEXT NOT NULL UNIQUE,
        device_name TEXT,
        added_at    INTEGER NOT NULL
      );
    `);
  }

  getDb(): SQLite.SQLiteDatabase {
    if (!this.db) throw new Error("Database not initialized");
    return this.db;
  }

  // The native SQLite handle can be invalidated by the OS after the app
  // is backgrounded or after certain lifecycle events, while the JS
  // reference stays truthy. The next query then rejects with
  // `NativeDatabase.prepareAsync` / NullPointerException. Detect that,
  // drop the dead handle, reopen, and retry the operation once.
  private isStaleConnectionError(err: unknown): boolean {
    const msg = err instanceof Error ? err.message : String(err);
    return (
      msg.includes("NullPointerException") ||
      msg.includes("prepareAsync") ||
      msg.includes("Database not initialized") ||
      msg.includes("closed") ||
      msg.includes("finalized")
    );
  }

  private async withRetry<T>(
    op: (db: SQLite.SQLiteDatabase) => Promise<T>,
  ): Promise<T> {
    try {
      return await op(this.getDb());
    } catch (err) {
      if (!this.isStaleConnectionError(err)) throw err;
      this.db = null;

      await this.initialize();
      return op(this.getDb());
    }
  }

  async execute(sql: string, params: BindValue[] = []): Promise<void> {
    await this.withRetry((db) => db.runAsync(sql, params));
  }

  async query<T>(sql: string, params: BindValue[] = []): Promise<T[]> {
    return this.withRetry((db) => db.getAllAsync(sql, params) as Promise<T[]>);
  }

  async getFirst<T>(sql: string, params: BindValue[] = []): Promise<T | null> {
    const row = await this.withRetry((db) => db.getFirstAsync(sql, params));
    return (row as T) ?? null;
  }

  close(): void {
    if (this.db) {
      this.db.closeAsync();
      this.db = null;
    }
  }
}

const databaseService = new DatabaseService();

// Simple UUID v4 generator (no external dependency needed)
function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });
}

export { databaseService, generateId };
