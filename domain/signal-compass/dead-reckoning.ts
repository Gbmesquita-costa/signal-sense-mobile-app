/**
 * Pedestrian dead reckoning: each detected step moves the user by a fixed
 * stride along the walking heading. Positions are metres in a local frame
 * (x = east, y = north) whose origin is where the session started.
 *
 * Drift grows with distance walked; that is acceptable for the few metres
 * needed to triangulate a nearby source.
 */

import { toRadians } from "./angles";

interface Position {
  x: number;
  y: number;
}

const DEFAULT_STRIDE_M = 0.7;

class DeadReckoning {
  private current: Position = { x: 0, y: 0 };

  constructor(private readonly strideMeters = DEFAULT_STRIDE_M) {}

  step(headingDegrees: number): Position {
    const rad = toRadians(headingDegrees);
    this.current = {
      x: this.current.x + this.strideMeters * Math.sin(rad),
      y: this.current.y + this.strideMeters * Math.cos(rad),
    };
    return this.current;
  }

  get position(): Position {
    return this.current;
  }

  reset(): void {
    this.current = { x: 0, y: 0 };
  }
}

export { DEFAULT_STRIDE_M, DeadReckoning, type Position };
