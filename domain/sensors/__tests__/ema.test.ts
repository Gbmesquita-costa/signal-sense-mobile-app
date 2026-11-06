import { emaAlpha, TimeConstantEma } from "../ema";

describe("emaAlpha", () => {
  it("is 1 - 1/e after one time constant", () => {
    expect(emaAlpha(0.2, 0.2)).toBeCloseTo(1 - Math.exp(-1));
  });

  it("degenerates safely", () => {
    expect(emaAlpha(0.1, 0)).toBe(1);
    expect(emaAlpha(0, 0.1)).toBe(0);
  });
});

describe("TimeConstantEma", () => {
  it("seeds with the first sample and converges to a step", () => {
    const ema = new TimeConstantEma();
    expect(ema.update(10, 0.05, 0.1)).toBe(10);

    let value = 10;
    for (let i = 0; i < 40; i++) value = ema.update(20, 0.05, 0.1);
    expect(value).toBeCloseTo(20, 3);
  });

  it("smooths the same amount per second regardless of sample rate", () => {
    const fast = new TimeConstantEma();
    const slow = new TimeConstantEma();
    fast.update(0, 0, 0.3);
    slow.update(0, 0, 0.3);

    let fastValue = 0;
    let slowValue = 0;
    for (let i = 0; i < 20; i++) fastValue = fast.update(1, 0.025, 0.3);
    for (let i = 0; i < 5; i++) slowValue = slow.update(1, 0.1, 0.3);

    expect(fastValue).toBeCloseTo(slowValue, 6);
  });
});
