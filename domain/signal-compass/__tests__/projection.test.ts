import { projectBearing, type ProjectionInput } from "../projection";

const base: ProjectionInput = {
  bearing: 0,
  heading: 0,
  pitch: 0,
  horizontalFov: 60,
  verticalFov: 80,
  width: 400,
  height: 800,
};

describe("projectBearing", () => {
  it("puts a target straight ahead at the centre", () => {
    const p = projectBearing(base);
    expect(p.visible).toBe(true);
    expect(p.x).toBeCloseTo(200);
    expect(p.y).toBeCloseTo(400);
    expect(p.edge).toBeNull();
  });

  it("puts a target at half the field of view on the screen edge", () => {
    expect(projectBearing({ ...base, bearing: 30 }).x).toBeCloseTo(400);
    expect(projectBearing({ ...base, bearing: -30 }).x).toBeCloseTo(0);
  });

  it("handles the 0/360 seam", () => {
    const p = projectBearing({ ...base, bearing: 10, heading: 350 });
    expect(p.relative).toBeCloseTo(20);
    expect(p.visible).toBe(true);
    expect(p.x).toBeGreaterThan(200);
  });

  it("returns the side to turn to when the target is out of view", () => {
    const right = projectBearing({ ...base, bearing: 100 });
    expect(right.visible).toBe(false);
    expect(right.edge).toBe("right");

    const left = projectBearing({ ...base, bearing: 250 });
    expect(left.visible).toBe(false);
    expect(left.edge).toBe("left");

    const behind = projectBearing({ ...base, bearing: 180 });
    expect(behind.visible).toBe(false);
    expect(behind.edge).not.toBeNull();
  });

  it("moves the horizon down when the camera tilts up", () => {
    const up = projectBearing({ ...base, pitch: 20 });
    const down = projectBearing({ ...base, pitch: -20 });
    expect(up.y).toBeGreaterThan(400);
    expect(down.y).toBeLessThan(400);
  });

  it("keeps y on screen for extreme tilt", () => {
    const p = projectBearing({ ...base, pitch: 89 });
    expect(p.y).toBeGreaterThanOrEqual(0);
    expect(p.y).toBeLessThanOrEqual(800);
  });
});
