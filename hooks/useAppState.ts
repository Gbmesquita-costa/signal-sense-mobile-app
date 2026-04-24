import { useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

/**
 * Hook for monitoring app status (foreground/background)
 */
function useAppState() {
  const appState = useRef(AppState.currentState);
  const [isActive, setIsActive] = useState(appState.current === "active");

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        appState.current = nextAppState;
        setIsActive(nextAppState === "active");
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return { isActive, appState: appState.current };
}

export { useAppState };
