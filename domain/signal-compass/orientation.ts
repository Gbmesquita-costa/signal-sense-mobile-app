/**
 * Camera pose from expo-sensors DeviceMotion `rotation`.
 *
 * On Android, DeviceMotion reads TYPE_ROTATION_VECTOR (gyroscope +
 * accelerometer + magnetometer, so alpha is referenced to magnetic north)
 * and reports alpha = -azimuth, beta = -pitch, gamma = roll in radians from
 * SensorManager.getOrientation. With that convention the device-to-world
 * rotation is R = Rz(alpha) * Rx(beta) * Ry(gamma), with world axes
 * x = east, y = north, z = up.
 *
 * The back camera looks along the device's -Z axis, so its direction in the
 * world is the negated third column of R. Deriving heading from that vector
 * (instead of using the azimuth directly) keeps it meaningful while the
 * phone is held upright, where the azimuth of getOrientation is unstable.
 */

import { bearingOf, toDegrees } from "./angles";

interface DeviceRotation {
  /** Radians, as reported by DeviceMotion. */
  alpha: number;
  beta: number;
  gamma: number;
}

interface CameraPose {
  /** Compass heading of the camera's optical axis, degrees [0, 360). */
  heading: number;
  /** Elevation of the optical axis above the horizon, degrees [-90, 90]. */
  pitch: number;
  /**
   * Compass direction the user is most likely walking: the camera heading,
   * or the top edge of the phone when it is held nearly flat.
   */
  walkingHeading: number;
}

function cameraPoseFromRotation({
  alpha,
  beta,
  gamma,
}: DeviceRotation): CameraPose {
  const ca = Math.cos(alpha);
  const sa = Math.sin(alpha);
  const cb = Math.cos(beta);
  const sb = Math.sin(beta);
  const cg = Math.cos(gamma);
  const sg = Math.sin(gamma);

  // Third column of Rz(alpha) * Rx(beta) * Ry(gamma), negated: camera axis.
  const fx = -(ca * sg + sa * sb * cg);
  const fy = -(sa * sg - ca * sb * cg);
  const fz = -(cb * cg);

  // Second column: the phone's top edge.
  const tx = -sa * cb;
  const ty = ca * cb;

  const heading = bearingOf(fx, fy);
  const pitch = toDegrees(Math.asin(Math.max(-1, Math.min(1, fz))));

  // Held flat (camera at the floor), the camera's horizontal direction is
  // noise; the top edge then points where the user walks.
  const horizontal = Math.hypot(fx, fy);
  const walkingHeading = horizontal >= 0.5 ? heading : bearingOf(tx, ty);

  return { heading, pitch, walkingHeading };
}

export { type CameraPose, cameraPoseFromRotation, type DeviceRotation };
