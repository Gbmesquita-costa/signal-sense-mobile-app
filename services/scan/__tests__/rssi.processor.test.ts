import { RssiProcessor } from "../rssi.processor";

describe("RssiProcessor", () => {
  const processor = new RssiProcessor({
    rssiHistorySize: 5,
    rssiSmoothingWindow: 3,
    rssiThresholds: { strong: -50, medium: -70 },
  });

  it("classifies strength against the configured thresholds", () => {
    expect(processor.classifyStrength(-40)).toBe("strong");
    expect(processor.classifyStrength(-50)).toBe("strong");
    expect(processor.classifyStrength(-65)).toBe("medium");
    expect(processor.classifyStrength(-90)).toBe("weak");
  });

  it("keeps a bounded history and smooths with an EMA", () => {
    let data = processor.createInitial(-60);

    for (const rssi of [-62, -64, -66, -68, -70]) {
      data = processor.update(data, rssi);
    }

    expect(data.history).toEqual([-62, -64, -66, -68, -70]);
    expect(data.raw).toBe(-70);
    // EMA over the last 3 samples (-66, -68, -70) with alpha = 0.5
    expect(data.smoothed).toBe(-68);
    expect(data.strength).toBe("medium");
  });

  it("maps RSSI to a clamped 0-100 percentage", () => {
    expect(processor.toPercentage(-100)).toBe(0);
    expect(processor.toPercentage(-30)).toBe(100);
    expect(processor.toPercentage(-65)).toBe(50);
    expect(processor.toPercentage(-150)).toBe(0);
    expect(processor.toPercentage(0)).toBe(100);
  });

  it("estimates ~1 m when RSSI equals TX power and -1 for unknown", () => {
    expect(processor.estimateDistance(-59, -59, 2)).toBe(1);
    expect(processor.estimateDistance(-79, -59, 2)).toBe(10);
    expect(processor.estimateDistance(0)).toBe(-1);
  });

  it("reports trend from older vs newer samples", () => {
    const base = processor.createInitial(-80);

    expect(processor.getTrend({ ...base, history: [-80, -80, -70, -70] })).toBe(
      "improving",
    );
    expect(processor.getTrend({ ...base, history: [-60, -60, -70, -70] })).toBe(
      "degrading",
    );
    expect(processor.getTrend({ ...base, history: [-60, -61] })).toBe("stable");
  });
});
