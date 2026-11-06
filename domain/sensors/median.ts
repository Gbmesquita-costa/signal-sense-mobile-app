/**
 * Median helpers for small rolling windows.
 *
 * Pure functions with no React or native imports so they can be unit tested
 * directly. Windows are tiny (5-9 samples), so sorting a copy is cheaper and
 * simpler than maintaining an order-statistics structure.
 */

/** Median of a list of numbers. Returns NaN for an empty list. */
function median(values: readonly number[]): number {
  const n = values.length;
  if (n === 0) return NaN;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = n >> 1;

  return n % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Median absolute deviation around a given center (defaults to the median).
 * Multiply by 1.4826 to get a robust estimate of the standard deviation for
 * normally distributed noise.
 */
function medianAbsoluteDeviation(
  values: readonly number[],
  center: number = median(values),
): number {
  if (values.length === 0) return NaN;
  return median(values.map((v) => Math.abs(v - center)));
}

/** Fixed-size FIFO window of numbers. */
class RollingWindow {
  private readonly values: number[] = [];

  constructor(private readonly size: number) {
    if (!Number.isInteger(size) || size < 1) {
      throw new RangeError(`RollingWindow size must be >= 1, got ${size}`);
    }
  }

  push(value: number): void {
    this.values.push(value);
    if (this.values.length > this.size) this.values.shift();
  }

  get length(): number {
    return this.values.length;
  }

  get isFull(): boolean {
    return this.values.length === this.size;
  }

  toArray(): readonly number[] {
    return this.values;
  }

  median(): number {
    return median(this.values);
  }

  clear(): void {
    this.values.length = 0;
  }
}

export { median, medianAbsoluteDeviation, RollingWindow };
