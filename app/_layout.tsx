import "../global.css";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef, useState } from "react";

import { Stack } from "expo-router";

import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import * as SystemUI from "expo-system-ui";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AnimatedSplashScreen } from "@/components/AnimatedSplashScreen";
import { databaseService } from "@/services/database";

import { ThemeProvider, useTheme } from "@/theme";
import { colors } from "@/theme/colors";

import { useI18n } from "@/lib/i18n";

// Register background task for anti-stalking (must be at module level)
import { notificationService } from "@/services/notification";
import "@/services/stalker/stalker.background";

// Prevents splash screen from automatically hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { isDark, colorScheme } = useTheme();
  const { t } = useI18n();

  const [showAnimatedSplash, setShowAnimatedSplash] = useState<boolean>(true);

  const appReadyRef = useRef(false);
  const animationDoneRef = useRef(false);

  const tryDismissSplash = useCallback(() => {
    if (appReadyRef.current && animationDoneRef.current) {
      setShowAnimatedSplash(false);
    }
  }, []);

  useEffect(() => {
    // Sets the system background color based on the theme.
    SystemUI.setBackgroundColorAsync(colors[colorScheme].background);
  }, [colorScheme]);

  useEffect(() => {
    // Initialize database and notification handler in parallel with splash animation
    databaseService
      .initialize()
      .then(() => {
        notificationService.setupForegroundHandler();
      })
      .catch(() => {
        // Silently fail — app works without DB
      })
      .finally(() => {
        SplashScreen.hideAsync();
        appReadyRef.current = true;

        tryDismissSplash();
      });
  }, []);

  const handleSplashFinish = useCallback(() => {
    animationDoneRef.current = true;
    tryDismissSplash();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      {showAnimatedSplash && (
        <AnimatedSplashScreen
          onFinish={handleSplashFinish}
          isDark={isDark}
          tagline={t("splash.tagline")}
        />
      )}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: isDark
              ? colors.dark.background
              : colors.light.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" />

        {/* (tabs) is detected automatically */}
        <Stack.Screen
          name="settings"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="history"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="device/[id]"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="paywall"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="camera-detector"
          options={{
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </>
  );
}

const RootLayout = () => {
  return (
    <GestureHandlerRootView className="flex-1">
      <ThemeProvider>
        <BottomSheetModalProvider>
          <RootLayoutContent />
        </BottomSheetModalProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
