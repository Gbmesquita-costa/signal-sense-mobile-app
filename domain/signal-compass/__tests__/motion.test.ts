import {
  angleDifference,
  bearingOf,
  normalizeDegrees,
  toRadians,
} from "../angles";
import { DeadReckoning } from "../dead-reckoning";
import { RssiKalmanFilter } from "../kalman";
import { cameraPoseFromRotation } from "../orientation";
import { createRandom, gaussian } from "../random";
import { type LinearAcceleration, StepDetector } from "../step-detector";

describe("angles", () => {
  it("normalises and differences across the 0/360 seam", () => {
    expect(normalizeDegrees(-10)).toBe(350);
    expect(normalizeDegrees(725)).toBe(5);
    expect(angleDifference(10, 350)).toBe(20);
    expect(angleDifference(350, 10)).toBe(-20);
    expect(angleDifference(180, 0)).toBe(180);
  });

  it("computes compass bearings with x = east and y = north", () => {
    expect(bearingOf(0, 1)).toBe(0);
    expect(bearingOf(1, 0)).toBe(90);
    expect(bearingOf(0, -1)).toBe(180);
    expect(bearingOf(-1, 0)).toBe(270);
  });
});

describe("cameraPoseFromRotation", () => {
  // DeviceMotion reports alpha = -azimuth and beta = -pitch (radians).
  it("reads heading 0 and level for an upright phone facing north", () => {
    const pose = cameraPoseFromRotation({
      alpha: 0,
      beta: Math.PI / 2,
      gamma: 0,
    });
    expect(pose.heading).toBeCloseTo(0, 5);
    expect(pose.pitch).toBeCloseTo(0, 5);
    expect(pose.walkingHeading).toBeCloseTo(0, 5);
  });

  it("follows the azimuth when the user turns while holding the phone upright", () => {
    for (const azimuth of [45, 90, 200, 300]) {
      const pose = cameraPoseFromRotation({
        alpha: -toRadians(azimuth),
        beta: Math.PI / 2,
        gamma: 0,
      });
      expect(Math.abs(angleDifference(pose.heading, azimuth))).toBeLessThan(
        1e-6,
      );
    }
  });

  it("reports the camera tilt as pitch", () => {
    // Upright (beta 90 deg) tilted back by 20 deg: camera looks 20 deg up.
    const pose = cameraPoseFromRotation({
      alpha: 0,
      beta: toRadians(110),
      gamma: 0,
    });
    expect(pose.pitch).toBeCloseTo(20, 5);
    expect(pose.heading).toBeCloseTo(0, 5);
  });

  it("uses the top edge as walking direction when the phone is flat", () => {
    // Flat on the palm, top edge towards the east: camera points at the floor.
    const pose = cameraPoseFromRotation({
      alpha: -toRadians(90),
      beta: 0,
      gamma: 0,
    });
    expect(pose.pitch).toBeCloseTo(-90, 5);
    expect(pose.walkingHeading).toBeCloseTo(90, 5);
  });
});

describe("StepDetector", () => {
  /** Walking at `cadence` steps/s: one acceleration bump per step plus noise. */
  function walk(seconds: number, cadence: number, seed: number) {
    const random = createRandom(seed);
    const samples: LinearAcceleration[] = [];
    for (let t = 0; t < seconds * 1000; t += 20) {
      const phase = ((t / 1000) * cadence) % 1;
      const bump = phase < 0.25 ? 2.5 * Math.sin((phase / 0.25) * Math.PI) : 0;
      samples.push({
        x: 0.1 * gaussian(random),
        y: bump + 0.1 * gaussian(random),
        z: 0.1 * gaussian(random),
        timestampMs: t,
      });
    }
    return samples;
  }

  it("counts one step per footfall", () => {
    const detector = new StepDetector();
    walk(10, 1.8, 1).forEach((s) => detector.push(s));
    expect(detector.steps).toBe(18);
  });

  it("ignores a phone that is held still", () => {
    const detector = new StepDetector();
    const random = createRandom(2);
    for (let t = 0; t < 10_000; t += 20) {
      detector.push({
        x: 0.15 * gaussian(random),
        y: 0.15 * gaussian(random),
        z: 0.15 * gaussian(random),
        timestampMs: t,
      });
    }
    expect(detector.steps).toBe(0);
  });

  it("does not double count a long bump", () => {
    const detector = new StepDetector();
    for (let t = 0; t < 600; t += 20) {
      detector.push({ x: 0, y: 2, z: 0, timestampMs: t });
    }
    expect(detector.steps).toBe(1);
  });
});

describe("DeadReckoning", () => {
  it("moves one stride per step along the heading", () => {
    const walker = new DeadReckoning(1);
    walker.step(90);
    walker.step(0);
    expect(walker.position.x).toBeCloseTo(1);
    expect(walker.position.y).toBeCloseTo(1);

    walker.reset();
    expect(walker.position).toEqual({ x: 0, y: 0 });
  });
});

describe("RssiKalmanFilter", () => {
  it("reduces the noise of a steady signal", () => {
    const filter = new RssiKalmanFilter();
    const random = createRandom(3);
    const out: number[] = [];
    for (let i = 0; i < 100; i++) {
      out.push(filter.update(-60 + 5 * gaussian(random), i * 200));
    }
    const tail = out.slice(50);
    const spread = Math.max(...tail) - Math.min(...tail);
    expect(spread).toBeLessThan(8);
    expect(Math.abs(tail[tail.length - 1] + 60)).toBeLessThan(3);
  });

  it("trusts a reading more after a long gap", () => {
    const fast = new RssiKalmanFilter();
    const slow = new RssiKalmanFilter();
    for (let i = 0; i < 20; i++) {
      fast.update(-70, i * 100);
      slow.update(-70, i * 100);
    }
    const afterShortGap = fast.update(-50, 2000);
    const afterLongGap = slow.update(-50, 32_000);
    expect(afterLongGap).toBeGreaterThan(afterShortGap);
  });
});
