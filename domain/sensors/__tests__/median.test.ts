import { median, medianAbsoluteDeviation, RollingWindow } from "../median";

describe("median", () => {
  it("handles odd, even and empty inputs", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([])).toBeNaN();
  });

  it("does not mutate its input", () => {
    const values = [3, 1, 2];
    median(values);
    expect(values).toEqual([3, 1, 2]);
  });

  it("computes the median absolute deviation", () => {
    // median = 2, deviations = [1, 0, 1, 0, 7] -> MAD = 1
    expect(medianAbsoluteDeviation([1, 2, 3, 2, 9])).toBe(1);
  });
});

describe("RollingWindow", () => {
  it("keeps only the most recent values", () => {
    const window = new RollingWindow(3);
    [1, 2, 3, 4].forEach((v) => window.push(v));

    expect(window.toArray()).toEqual([2, 3, 4]);
    expect(window.isFull).toBe(true);
    expect(window.median()).toBe(3);
  });

  it("rejects invalid sizes", () => {
    expect(() => new RollingWindow(0)).toThrow(RangeError);
  });
});
