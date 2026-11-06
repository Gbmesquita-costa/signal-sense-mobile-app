import {
  angleBetween,
  type FilteredMagneticSample,
  MagneticFieldFilter,
  type MagneticSample,
} from "../magnetic-field-filter";

// Deterministic PRNG (mulberry32) so the noisy fixtures are reproducible.
function createRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(random: () => number): number {
  const u = Math.max(random(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
}

const DT_MS = 50;
const EARTH_FIELD = 45; // µT

/** Field of the given strength whose horizontal part points at `angle`. */
function sampleAt(
  i: number,
  angle: number,
  strength: number,
  noise: () => number,
  hardIron = { x: 0, y: 0, z: 0 },
): MagneticSample {
  const horizontal = strength * 0.6;
  return {
    x: horizontal * Math.cos(angle) + hardIron.x + noise(),
    y: horizontal * Math.sin(angle) + hardIron.y + noise(),
    z: strength * 0.8 + hardIron.z + noise(),
    timestampMs: i * DT_MS,
  };
}

function run(filter: MagneticFieldFilter, samples: MagneticSample[]) {
  return samples.map((s) => filter.push(s)) as FilteredMagneticSample[];
}

function rawMagnitude(s: MagneticSample): number {
  return Math.sqrt(s.x * s.x + s.y * s.y + s.z * s.z);
}

function stdDev(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(
    values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length,
  );
}

function peakToPeak(values: number[]): number {
  return Math.max(...values) - Math.min(...values);
}

describe("angleBetween", () => {
  it("measures the angle between vectors", () => {
    expect(
      angleBetween({ x: 1, y: 0, z: 0 }, { x: 0, y: 2, z: 0 }),
    ).toBeCloseTo(Math.PI / 2);
    expect(angleBetween({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 })).toBe(0);
  });
});

describe("MagneticFieldFilter", () => {
  it("reduces sensor noise on a still phone", () => {
    const random = createRandom(1);
    const noise = () => gaussian(random) * 2;
    const samples = Array.from({ length: 200 }, (_, i) =>
      sampleAt(i, 0.3, EARTH_FIELD, noise),
    );

    const out = run(new MagneticFieldFilter(), samples).slice(20);
    const raw = samples.slice(20).map(rawMagnitude);
    const filtered = out.map((s) => s.magnitude);

    expect(stdDev(filtered)).toBeLessThan(stdDev(raw) / 3);
    expect(Math.abs(filtered[filtered.length - 1] - EARTH_FIELD)).toBeLessThan(
      2,
    );
  });

  it("ignores isolated spikes", () => {
    const random = createRandom(2);
    const noise = () => gaussian(random);
    const samples = Array.from({ length: 100 }, (_, i) =>
      sampleAt(i, 0.3, i % 25 === 24 ? 600 : EARTH_FIELD, noise),
    );

    const out = run(new MagneticFieldFilter(), samples).slice(10);
    expect(Math.max(...out.map((s) => s.magnitude))).toBeLessThan(
      EARTH_FIELD + 5,
    );
    expect(out.some((s) => s.rejected)).toBe(true);
  });

  it("follows a sustained change such as a nearby magnet", () => {
    const random = createRandom(3);
    const noise = () => gaussian(random);
    const samples = Array.from({ length: 80 }, (_, i) =>
      sampleAt(i, 0.3, i < 40 ? EARTH_FIELD : 200, noise),
    );

    const out = run(new MagneticFieldFilter(), samples);
    // One second after the step the reading is within 5% of the new level.
    expect(Math.abs(out[60].magnitude - 200)).toBeLessThan(10);
  });

  it("steadies the reading while the phone oscillates", () => {
    const random = createRandom(4);
    const noise = () => gaussian(random) * 1.5;
    // Phone swinging +-80 degrees at 2 Hz with an uncalibrated hard-iron
    // offset: the raw magnitude swings although the field is constant.
    const hardIron = { x: 15, y: -5, z: 0 };
    const samples = Array.from({ length: 200 }, (_, i) => {
      const t = (i * DT_MS) / 1000;
      const angle = ((80 * Math.PI) / 180) * Math.sin(2 * Math.PI * 2 * t);
      return sampleAt(i, angle, EARTH_FIELD, noise, hardIron);
    });

    const out = run(new MagneticFieldFilter(), samples).slice(40);
    const raw = samples.slice(40).map(rawMagnitude);

    expect(peakToPeak(out.map((s) => s.magnitude))).toBeLessThan(
      peakToPeak(raw) / 3,
    );
    expect(Math.min(...out.map((s) => s.motion))).toBeGreaterThan(0.5);
  });

  it("reports low motion for a still phone and high motion while rotating", () => {
    const still = new MagneticFieldFilter();
    const moving = new MagneticFieldFilter();
    const none = () => 0;

    let stillOut: FilteredMagneticSample | null = null;
    let movingOut: FilteredMagneticSample | null = null;
    for (let i = 0; i < 40; i++) {
      stillOut = still.push(sampleAt(i, 0.3, EARTH_FIELD, none));
      // Horizontal part turns 0.25 rad per 50 ms (~3 rad/s in 3D).
      movingOut = moving.push(sampleAt(i, i * 0.25, EARTH_FIELD, none));
    }

    expect(stillOut!.motion).toBe(0);
    expect(movingOut!.motion).toBeGreaterThan(0.9);
    // A pure rotation does not change the field strength.
    expect(movingOut!.magnitude).toBeCloseTo(EARTH_FIELD, 6);
  });

  it("handles irregular sample intervals", () => {
    const filter = new MagneticFieldFilter();
    const times = [0, 10, 200, 210, 900, 905, 960];
    const out = times.map((t) =>
      filter.push({ x: 20, y: 10, z: 36, timestampMs: t }),
    );

    out.forEach((s) => {
      expect(s!.magnitude).toBeCloseTo(Math.sqrt(400 + 100 + 1296), 6);
    });
  });

  it("skips non-finite samples and returns null before the first valid one", () => {
    const filter = new MagneticFieldFilter();
    expect(filter.push({ x: NaN, y: 0, z: 0, timestampMs: 0 })).toBeNull();

    const first = filter.push({ x: 30, y: 0, z: 40, timestampMs: 50 });
    const bad = filter.push({ x: Infinity, y: 0, z: 0, timestampMs: 100 });

    expect(bad).toEqual({ ...first, rejected: true });
  });

  it("starts fresh after reset", () => {
    const filter = new MagneticFieldFilter();
    for (let i = 0; i < 20; i++) {
      filter.push({ x: 0, y: 0, z: 45, timestampMs: i * DT_MS });
    }
    filter.reset();

    const out = filter.push({ x: 0, y: 0, z: 120, timestampMs: 0 });
    expect(out!.magnitude).toBe(120);
  });
});
