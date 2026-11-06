import { stalkerDetectionService } from "../stalker.detection";

const MINUTE = 60 * 1000;

const device = (rssi = -60) => ({
  id: "ble_AA:BB:CC:DD:EE:FF",
  name: null,
  localName: null,
  rssi,
  manufacturerData: null,
  serviceUUIDs: null,
});

describe("stalkerDetectionService", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-01T12:00:00Z"));

    stalkerDetectionService.reset();
    stalkerDetectionService.setConfig({
      timeWindowMs: 15 * MINUTE,
      minSightings: 3,
      rssiThreshold: -85,
      dismissCooldownMs: 30 * MINUTE,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /** Feeds one sighting per `stepMs` and returns the last result. */
  const follow = (count: number, stepMs: number, rssi?: number) => {
    let result = null;
    for (let i = 0; i < count; i++) {
      result = stalkerDetectionService.processDevice(device(rssi));
      jest.advanceTimersByTime(stepMs);
    }
    return result;
  };

  /** Like `follow`, but reports whether any of the sightings alerted. */
  const followAlerts = (count: number, stepMs: number) => {
    let alerted = false;
    for (let i = 0; i < count; i++) {
      if (stalkerDetectionService.processDevice(device())) alerted = true;
      jest.advanceTimersByTime(stepMs);
    }
    return alerted;
  };

  it("does not alert before the time window has elapsed", () => {
    expect(follow(10, MINUTE)).toBeNull();
  });

  it("alerts once a device has followed the user for the full window", () => {
    follow(15, MINUTE);
    const alert = stalkerDetectionService.processDevice(device());

    expect(alert).not.toBeNull();
    expect(alert?.deviceId).toBe(device().id);
    expect(alert?.durationMs).toBeGreaterThanOrEqual(15 * MINUTE);
  });

  it("ignores devices whose signal is too weak", () => {
    follow(16, MINUTE, -95);
    expect(stalkerDetectionService.processDevice(device(-95))).toBeNull();
  });

  it("does not alert twice for the same device until the cooldown passes", () => {
    follow(15, MINUTE);
    expect(stalkerDetectionService.processDevice(device())).not.toBeNull();
    expect(stalkerDetectionService.processDevice(device())).toBeNull();

    stalkerDetectionService.markDismissed(device().id);

    // Still following during the whole cooldown: no alert until it ends.
    expect(follow(30, MINUTE)).toBeNull();
    expect(stalkerDetectionService.processDevice(device())).not.toBeNull();
  });

  it("needs a full window again after the device was gone for a while", () => {
    follow(15, MINUTE);
    expect(stalkerDetectionService.processDevice(device())).not.toBeNull();

    stalkerDetectionService.markDismissed(device().id);
    jest.advanceTimersByTime(31 * MINUTE);

    // Back after a long absence: a fresh encounter, not 46 minutes of following.
    expect(followAlerts(5, MINUTE)).toBe(false);
    expect(followAlerts(11, MINUTE)).toBe(true);
  });

  it("does not alert for a device seen once long ago and briefly again now", () => {
    stalkerDetectionService.processDevice(device());
    jest.advanceTimersByTime(3 * 60 * MINUTE);

    expect(followAlerts(5, 10 * 1000)).toBe(false);
  });
});
