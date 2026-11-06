/**
 * Angle helpers. Bearings and headings are compass degrees: 0 = north,
 * 90 = east, measured clockwise, normalised to [0, 360).
 */

const DEG = Math.PI / 180;

function toRadians(degrees: number): number {
  return degrees * DEG;
}

function toDegrees(radians: number): number {
  return radians / DEG;
}

/** Normalises any angle to [0, 360). */
function normalizeDegrees(degrees: number): number {
  const wrapped = degrees % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/** Signed difference target - from, in (-180, 180]. Positive = clockwise. */
function angleDifference(target: number, from: number): number {
  const diff = normalizeDegrees(target - from);
  return diff > 180 ? diff - 360 : diff;
}

/**
 * Compass bearing of a planar vector where x points east and y north.
 * Returns 0 for the zero vector.
 */
function bearingOf(dx: number, dy: number): number {
  if (dx === 0 && dy === 0) return 0;
  return normalizeDegrees(toDegrees(Math.atan2(dx, dy)));
}

export { angleDifference, bearingOf, normalizeDegrees, toDegrees, toRadians };
