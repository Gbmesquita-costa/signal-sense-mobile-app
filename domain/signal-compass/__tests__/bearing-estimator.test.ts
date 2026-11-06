import { angleDifference, bearingOf } from "../angles";
import {
  BearingEstimator,
  bearingError,
  CALIBRATION_BASELINE_M,
} from "../bearing-estimator";
import { DeadReckoning, type Position } from "../dead-reckoning";
import { createRandom, gaussian } from "../random";

interface WalkOptions {
  source: Position;
  txPower: number;
  /** Path-loss exponent of the simulated room (the estimator assumes 2.5). */
  exponent: number;
  noiseDb: number;
  /** Walking headings, one per step. */
  headings: number[];
  /** A Wi-Fi scan result arrives every N steps. */
  readingEvery: number;
  seed: number;
}

interface WalkResult {
  errors: number[];
  confidences: number[];
  finalDistanceError: number;
}

function simulateWalk(options: WalkOptions): WalkResult {
  const noise = createRandom(options.seed);
  const estimator = new BearingEstimator({
    random: createRandom(options.seed + 1000),
  });
  const walker = new DeadReckoning();

  const errors: number[] = [];
  const confidences: number[] = [];

  const read = () => {
    const at = walker.position;
    const distance = Math.hypot(
      options.source.x - at.x,
      options.source.y - at.y,
    );
    const rssi =
      options.txPower -
      10 * options.exponent * Math.log10(Math.max(0.5, distance)) +
      options.noiseDb * gaussian(noise);

    estimator.addReading(rssi, at);

    const estimate = estimator.estimate(at);
    const truth = bearingOf(options.source.x - at.x, options.source.y - at.y);
    errors.push(bearingError(estimate.bearing, truth));
    confidences.push(estimate.confidence);
  };

  read();
  options.headings.forEach((heading, i) => {
    walker.step(heading);
    if ((i + 1) % options.readingEvery === 0) read();
  });

  const at = walker.position;
  const finalEstimate = estimator.estimate(at);
  const trueDistance = Math.hypot(
    options.source.x - at.x,
    options.source.y - at.y,
  );

  return {
    errors,
    confidences,
    finalDistanceError: Math.abs(finalEstimate.distance - trueDistance),
  };
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// L-shaped walk: 10 steps east, then 10 steps north (~7 m each leg).
const L_WALK = [...Array(10).fill(90), ...Array(10).fill(0)];

const SOURCES: Position[] = [
  { x: 6, y: 12 },
  { x: -8, y: 5 },
  { x: 10, y: -4 },
  { x: -3, y: -9 },
];

/** 4 source positions x 5 seeds, a scan every 2 steps along the L walk. */
function runMany(room: { exponent: number; noiseDb: number }): WalkResult[] {
  return SOURCES.flatMap((source, s) =>
    Array.from({ length: 5 }, (_, seed) =>
      simulateWalk({
        source,
        txPower: -42,
        exponent: room.exponent,
        noiseDb: room.noiseDb,
        headings: L_WALK,
        readingEvery: 2,
        seed: 100 * s + seed,
      }),
    ),
  );
}

describe("BearingEstimator", () => {
  it("does not claim a direction before the user has moved", () => {
    const estimator = new BearingEstimator({ random: createRandom(1) });
    const here = { x: 0, y: 0 };

    for (let i = 0; i < 5; i++) estimator.addReading(-60, here);

    const estimate = estimator.estimate(here);
    expect(estimate.baseline).toBe(0);
    expect(estimate.confidence).toBe(0);
    expect(estimate.readings).toBe(5);
  });

  it("shrinks the bearing error as the user walks an L-shaped path", () => {
    const runs = runMany({ exponent: 2.5, noiseDb: 4 });

    const afterFirstSteps = median(runs.map((r) => r.errors[1]));
    const atEnd = median(runs.map((r) => r.errors[r.errors.length - 1]));

    expect(atEnd).toBeLessThan(afterFirstSteps);
    expect(atEnd).toBeLessThan(30);

    expect(runs.every((r) => r.confidences[0] === 0)).toBe(true);
    expect(
      median(runs.map((r) => r.confidences[r.confidences.length - 1])),
    ).toBeGreaterThan(0.4);
  });

  it("stays useful when the room attenuates more than the model assumes", () => {
    // Exponent 2.9 against the assumed 2.5, and noisier readings.
    const runs = runMany({ exponent: 2.9, noiseDb: 5 });
    const finalErrors = runs.map((r) => r.errors[r.errors.length - 1]);

    expect(median(finalErrors)).toBeLessThan(30);
    const within45 = finalErrors.filter((e) => e < 45).length;
    expect(within45 / finalErrors.length).toBeGreaterThanOrEqual(0.85);
  });

  it("estimates the distance to within a few metres after the walk", () => {
    const runs = runMany({ exponent: 2.5, noiseDb: 3 });
    expect(median(runs.map((r) => r.finalDistanceError))).toBeLessThan(5);
  });

  it("updates the bearing from dead reckoning between readings", () => {
    const estimator = new BearingEstimator({ random: createRandom(5) });
    const walker = new DeadReckoning();
    const source = { x: 6, y: 12 };
    const noise = createRandom(9);

    const read = () => {
      const at = walker.position;
      const d = Math.hypot(source.x - at.x, source.y - at.y);
      estimator.addReading(-40 - 25 * Math.log10(d) + 3 * gaussian(noise), at);
    };

    read();
    L_WALK.forEach((heading, i) => {
      walker.step(heading);
      if (i % 2 === 1) read();
    });

    const before = walker.position;
    const bearingBefore = estimator.estimate(before).bearing;
    const truthBefore = bearingOf(source.x - before.x, source.y - before.y);

    // Walk west without any new scan: the estimated bearing must swing the
    // way the true bearing does, not stay frozen at the last reading.
    for (let i = 0; i < 6; i++) walker.step(270);
    const after = walker.position;
    const bearingAfter = estimator.estimate(after).bearing;
    const truthAfter = bearingOf(source.x - after.x, source.y - after.y);

    const estimatedSwing = angleDifference(bearingAfter, bearingBefore);
    const trueSwing = angleDifference(truthAfter, truthBefore);
    expect(Math.abs(trueSwing)).toBeGreaterThan(20);
    expect(Math.sign(estimatedSwing)).toBe(Math.sign(trueSwing));
    expect(Math.abs(estimatedSwing - trueSwing)).toBeLessThan(20);
  });

  it("scales confidence by the walked baseline", () => {
    const estimator = new BearingEstimator({ random: createRandom(2) });
    estimator.addReading(-55, { x: 0, y: 0 });
    estimator.addReading(-54, { x: CALIBRATION_BASELINE_M / 2, y: 0 });

    const estimate = estimator.estimate({
      x: CALIBRATION_BASELINE_M / 2,
      y: 0,
    });
    expect(estimate.baseline).toBeCloseTo(CALIBRATION_BASELINE_M / 2);
    expect(estimate.confidence).toBeLessThanOrEqual(0.5);
  });

  it("recovers instead of producing NaN after an impossible reading", () => {
    const estimator = new BearingEstimator({
      random: createRandom(4),
      particleCount: 50,
    });
    estimator.addReading(-40, { x: 0, y: 0 });
    estimator.addReading(+400, { x: 1, y: 0 });

    const estimate = estimator.estimate({ x: 1, y: 0 });
    expect(Number.isFinite(estimate.bearing)).toBe(true);
    expect(Number.isFinite(estimate.distance)).toBe(true);
  });

  it("resets readings and baseline", () => {
    const estimator = new BearingEstimator({ random: createRandom(6) });
    estimator.addReading(-50, { x: 0, y: 0 });
    estimator.addReading(-48, { x: 5, y: 0 });
    estimator.reset();

    const estimate = estimator.estimate({ x: 0, y: 0 });
    expect(estimate.readings).toBe(0);
    expect(estimate.baseline).toBe(0);
    expect(estimate.confidence).toBe(0);
  });
});
