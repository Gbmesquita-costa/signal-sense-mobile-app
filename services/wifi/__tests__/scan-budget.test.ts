import { ScanBudget } from "../scan-budget";

describe("ScanBudget", () => {
  it("allows 4 scans per 2 minutes, spaced by the minimum gap", () => {
    const budget = new ScanBudget();
    const accepted: number[] = [];

    for (let t = 0; t < 120_000; t += 1_000) {
      if (budget.canScan(t)) {
        budget.record(t);
        accepted.push(t);
      }
    }

    expect(accepted).toEqual([0, 15_000, 30_000, 45_000]);
  });

  it("frees a slot once the oldest request leaves the window", () => {
    const budget = new ScanBudget();
    [0, 15_000, 30_000, 45_000].forEach((t) => budget.record(t));

    expect(budget.canScan(119_999)).toBe(false);
    expect(budget.waitMs(100_000)).toBe(20_000);
    expect(budget.canScan(120_000)).toBe(true);
  });

  it("reports the wait caused by the minimum gap", () => {
    const budget = new ScanBudget();
    budget.record(0);
    expect(budget.waitMs(5_000)).toBe(10_000);
    expect(budget.waitMs(15_000)).toBe(0);
  });
});
