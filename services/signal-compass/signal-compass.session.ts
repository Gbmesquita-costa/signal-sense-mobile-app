/**
 * SignalCompassSession
 *
 * Wires the pure algorithms in domain/signal-compass to the phone: device
 * motion (camera pose + steps) and Wi-Fi scans of one target BSSID.
 *
 *  - Every motion event updates the camera pose and, with the current
 *    estimate, the bearing the overlay should point at. Steps move the user
 *    by dead reckoning, so the bearing keeps following the user between
 *    scans.
 *  - Wi-Fi is polled every few seconds. A fresh scan (startScan) is
 *    requested only when ScanBudget allows it (Android 9+: 4 per 2 minutes
 *    in the foreground); otherwise the cached results are read. A result
 *    whose ScanResult timestamp has not changed is the same old scan and is
 *    not fused again.
 *
 * No connection to the network is needed: scan results list every access
 * point in range. Location permission and Location services still are.
 */

import { DeviceMotion, type DeviceMotionMeasurement } from "expo-sensors";

import {
  type BearingEstimate,
  BearingEstimator,
  type CameraPose,
  cameraPoseFromRotation,
  DeadReckoning,
  type RandomSource,
  RssiKalmanFilter,
  StepDetector,
} from "@/domain/signal-compass";
import { ScanBudget } from "@/services/wifi/scan-budget";
import { wifiService } from "@/services/wifi/wifi.service";
import type { WifiNetwork } from "@/services/wifi/wifi.types";

type CompassStatus = "waiting" | "calibrating" | "tracking" | "lost";

interface CompassSnapshot {
  status: CompassStatus;
  estimate: BearingEstimate | null;
  /** Kalman-filtered RSSI of the target, dBm. */
  rssi: number | null;
  steps: number;
}

interface CompassPose extends CameraPose {
  /** Bearing to the estimated source from the current position, or null. */
  bearing: number | null;
}

interface SessionCallbacks {
  /** Every motion event (~30 Hz). Keep it cheap: no React state here. */
  onPose?: (pose: CompassPose) => void;
  /** After a new reading, a step, or a status change. */
  onSnapshot?: (snapshot: CompassSnapshot) => void;
  /** When the filtered signal rose noticeably since the last notification. */
  onCloser?: (rssi: number) => void;
}

interface SessionDeps {
  loadCached: () => Promise<WifiNetwork[]>;
  requestFresh: () => Promise<WifiNetwork[] | null>;
  now: () => number;
  budget: ScanBudget;
  random?: RandomSource;
  pollIntervalMs: number;
  /** No new reading for this long means the signal is lost. */
  lostAfterMs: number;
}

/** Confidence above which the direction is shown as tracked. */
const TRACKING_CONFIDENCE = 0.35;
/** Filtered RSSI rise (dB) that counts as "closer" for haptics. */
const CLOSER_STEP_DB = 3;
const MOTION_INTERVAL_MS = 33;

const defaultDeps = (): SessionDeps => ({
  loadCached: () => wifiService.scanNearbyNetworks(),
  requestFresh: () => wifiService.requestFreshScan(),
  now: () => Date.now(),
  budget: new ScanBudget(),
  pollIntervalMs: 3_000,
  // Throttled scans can be 30 s apart; allow for one missed scan on top.
  lostAfterMs: 75_000,
});

class SignalCompassSession {
  private readonly bssid: string;
  private readonly deps: SessionDeps;

  private readonly estimator: BearingEstimator;
  private readonly walker = new DeadReckoning();
  private readonly steps = new StepDetector();
  private readonly kalman = new RssiKalmanFilter();

  private pose: CameraPose = { heading: 0, pitch: 0, walkingHeading: 0 };
  private estimate: BearingEstimate | null = null;
  private status: CompassStatus = "waiting";

  private lastTimestamp: number | undefined;
  private lastReadingAt: number | null = null;
  private notifiedRssi: number | null = null;

  private motion: ReturnType<typeof DeviceMotion.addListener> | null = null;
  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  private polling = false;

  constructor(
    bssid: string,
    private readonly callbacks: SessionCallbacks = {},
    deps: Partial<SessionDeps> = {},
  ) {
    this.bssid = bssid.toUpperCase();
    this.deps = { ...defaultDeps(), ...deps };
    this.estimator = new BearingEstimator(
      this.deps.random ? { random: this.deps.random } : {},
    );
  }

  start(): void {
    if (this.running) return;
    this.running = true;

    DeviceMotion.setUpdateInterval(MOTION_INTERVAL_MS);
    this.motion = DeviceMotion.addListener((m) => this.handleMotion(m));

    void this.pollLoop();
  }

  stop(): void {
    this.running = false;
    this.motion?.remove();
    this.motion = null;

    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  handleMotion(
    m: Pick<DeviceMotionMeasurement, "rotation" | "acceleration">,
  ): void {
    // Android omits `rotation` until the rotation vector sensor reports.
    if (m.rotation) this.pose = cameraPoseFromRotation(m.rotation);

    if (m.acceleration) {
      const stepped = this.steps.push({
        x: m.acceleration.x,
        y: m.acceleration.y,
        z: m.acceleration.z,
        timestampMs: m.acceleration.timestamp * 1000,
      });

      if (stepped) {
        this.walker.step(this.pose.walkingHeading);
        if (this.estimate) this.refreshEstimate();
        this.emitSnapshot();
      }
    }

    this.callbacks.onPose?.({
      ...this.pose,
      bearing: this.estimate ? this.estimate.bearing : null,
    });
  }

  /** One scan cycle. Public so tests can drive it without timers. */
  async poll(): Promise<void> {
    if (this.polling) return;
    this.polling = true;

    try {
      const now = this.deps.now();
      let networks: WifiNetwork[] | null = null;

      if (this.deps.budget.canScan(now)) {
        this.deps.budget.record(now);
        networks = await this.deps.requestFresh();
      }
      networks ??= await this.deps.loadCached();

      const match = networks.find((n) => n.bssid.toUpperCase() === this.bssid);
      const isNew =
        match !== undefined &&
        (match.timestamp === undefined ||
          match.timestamp !== this.lastTimestamp);

      if (match && isNew) {
        this.lastTimestamp = match.timestamp;
        this.addReading(match.rssi, this.deps.now());
      } else if (
        this.lastReadingAt !== null &&
        this.deps.now() - this.lastReadingAt > this.deps.lostAfterMs &&
        this.status !== "lost"
      ) {
        this.status = "lost";
        this.emitSnapshot();
      }
    } catch {
      // A failed scan is not fatal; the next cycle tries again.
    } finally {
      this.polling = false;
    }
  }

  private async pollLoop(): Promise<void> {
    if (!this.running) return;
    await this.poll();
    if (!this.running) return;
    this.pollTimer = setTimeout(
      () => void this.pollLoop(),
      this.deps.pollIntervalMs,
    );
  }

  private addReading(rawRssi: number, now: number): void {
    this.lastReadingAt = now;
    this.estimator.addReading(rawRssi, this.walker.position);

    const filtered = this.kalman.update(rawRssi, now);
    if (this.notifiedRssi === null) {
      this.notifiedRssi = filtered;
    } else if (filtered >= this.notifiedRssi + CLOSER_STEP_DB) {
      this.notifiedRssi = filtered;
      this.callbacks.onCloser?.(filtered);
    } else if (filtered < this.notifiedRssi - CLOSER_STEP_DB) {
      // Walking away lowers the bar so coming back is noticed again.
      this.notifiedRssi = filtered;
    }

    this.refreshEstimate();
    this.emitSnapshot();
  }

  private refreshEstimate(): void {
    this.estimate = this.estimator.estimate(this.walker.position);
    this.status =
      this.estimate.confidence >= TRACKING_CONFIDENCE
        ? "tracking"
        : "calibrating";
  }

  private emitSnapshot(): void {
    this.callbacks.onSnapshot?.({
      status: this.status,
      estimate: this.estimate,
      rssi: this.kalman.value,
      steps: this.steps.steps,
    });
  }
}

export {
  type CompassPose,
  type CompassSnapshot,
  type CompassStatus,
  type SessionCallbacks,
  type SessionDeps,
  SignalCompassSession,
  TRACKING_CONFIDENCE,
};
