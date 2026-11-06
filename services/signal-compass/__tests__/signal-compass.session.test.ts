import { bearingError, bearingOf, createRandom } from "@/domain/signal-compass";
import { ScanBudget } from "@/services/wifi/scan-budget";
import type { WifiNetwork } from "@/services/wifi/wifi.types";

import {
  type CompassSnapshot,
  SignalCompassSession,
} from "../signal-compass.session";

const BSSID = "aa:bb:cc:dd:ee:ff";

function network(rssi: number, timestamp?: number): WifiNetwork {
  return {
    ssid: "Target",
    bssid: BSSID.toUpperCase(),
    rssi,
    frequency: 2437,
    band: "2.4 GHz",
    channel: 6,
    security: "WPA2",
    isConnected: false,
    timestamp,
  };
}

// Upright phone, camera towards `azimuth` (DeviceMotion: alpha = -azimuth).
const facing = (azimuth: number) => ({
  alpha: (-azimuth * Math.PI) / 180,
  beta: Math.PI / 2,
  gamma: 0,
  timestamp: 0,
});

function setup(scans: {
  fresh?: () => WifiNetwork[] | null;
  cached: () => WifiNetwork[];
}) {
  let now = 0;
  const snapshots: CompassSnapshot[] = [];
  const onCloser = jest.fn();
  const requestFresh = jest.fn(async () =>
    scans.fresh ? scans.fresh() : null,
  );
  const loadCached = jest.fn(async () => scans.cached());

  const session = new SignalCompassSession(
    BSSID,
    { onSnapshot: (s) => snapshots.push(s), onCloser },
    {
      requestFresh,
      loadCached,
      now: () => now,
      budget: new ScanBudget(),
      random: createRandom(11),
      lostAfterMs: 60_000,
    },
  );

  return {
    session,
    snapshots,
    onCloser,
    requestFresh,
    loadCached,
    advance: (ms: number) => {
      now += ms;
    },
  };
}

/** Feeds one step: a linear-acceleration bump while facing `azimuth`. */
function step(
  session: SignalCompassSession,
  azimuth: number,
  tSeconds: number,
) {
  session.handleMotion({
    rotation: facing(azimuth),
    acceleration: { x: 0, y: 2.5, z: 0, timestamp: tSeconds },
  });
  session.handleMotion({
    rotation: facing(azimuth),
    acceleration: { x: 0, y: 0, z: 0, timestamp: tSeconds + 0.2 },
  });
}

describe("SignalCompassSession", () => {
  it("fuses a cached scan only once", async () => {
    const t = setup({ cached: () => [network(-60, 1000)] });

    await t.session.poll();
    await t.session.poll();
    await t.session.poll();

    const readings = t.snapshots.map((s) => s.estimate?.readings);
    expect(readings).toEqual([1]);
  });

  it("asks for fresh scans only within the throttling budget", async () => {
    let ts = 0;
    const t = setup({
      fresh: () => [network(-60, ++ts)],
      cached: () => [network(-60, ts)],
    });

    for (let i = 0; i < 40; i++) {
      await t.session.poll();
      t.advance(3_000); // two minutes in total
    }

    expect(t.requestFresh).toHaveBeenCalledTimes(4);
    expect(t.loadCached).toHaveBeenCalledTimes(36);
  });

  it("falls back to the cached list when the system refuses a scan", async () => {
    const t = setup({ fresh: () => null, cached: () => [network(-55, 7)] });
    await t.session.poll();

    expect(t.loadCached).toHaveBeenCalledTimes(1);
    expect(t.snapshots[0].estimate?.readings).toBe(1);
  });

  it("stays in calibration until the user walks", async () => {
    let ts = 0;
    const t = setup({ cached: () => [network(-60, ++ts)] });

    for (let i = 0; i < 5; i++) {
      await t.session.poll();
      t.advance(3_000);
    }

    expect(t.snapshots.at(-1)?.status).toBe("calibrating");
    expect(t.snapshots.at(-1)?.estimate?.confidence).toBe(0);
  });

  it("finds the direction of the access point on an L-shaped walk", async () => {
    const source = { x: -6, y: 8 };
    let pos = { x: 0, y: 0 };
    let ts = 0;
    let time = 0;

    const rssiAt = (p: { x: number; y: number }) =>
      Math.round(
        -40 - 25 * Math.log10(Math.hypot(source.x - p.x, source.y - p.y)),
      );
    const t = setup({ cached: () => [network(rssiAt(pos), ++ts)] });

    await t.session.poll();
    const headings = [...Array(10).fill(90), ...Array(10).fill(0)];
    for (const [i, heading] of headings.entries()) {
      step(t.session, heading, (time += 1));
      const rad = (heading * Math.PI) / 180;
      pos = { x: pos.x + 0.7 * Math.sin(rad), y: pos.y + 0.7 * Math.cos(rad) };
      if (i % 2 === 1) {
        t.advance(3_000);
        await t.session.poll();
      }
    }

    const last = t.snapshots.at(-1)!;
    expect(last.steps).toBe(20);
    expect(last.status).toBe("tracking");

    const truth = bearingOf(source.x - pos.x, source.y - pos.y);
    expect(bearingError(last.estimate!.bearing, truth)).toBeLessThan(35);
  });

  it("reports the signal as lost after a long silence", async () => {
    let visible = true;
    let ts = 0;
    const t = setup({
      cached: () => (visible ? [network(-60, ++ts)] : []),
    });

    await t.session.poll();
    visible = false;
    t.advance(61_000);
    await t.session.poll();

    expect(t.snapshots.at(-1)?.status).toBe("lost");
  });

  it("signals 'closer' when the filtered RSSI rises", async () => {
    let rssi = -75;
    let ts = 0;
    const t = setup({ cached: () => [network(rssi, ++ts)] });

    for (let i = 0; i < 10; i++) {
      await t.session.poll();
      t.advance(5_000);
      rssi += 3;
    }

    expect(t.onCloser).toHaveBeenCalled();
    const levels = t.onCloser.mock.calls.map(([v]) => v as number);
    expect([...levels].sort((a, b) => a - b)).toEqual(levels);
  });
});
