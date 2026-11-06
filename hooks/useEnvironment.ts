/**
 * Hook useEnvironment
 * Manages the magnetometer sensor lifecycle
 *
 * The service delivers filtered samples at ~20 Hz. Shared values are only
 * written every UI_UPDATE_INTERVAL_MS and animate linearly towards the new
 * reading over that same interval, so the numbers and circles move smoothly
 * instead of stepping on every sample.
 */

import * as Haptics from "expo-haptics";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Easing,
  SharedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  environmentService,
  type EnvironmentStatus,
} from "@/services/environment/environment.service";

import { historyService } from "@/services/history";
import type { EnvironmentSample } from "@/services/history/history.types";

type EnvironmentScreenState =
  | "idle"
  | "initializing"
  | "monitoring"
  | "unavailable"
  | "error";

interface UseEnvironmentReturn {
  // Screen status
  state: EnvironmentScreenState;

  // Shared values ​​for fluid animation (Reanimated)
  magnitude: SharedValue<number>;
  x: SharedValue<number>;
  y: SharedValue<number>;
  z: SharedValue<number>;

  // Status (updates less frequently)
  status: EnvironmentStatus;

  // Availability
  isAvailable: boolean;

  // Error
  error: string | null;

  // Actions
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => void;
}

// 10 Hz is smooth to the eye and keeps text updates readable.
const UI_UPDATE_INTERVAL_MS = 100;
const UI_TIMING = { duration: UI_UPDATE_INTERVAL_MS, easing: Easing.linear };

const STATUS_SEVERITY: Record<EnvironmentStatus, number> = {
  stable: 0,
  moderate: 1,
  high: 2,
  extreme: 3,
};

function getHapticForTransition(
  prev: EnvironmentStatus,
  next: EnvironmentStatus,
): Haptics.ImpactFeedbackStyle | null {
  const diff = STATUS_SEVERITY[next] - STATUS_SEVERITY[prev];

  // Only vibrate when severity increases
  if (diff <= 0) return null;

  if (next === "extreme") return Haptics.ImpactFeedbackStyle.Heavy;
  if (next === "high") return Haptics.ImpactFeedbackStyle.Medium;

  return Haptics.ImpactFeedbackStyle.Light;
}

function useEnvironment(): UseEnvironmentReturn {
  // Screen status (rarely changes)
  const [screenState, setScreenState] =
    useState<EnvironmentScreenState>("idle");
  const [status, setStatus] = useState<EnvironmentStatus>("stable");

  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Shared values ​​for smooth animation (60 FPS without re-rendering)
  const magnitude = useSharedValue(0);

  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const z = useSharedValue(0);

  // Reference to the current status (avoids unnecessary re-renders)
  const currentStatusRef = useRef<EnvironmentStatus>("stable");

  // Reference to control whether it is already monitoring (prevents setScreenState from looping)
  const isMonitoringRef = useRef(false);

  // Incremented on every start and stop; async work from an older run
  // (availability check, session creation) compares against it and bails.
  const runIdRef = useRef(0);

  // UI throttle — last time the shared values were written
  const lastUiUpdateRef = useRef(0);

  // Haptic debounce — minimum 800ms between haptic events
  const lastHapticTimeRef = useRef(0);

  // Status throttle — minimum 500ms between React state updates
  const lastStatusUpdateRef = useRef(0);
  const pendingStatusRef = useRef<EnvironmentStatus | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // DB persistence
  const sessionIdRef = useRef<string | null>(null);
  const sampleBufferRef = useRef<EnvironmentSample[]>([]);

  const FLUSH_THRESHOLD = 150;
  const sessionStartedRef = useRef(false);

  const flushSamples = useCallback(async () => {
    if (!sessionIdRef.current || sampleBufferRef.current.length === 0) return;

    const samples = [...sampleBufferRef.current];
    sampleBufferRef.current = [];

    try {
      await historyService.addEnvironmentSamples(sessionIdRef.current, samples);
    } catch {
      // Non-critical
    }
  }, []);

  const startMonitoring = useCallback(async () => {
    const runId = ++runIdRef.current;

    try {
      setScreenState("initializing");
      setError(null);

      // Check availability
      const available = await environmentService.isAvailable();

      // Cancelled (or restarted) while waiting: do not subscribe.
      if (runId !== runIdRef.current) return;

      if (!available) {
        setScreenState("unavailable");
        setIsAvailable(false);

        return;
      }

      // Reset values
      magnitude.value = 0;

      x.value = 0;
      y.value = 0;
      z.value = 0;

      currentStatusRef.current = "stable";
      isMonitoringRef.current = false;
      lastUiUpdateRef.current = 0;
      sessionStartedRef.current = false;

      // Reset and start the service
      environmentService.reset();

      environmentService.start((newState) => {
        if (newState.data) {
          // Throttled shared value writes (no React re-render involved)
          const uiNow = Date.now();
          if (uiNow - lastUiUpdateRef.current >= UI_UPDATE_INTERVAL_MS) {
            lastUiUpdateRef.current = uiNow;

            magnitude.value = withTiming(newState.data.magnitude, UI_TIMING);
            x.value = withTiming(newState.data.x, UI_TIMING);
            y.value = withTiming(newState.data.y, UI_TIMING);
            z.value = withTiming(newState.data.z, UI_TIMING);
          }

          // Lazy session creation — only on first actual data
          if (!sessionStartedRef.current) {
            sessionStartedRef.current = true;
            historyService
              .createEnvironmentSession()
              .then((id) => {
                if (runId === runIdRef.current) {
                  sessionIdRef.current = id;
                } else {
                  // Stopped before the session existed: close it now so it
                  // is not left open or reused by the next run.
                  historyService.finishEnvironmentSession(id).catch(() => {});
                }
              })
              .catch(() => {});
          }

          // Buffer sample for DB persistence
          sampleBufferRef.current.push({
            timestamp: Date.now(),
            x: newState.data.x,
            y: newState.data.y,
            z: newState.data.z,

            magnitude: newState.data.magnitude,
            status: currentStatusRef.current,
          });
          if (
            sessionIdRef.current &&
            sampleBufferRef.current.length >= FLUSH_THRESHOLD
          ) {
            flushSamples();
          }
        }

        // Update status only if changed (avoids re-renders)
        if (newState.status !== currentStatusRef.current) {
          const prev = currentStatusRef.current;
          currentStatusRef.current = newState.status;

          // Throttled React state update — max once per 500ms
          const now = Date.now();
          const elapsed = now - lastStatusUpdateRef.current;

          if (elapsed >= 500) {
            lastStatusUpdateRef.current = now;
            pendingStatusRef.current = null;

            setStatus(newState.status);
          } else {
            // Schedule deferred update
            pendingStatusRef.current = newState.status;
            if (!statusTimerRef.current) {
              statusTimerRef.current = setTimeout(() => {
                statusTimerRef.current = null;

                if (pendingStatusRef.current) {
                  lastStatusUpdateRef.current = Date.now();

                  setStatus(pendingStatusRef.current);
                  pendingStatusRef.current = null;
                }
              }, 500 - elapsed);
            }
          }

          // Haptic feedback with debounce (min 800ms between haptics)
          if (isMonitoringRef.current) {
            const hapticElapsed = now - lastHapticTimeRef.current;
            if (hapticElapsed >= 800) {
              const intensity = getHapticForTransition(prev, newState.status);
              if (intensity) {
                lastHapticTimeRef.current = now;
                Haptics.impactAsync(intensity);
              }
            }
          }
        }

        // Make sure you are monitoring (only once)
        if (!isMonitoringRef.current) {
          isMonitoringRef.current = true;
          setScreenState("monitoring");
        }
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao iniciar monitoramento",
      );
      setScreenState("error");
    }
  }, [magnitude, x, y, z]);

  // Stops the sensor and closes the history session. Shared by the stop
  // button and unmount so leaving the screen never leaves a session open.
  const endRun = useCallback(() => {
    runIdRef.current++;
    environmentService.stop();

    // Clear pending status timer
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
      statusTimerRef.current = null;
    }

    // Finish DB session (fire-and-forget)
    const sid = sessionIdRef.current;

    const hadSession = sessionStartedRef.current;
    const remaining = [...sampleBufferRef.current];

    sampleBufferRef.current = [];

    sessionIdRef.current = null;
    sessionStartedRef.current = false;

    if (hadSession && sid) {
      (async () => {
        try {
          if (remaining.length > 0) {
            await historyService.addEnvironmentSamples(sid, remaining);
          }

          await historyService.finishEnvironmentSession(sid);
        } catch {
          // Non-critical
        }
      })();
    }

    isMonitoringRef.current = false;
  }, []);

  const stopMonitoring = useCallback(() => {
    endRun();
    setScreenState("idle");
  }, [endRun]);

  // Cleanup upon disassembly
  useEffect(() => endRun, [endRun]);

  return {
    state: screenState,
    magnitude,
    x,
    y,
    z,
    status,
    isAvailable,
    error,
    startMonitoring,
    stopMonitoring,
  };
}

export { EnvironmentScreenState, useEnvironment, UseEnvironmentReturn };
