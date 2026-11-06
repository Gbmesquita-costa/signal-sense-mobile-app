import { OutlierGate } from "../outlier";

describe("OutlierGate", () => {
  it("accepts samples until it has enough history", () => {
    const gate = new OutlierGate({ minSamples: 3 });
    expect(gate.accept(45)).toBe(true);
    expect(gate.accept(500)).toBe(true);
    expect(gate.accept(45)).toBe(true);
  });

  it("rejects an isolated spike and keeps accepting normal noise", () => {
    const gate = new OutlierGate();
    [45, 46, 44, 45, 47, 45].forEach((v) => expect(gate.accept(v)).toBe(true));

    expect(gate.accept(300)).toBe(false);
    expect(gate.accept(46)).toBe(true);
  });

  it("never rejects deviations below the minimum, even on a flat signal", () => {
    const gate = new OutlierGate({ minDeviation: 5 });
    for (let i = 0; i < 9; i++) gate.accept(45);

    expect(gate.accept(49)).toBe(true);
  });

  it("adopts a sustained new level after too many rejections", () => {
    const gate = new OutlierGate({ maxConsecutiveRejections: 2 });
    for (let i = 0; i < 9; i++) gate.accept(45);

    expect(gate.accept(200)).toBe(false);
    expect(gate.accept(200)).toBe(false);
    expect(gate.accept(200)).toBe(true);
    expect(gate.accept(201)).toBe(true);
  });

  it("rejects non-finite values", () => {
    const gate = new OutlierGate();
    expect(gate.accept(NaN)).toBe(false);
    expect(gate.accept(Infinity)).toBe(false);
  });
});
