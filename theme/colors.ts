/**
 * SignalSense color token design
 * Follow the Design System defined
 */

const colors = {
  light: {
    background: "#FFFFFF",
    surface: "#F3F4F6",
    primary: "#3B82F6",
    accent: "#0EA5E9",
    success: "#16A34A",
    warning: "#CA8A04",
    error: "#DC2626",
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    textTertiary: "#9CA3AF",
    border: "#E5E7EB",
  },
  dark: {
    background: "#0B0E11",
    surface: "#12161C",
    primary: "#3B82F6",
    accent: "#22D3EE",
    success: "#22C55E",
    warning: "#FACC15",
    error: "#EF4444",
    textPrimary: "#E5E7EB",
    textSecondary: "#9CA3AF",
    textTertiary: "#6B7280",
    border: "#1F2937",
  },
} as const;

type ColorScheme = keyof typeof colors;
type ThemeColors = (typeof colors)[ColorScheme];

export { colors, ColorScheme, ThemeColors };
