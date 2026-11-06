/**
 * Bearing estimator for a stationary radio source (a Wi-Fi access point or
 * a BLE beacon), using a particle filter over the log-distance path-loss
 * model:
 *
 *   rssi = txPower - 10 * n * log10(distance)
 *
 * Each particle is a hypothesis (source x, source y, txPower). Every RSSI
 * reading is scored against each hypothesis from the position the user was
 * at when it arrived (pedestrian dead reckoning), so the estimate only gains
 * a direction once the user has moved: from a single spot every point on a
 * circle explains the reading equally well. Confidence reflects that.
 *
 * Between readings nothing is learned, but the bearing is always computed
 * from the user's current position, so walking and turning keep the arrow
 * pointing at the estimated source while waiting for the next scan.
 *
 * Everything here is an estimate. Multipath, walls and body shadowing break
 * the model; the UI must say so.
 */

import { angleDifference, bearingOf, toRadians } from "./angles";
import type { Position } from "./dead-reckoning";
import { createRandom, gaussian, type RandomSource } from "./random";

interface BearingEstimatorOptions {
  particleCount?: number;
  /** Radius (m) around the start point where the source may be. */
  searchRadius?: number;
  /** Path-loss exponent: ~2 free space, 2.5-3.5 indoors. */
  pathLossExponent?: number;
  /** Standard deviation (dB) of a single reading around the model. */
  rssiSigma?: number;
  /** Range of the RSSI at 1 m considered plausible (dBm). */
  txPowerRange?: [number, number];
  random?: RandomSource;
}

interface BearingEstimate {
  /** Compass bearing from the user to the estimated source, degrees. */
  bearing: number;
  /** Estimated distance to the source, metres (weighted median). */
  distance: number;
  /**
   * 0..1: how concentrated the hypotheses are in one direction, scaled
   * down until the user has walked far enough to resolve the direction.
   */
  confidence: number;
  /** Largest distance (m) between any two reading positions. */
  baseline: number;
  /** Number of RSSI readings fused so far. */
  readings: number;
}

interface Particle {
  x: number;
  y: number;
  txPower: number;
  weight: number;
}

/** Baseline (m) after which the direction is considered resolvable. */
const CALIBRATION_BASELINE_M = 3;
const MIN_DISTANCE_M = 0.5;

class BearingEstimator {
  private particles: Particle[] = [];
  private readingPositions: Position[] = [];
  private baselineMeters = 0;

  private readonly particleCount: number;
  private readonly searchRadius: number;
  private readonly pathLossExponent: number;
  private readonly rssiSigma: number;
  private readonly txPowerRange: [number, number];
  private readonly random: RandomSource;

  constructor(options: BearingEstimatorOptions = {}) {
    this.particleCount = options.particleCount ?? 600;
    this.searchRadius = options.searchRadius ?? 30;
    this.pathLossExponent = options.pathLossExponent ?? 2.5;
    this.rssiSigma = options.rssiSigma ?? 5;
    this.txPowerRange = options.txPowerRange ?? [-50, -30];
    this.random = options.random ?? createRandom(Date.now());
    this.reset();
  }

  /** Scores every hypothesis against one reading taken at `from`. */
  addReading(rssi: number, from: Position): void {
    const { pathLossExponent: n, rssiSigma: sigma } = this;

    if (this.readingPositions.length === 0) {
      // Seed the hypotheses on the ring the first reading allows, instead of
      // spreading them over the whole search disc where most would be wasted.
      this.scatterAround(rssi, from);
    }

    let total = 0;
    for (const p of this.particles) {
      const distance = Math.max(
        MIN_DISTANCE_M,
        Math.hypot(p.x - from.x, p.y - from.y),
      );
      const predicted = p.txPower - 10 * n * Math.log10(distance);
      const z = (rssi - predicted) / sigma;
      p.weight *= Math.exp(-0.5 * z * z);
      total += p.weight;
    }

    if (total <= 0 || !Number.isFinite(total)) {
      // The reading contradicts every hypothesis (e.g. the source moved):
      // start over around this reading instead of dividing by zero.
      this.scatterAround(rssi, from);
    } else {
      for (const p of this.particles) p.weight /= total;
      if (this.effectiveSampleSize() < this.particleCount / 2) this.resample();
    }

    this.trackBaseline(from);
  }

  /** Current estimate as seen from the user's position `at`. */
  estimate(at: Position): BearingEstimate {
    let sumSin = 0;
    let sumCos = 0;
    const distances: { d: number; w: number }[] = [];

    for (const p of this.particles) {
      const dx = p.x - at.x;
      const dy = p.y - at.y;
      const rad = toRadians(bearingOf(dx, dy));
      sumSin += p.weight * Math.sin(rad);
      sumCos += p.weight * Math.cos(rad);
      distances.push({ d: Math.hypot(dx, dy), w: p.weight });
    }

    const resultant = Math.min(1, Math.hypot(sumSin, sumCos));
    const bearing = bearingOf(sumSin, sumCos);
    const baselineFactor = Math.min(
      1,
      this.baselineMeters / CALIBRATION_BASELINE_M,
    );

    return {
      bearing,
      distance: weightedMedian(distances),
      confidence: resultant * baselineFactor,
      baseline: this.baselineMeters,
      readings: this.readingPositions.length,
    };
  }

  reset(): void {
    this.readingPositions = [];
    this.baselineMeters = 0;
    this.particles = [];
  }

  /**
   * Draws hypotheses consistent with one reading: a txPower from the prior,
   * the distance the model implies for it (with reading noise), and any
   * direction. Without movement this ring is all the reading can tell.
   */
  private scatterAround(rssi: number, from: Position): void {
    const [txMin, txMax] = this.txPowerRange;
    const n = this.pathLossExponent;
    const weight = 1 / this.particleCount;

    this.particles = Array.from({ length: this.particleCount }, () => {
      const txPower = txMin + (txMax - txMin) * this.random();
      const noisy = rssi + this.rssiSigma * gaussian(this.random);
      const distance = Math.max(
        MIN_DISTANCE_M,
        Math.min(this.searchRadius, 10 ** ((txPower - noisy) / (10 * n))),
      );
      const theta = 2 * Math.PI * this.random();
      return {
        x: from.x + distance * Math.sin(theta),
        y: from.y + distance * Math.cos(theta),
        txPower,
        weight,
      };
    });
  }

  private effectiveSampleSize(): number {
    let sumSquares = 0;
    for (const p of this.particles) sumSquares += p.weight * p.weight;
    return 1 / sumSquares;
  }

  /** Systematic resampling plus a small jitter to keep diversity. */
  private resample(): void {
    const count = this.particleCount;
    const step = 1 / count;
    const next: Particle[] = [];

    let target = this.random() * step;
    let cumulative = 0;
    let index = 0;

    for (let i = 0; i < count; i++) {
      while (
        index < count - 1 &&
        cumulative + this.particles[index].weight < target
      ) {
        cumulative += this.particles[index].weight;
        index++;
      }

      const source = this.particles[index];
      next.push({
        x: source.x + 0.3 * gaussian(this.random),
        y: source.y + 0.3 * gaussian(this.random),
        txPower: source.txPower + 0.5 * gaussian(this.random),
        weight: step,
      });
      target += step;
    }

    this.particles = next;
  }

  private trackBaseline(from: Position): void {
    for (const p of this.readingPositions) {
      const d = Math.hypot(p.x - from.x, p.y - from.y);
      if (d > this.baselineMeters) this.baselineMeters = d;
    }
    this.readingPositions.push({ x: from.x, y: from.y });
  }
}

function weightedMedian(values: { d: number; w: number }[]): number {
  const sorted = [...values].sort((a, b) => a.d - b.d);
  const total = sorted.reduce((sum, v) => sum + v.w, 0);

  let cumulative = 0;
  for (const v of sorted) {
    cumulative += v.w;
    if (cumulative >= total / 2) return v.d;
  }
  return sorted.length > 0 ? sorted[sorted.length - 1].d : 0;
}

/** Absolute angular error between two bearings, degrees [0, 180]. */
function bearingError(a: number, b: number): number {
  return Math.abs(angleDifference(a, b));
}

export {
  type BearingEstimate,
  BearingEstimator,
  type BearingEstimatorOptions,
  bearingError,
  CALIBRATION_BASELINE_M,
};
