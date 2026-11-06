/**
 * useSignalCompass
 *
 * Runs a SignalCompassSession for one BSSID while `bssid` is set and turns
 * its output into what the AR overlay needs:
 *
 *  - Shared values for the target's screen position, visibility and the
 *    side to turn to. They are written from the ~30 Hz motion callback, so
 *    the overlay animates on the UI thread without a React render per frame.
 *  - React state (snapshot) only for low-frequency changes: a new Wi-Fi
 *    reading, a step or a status change.
 *  - A light haptic tap when the filtered signal gets noticeably stronger.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import * as Haptics from "expo-haptics";
import { DeviceMotion } from "expo-sensors";
import { useSharedValue } from "react-native-reanimated";

import { projectBearing } from "@/domain/signal-compass";
import {
  type CompassPose,
  type CompassSnapshot,
  SignalCompassSession,
} from "@/services/signal-compass";

interface Viewport {
  width: number;
  height: number;
}

/**
 * Approximate field of view of a phone's main camera in portrait with the
 * preview filling the screen. Real values vary by device and crop; this
 * only decides where on screen the waves converge.
 */
const HORIZONTAL_FOV = 50;
const VERTICAL_FOV = 65;

/** Low-pass factor for the on-screen target (per motion event). */
const SCREEN_SMOOTHING = 0.25;

const INITIAL_SNAPSHOT: CompassSnapshot = {
  status: "waiting",
  estimate: null,
  rssi: null,
  steps: 0,
};

function useSignalCompass(bssid: string | null, viewport: Viewport) {
  const [snapshot, setSnapshot] = useState<CompassSnapshot>(INITIAL_SNAPSHOT);
  const [sensorAvailable, setSensorAvailable] = useState<boolean | null>(null);

  const targetX = useSharedValue(viewport.width / 2);
  const targetY = useSharedValue(viewport.height / 2);
  /** 1 when the target is inside the field of view and a bearing exists. */
  const targetVisible = useSharedValue(0);
  /** -1 turn left, 1 turn right, 0 none. */
  const turnHint = useSharedValue(0);

  const viewportRef = useRef(viewport);
  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  const handlePose = useCallback(
    (pose: CompassPose) => {
      if (pose.bearing === null) {
        targetVisible.value = 0;
        turnHint.value = 0;
        return;
      }

      const { width, height } = viewportRef.current;
      const projected = projectBearing({
        bearing: pose.bearing,
        heading: pose.heading,
        pitch: pose.pitch,
        horizontalFov: HORIZONTAL_FOV,
        verticalFov: VERTICAL_FOV,
        width,
        height,
      });

      targetX.value += SCREEN_SMOOTHING * (projected.x - targetX.value);
      targetY.value += SCREEN_SMOOTHING * (projected.y - targetY.value);
      targetVisible.value = projected.visible ? 1 : 0;
      turnHint.value =
        projected.edge === "left" ? -1 : projected.edge === "right" ? 1 : 0;
    },
    [targetVisible, targetX, targetY, turnHint],
  );

  useEffect(() => {
    if (!bssid) return;

    let cancelled = false;
    let session: SignalCompassSession | null = null;

    setSnapshot(INITIAL_SNAPSHOT);
    targetVisible.value = 0;
    turnHint.value = 0;

    DeviceMotion.isAvailableAsync()
      .catch(() => false)
      .then((available) => {
        if (cancelled) return;
        setSensorAvailable(available);
        if (!available) return;

        session = new SignalCompassSession(bssid, {
          onPose: handlePose,
          onSnapshot: setSnapshot,
          onCloser: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
              () => {},
            );
          },
        });
        session.start();
      });

    return () => {
      cancelled = true;
      session?.stop();
    };
  }, [bssid, handlePose, targetVisible, turnHint]);

  return {
    snapshot,
    sensorAvailable,
    targetX,
    targetY,
    targetVisible,
    turnHint,
  };
}

type UseSignalCompassReturn = ReturnType<typeof useSignalCompass>;

export { useSignalCompass, type UseSignalCompassReturn };
