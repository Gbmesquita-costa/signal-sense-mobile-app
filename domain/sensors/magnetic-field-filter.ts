/**
 * Magnetic field filter pipeline.
 *
 * Raw magnetometer samples are noisy (±1-3 µT), contain isolated spikes and,
 * when the phone is waved around, swing in magnitude because of uncalibrated
 * hard-iron offsets. Per sample the pipeline does:
 *
 * 1. Drop non-finite samples.
 * 2. Estimate motion from how fast the raw field vector rotates (rad/s).
 *    Rotation changes the axes but not the true field strength.
 * 3. Reject magnitude outliers with a Hampel gate (single-sample spikes).
 * 4. Median of the last few accepted samples, per axis and for magnitude.
 * 5. Time-constant EMA. Magnitude is smoothed more while the phone moves
 *    (swings are mostly orientation artifacts) and less while it is still,
 *    so a real change such as an approaching magnet shows up quickly.
 *
 * Magnitude is filtered as its own scalar instead of being recomputed from
 * the smoothed axes: averaging a rotating vector shortens it, which would
 * make the reading drop every time the phone turns.
 *
 * Pure TypeScript, no React or native imports.
 */

import { TimeConstantEma } from "./ema";
import { RollingWindow } from "./median";
import { OutlierGate, type OutlierGateOptions } from "./outlier";

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface MagneticSample extends Vector3 {
  /** Sample time in milliseconds. */
  timestampMs: number;
}

interface FilteredMagneticSample extends Vector3 {
  /** Filtered field strength in µT. */
  magnitude: number;
  /** 0 when the phone is still, 1 at or above `motionFullScale`. */
  motion: number;
  /** True when this sample was rejected and the previous output is repeated. */
  rejected: boolean;
}

interface MagneticFieldFilterOptions {
  /** Median window (samples) applied after outlier rejection. */
  medianWindow: number;
  /** Axis smoothing time constant (s). */
  axisTau: number;
  /** Magnitude smoothing time constant while still (s). */
  magnitudeTauStill: number;
  /** Magnitude smoothing time constant while moving (s). */
  magnitudeTauMoving: number;
  /** Rotation rate (rad/s) treated as full motion. */
  motionFullScale: number;
  /** Smoothing of the motion estimate itself (s). */
  motionTau: number;
  /** dt used for the first sample and to clamp gaps (s). */
  defaultDt: number;
  maxDt: number;
  outlier: Partial<OutlierGateOptions>;
}

const DEFAULT_MAGNETIC_FILTER_OPTIONS: MagneticFieldFilterOptions = {
  medianWindow: 5,
  axisTau: 0.1,
  magnitudeTauStill: 0.15,
  magnitudeTauMoving: 0.6,
  motionFullScale: 3,
  motionTau: 0.25,
  defaultDt: 0.05,
  maxDt: 0.5,
  outlier: {},
};

function vectorLength(v: Vector3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

/** Angle between two vectors in radians (0 when either is zero-length). */
function angleBetween(a: Vector3, b: Vector3): number {
  const la = vectorLength(a);
  const lb = vectorLength(b);
  if (la === 0 || lb === 0) return 0;

  const cos = (a.x * b.x + a.y * b.y + a.z * b.z) / (la * lb);
  return Math.acos(Math.min(1, Math.max(-1, cos)));
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

class MagneticFieldFilter {
  private readonly options: MagneticFieldFilterOptions;
  private readonly gate: OutlierGate;

  private readonly windows: Record<"x" | "y" | "z" | "magnitude", RollingWindow>;
  private readonly emas: Record<"x" | "y" | "z" | "magnitude", TimeConstantEma>;
  private readonly motionEma = new TimeConstantEma();

  private lastRaw: Vector3 | null = null;
  private lastTimestampMs: number | null = null;
  private lastOutput: FilteredMagneticSample | null = null;

  constructor(options: Partial<MagneticFieldFilterOptions> = {}) {
    this.options = { ...DEFAULT_MAGNETIC_FILTER_OPTIONS, ...options };
    this.gate = new OutlierGate(this.options.outlier);

    const size = this.options.medianWindow;
    this.windows = {
      x: new RollingWindow(size),
      y: new RollingWindow(size),
      z: new RollingWindow(size),
      magnitude: new RollingWindow(size),
    };
    this.emas = {
      x: new TimeConstantEma(),
      y: new TimeConstantEma(),
      z: new TimeConstantEma(),
      magnitude: new TimeConstantEma(),
    };
  }

  /**
   * Feeds one raw sample. Returns the filtered sample, or null when nothing
   * valid has been seen yet.
   */
  push(sample: MagneticSample): FilteredMagneticSample | null {
    const { x, y, z, timestampMs } = sample;
    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      !Number.isFinite(z) ||
      !Number.isFinite(timestampMs)
    ) {
      return this.repeatLast();
    }

    const o = this.options;
    const dt =
      this.lastTimestampMs === null
        ? o.defaultDt
        : Math.min(o.maxDt, Math.max(0, (timestampMs - this.lastTimestampMs) / 1000));
    this.lastTimestampMs = timestampMs;

    // Motion: rotation rate of the raw vector, smoothed.
    const raw = { x, y, z };
    const rotationRate =
      this.lastRaw && dt > 0 ? angleBetween(this.lastRaw, raw) / dt : 0;
    this.lastRaw = raw;
    const motion = clamp01(
      this.motionEma.update(rotationRate, dt, o.motionTau) / o.motionFullScale,
    );

    const rawMagnitude = vectorLength(raw);
    if (!this.gate.accept(rawMagnitude)) {
      return this.repeatLast(motion);
    }

    this.windows.x.push(x);
    this.windows.y.push(y);
    this.windows.z.push(z);
    this.windows.magnitude.push(rawMagnitude);

    const magnitudeTau =
      o.magnitudeTauStill + (o.magnitudeTauMoving - o.magnitudeTauStill) * motion;

    this.lastOutput = {
      x: this.emas.x.update(this.windows.x.median(), dt, o.axisTau),
      y: this.emas.y.update(this.windows.y.median(), dt, o.axisTau),
      z: this.emas.z.update(this.windows.z.median(), dt, o.axisTau),
      magnitude: this.emas.magnitude.update(
        this.windows.magnitude.median(),
        dt,
        magnitudeTau,
      ),
      motion,
      rejected: false,
    };

    return this.lastOutput;
  }

  reset(): void {
    this.gate.reset();
    this.motionEma.reset();
    for (const key of ["x", "y", "z", "magnitude"] as const) {
      this.windows[key].clear();
      this.emas[key].reset();
    }
    this.lastRaw = null;
    this.lastTimestampMs = null;
    this.lastOutput = null;
  }

  private repeatLast(motion?: number): FilteredMagneticSample | null {
    if (!this.lastOutput) return null;
    return {
      ...this.lastOutput,
      motion: motion ?? this.lastOutput.motion,
      rejected: true,
    };
  }
}

export {
  angleBetween,
  DEFAULT_MAGNETIC_FILTER_OPTIONS,
  FilteredMagneticSample,
  MagneticFieldFilter,
  MagneticFieldFilterOptions,
  MagneticSample,
  Vector3,
  vectorLength,
};
