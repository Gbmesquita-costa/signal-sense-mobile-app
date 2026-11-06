import {
  clearKalmanState,
  formatDistance,
  formatRssi,
  rssiToDistance,
  rssiToLevel,
} from "../rssi.converter";

describe("rssi.converter", () => {
  beforeEach(() => clearKalmanState("test"));

  it("maps RSSI to proximity levels", () => {
    const thresholds = { near: -60, medium: -75 };

    expect(rssiToLevel(-50, thresholds)).toBe("near");
    expect(rssiToLevel(-60, thresholds)).toBe("near");
    expect(rssiToLevel(-70, thresholds)).toBe("medium");
    expect(rssiToLevel(-90, thresholds)).toBe("far");
  });

  it("returns -1 for invalid (zero or positive) RSSI", () => {
    expect(rssiToDistance(0, -59, 3)).toBe(-1);
    expect(rssiToDistance(5, -59, 3)).toBe(-1);
  });

  it("produces a bounded estimate that grows as the signal weakens", () => {
    const near = rssiToDistance(-55, -59, 3);
    clearKalmanState("test");
    const far = rssiToDistance(-90, -59, 3);

    expect(near).toBeGreaterThan(0);
    expect(far).toBeGreaterThan(near);
    expect(far).toBeLessThanOrEqual(100);
  });

  it("smooths consecutive outputs instead of jumping", () => {
    const first = rssiToDistance(-60, -59, 3);
    const second = rssiToDistance(-90, -59, 3);
    clearKalmanState("test");
    const unsmoothed = rssiToDistance(-90, -59, 3);

    expect(second).toBeGreaterThan(first);
    expect(second).toBeLessThan(unsmoothed);
  });

  it("formats distance and RSSI for display", () => {
    expect(formatDistance(null)).toBe("—");
    expect(formatDistance(-1)).toBe("—");
    expect(formatDistance(0.42)).toBe("42 cm");
    expect(formatDistance(3.456)).toBe("3.5 m");
    expect(formatDistance(23.6)).toBe("24 m");
    expect(formatRssi(-67)).toBe("-67 dBm");
  });
});
