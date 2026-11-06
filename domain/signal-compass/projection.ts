/**
 * Projects a compass bearing onto the camera preview.
 *
 * The source is assumed to sit on the horizon (RSSI says nothing about
 * height), so its vertical position only depends on how far the camera is
 * tilted up or down. A pinhole model maps angles to pixels:
 *
 *   x = w/2 + (tan(relative) / tan(hFov/2)) * w/2
 *   y = h/2 + (tan(pitch)    / tan(vFov/2)) * h/2
 *
 * When the bearing is outside the horizontal field of view the target is
 * not drawn; `edge` says which side the user should turn to instead.
 */

import { angleDifference, toRadians } from "./angles";

interface ProjectionInput {
  /** Bearing to the target, compass degrees. */
  bearing: number;
  /** Camera heading, compass degrees. */
  heading: number;
  /** Camera elevation above the horizon, degrees. */
  pitch: number;
  /** Horizontal / vertical field of view of the preview, degrees. */
  horizontalFov: number;
  verticalFov: number;
  width: number;
  height: number;
}

interface ProjectedTarget {
  /** True when the target lies inside the horizontal field of view. */
  visible: boolean;
  x: number;
  y: number;
  /** Bearing relative to the camera, (-180, 180]. Positive = to the right. */
  relative: number;
  /** Side to turn to when the target is off screen. */
  edge: "left" | "right" | null;
}

function projectBearing(input: ProjectionInput): ProjectedTarget {
  const { width, height } = input;
  const relative = angleDifference(input.bearing, input.heading);

  const halfH = toRadians(input.horizontalFov / 2);
  const halfV = toRadians(input.verticalFov / 2);

  // Tilting the camera up moves the horizon down the screen.
  const pitch = Math.max(-80, Math.min(80, input.pitch));
  const rawY =
    height / 2 + (Math.tan(toRadians(pitch)) / Math.tan(halfV)) * (height / 2);
  const y = Math.max(0, Math.min(height, rawY));

  if (Math.abs(relative) > input.horizontalFov / 2) {
    return {
      visible: false,
      x: relative > 0 ? width : 0,
      y,
      relative,
      edge: relative > 0 ? "right" : "left",
    };
  }

  const x =
    width / 2 + (Math.tan(toRadians(relative)) / Math.tan(halfH)) * (width / 2);

  return { visible: true, x, y, relative, edge: null };
}

export { type ProjectedTarget, type ProjectionInput, projectBearing };
