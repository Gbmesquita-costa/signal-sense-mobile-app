import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useSystemColorScheme } from "react-native";

import { colors, type ColorScheme, type ThemeColors } from "./colors";

const THEME_STORAGE_KEY = "@signalsense/theme";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  /** Current theme applied (light or dark) */
  colorScheme: ColorScheme;
  /** User-selected mode (light, dark, or system) */
  themeMode: ThemeMode;
  /** Current theme colors */
  theme: ThemeColors;
  /** If the current theme is dark */
  isDark: boolean;
  /** Alternates between light and dark */
  toggleTheme: () => void;
  /** Defines the theme mode */
  setThemeMode: (mode: ThemeMode) => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load saved preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedMode) => {
      if (savedMode && ["light", "dark", "system"].includes(savedMode)) {
        setThemeModeState(savedMode as ThemeMode);
      }

      setIsLoaded(true);
    });
  }, []);

  // Determines the color scheme based on the mode.
  const colorScheme: ColorScheme =
    themeMode === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : themeMode;

  const isDark = colorScheme === "dark";
  const theme = colors[colorScheme];

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  }, []);

  const toggleTheme = useCallback(() => {
    const newMode = colorScheme === "dark" ? "light" : "dark";
    setThemeMode(newMode);
  }, [colorScheme, setThemeMode]);

  // Please wait while loading preferences before rendering.
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        colorScheme,
        themeMode,
        theme,
        isDark,
        toggleTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}

export { ThemeProvider, useTheme };
