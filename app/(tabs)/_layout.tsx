import { useRouter, withLayoutContext } from "expo-router";
import { useEffect } from "react";

import {
  Activity,
  Bluetooth,
  BookOpen,
  Clock,
  Radar,
  ScanSearch,
  Settings,
  Wifi,
} from "lucide-react-native";

import { useI18n } from "@/lib/i18n";

import { safePush } from "@/lib/navigation";
import { useTheme } from "@/theme";

import type { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import { Dimensions, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

const SCREEN_WIDTH = Dimensions.get("window").width;

/**
 * Custom tab bar with indicator driven by navigation state (state.index)
 * instead of pager scroll position — prevents desync on rapid swipes.
 */
const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: MaterialTopTabBarProps) => {
  const { theme, isDark } = useTheme();
  const tabWidth = SCREEN_WIDTH / state.routes.length;

  const indicatorX = useSharedValue(state.index * tabWidth);

  useEffect(() => {
    indicatorX.value = withTiming(state.index * tabWidth, { duration: 200 });
  }, [state.index, tabWidth, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: theme.background,
        borderBottomWidth: 1,
        borderBottomColor: isDark
          ? `${theme.textSecondary}20`
          : `${theme.textSecondary}10`,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const color = isFocused ? theme.primary : theme.textSecondary;

        return (
          <Pressable
            key={route.key}
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 10,
              gap: 2,
            }}
          >
            {options.tabBarIcon?.({ focused: isFocused, color })}
            <Text
              style={{
                fontSize: 10,
                fontWeight: "bold",
                color,
              }}
            >
              {options.title ?? route.name}
            </Text>
          </Pressable>
        );
      })}

      {/* Indicator — always snaps to correct position */}
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 0,
            width: tabWidth,
            height: 3,
            borderRadius: 3,
            backgroundColor: theme.primary,
          },
          indicatorStyle,
        ]}
      />
    </View>
  );
};

const TabsLayout = () => {
  const { theme, isDark } = useTheme();
  const { t } = useI18n();

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const navigate = (path: string) => safePush(router, path);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className={isDark ? "bg-background-dark" : "bg-background"}
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          <Text
            className={`text-xl font-bold ${
              isDark ? "text-text-primary-dark" : "text-text-primary"
            }`}
          >
            {t("appName")}
          </Text>
          <View className="flex-row items-center gap-1">
            <Pressable
              onPress={() => navigate("/camera-detector")}
              className="p-2 active:opacity-70"
              hitSlop={8}
              accessibilityLabel={t("cameraDetector.title")}
            >
              <ScanSearch
                size={22}
                color={theme.textSecondary}
                strokeWidth={2}
              />
            </Pressable>
            <Pressable
              onPress={() => navigate("/history")}
              className="p-2 active:opacity-70"
              hitSlop={8}
            >
              <Clock size={22} color={theme.textSecondary} strokeWidth={2} />
            </Pressable>
            <Pressable
              onPress={() => navigate("/settings")}
              className="p-2 -mr-2 active:opacity-70"
              hitSlop={8}
            >
              <Settings size={22} color={theme.textSecondary} strokeWidth={2} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Tabs — swipe still works via native pager, indicator is custom */}
      <MaterialTopTabs
        tabBar={(props: MaterialTopTabBarProps) => <CustomTabBar {...props} />}
        initialLayout={{ width: SCREEN_WIDTH }}
        screenOptions={{
          animationEnabled: true,
          swipeEnabled: true,
          lazy: false,
        }}
      >
        <MaterialTopTabs.Screen
          name="scan"
          options={{
            title: t("tabs.scan"),
            tabBarIcon: ({ color }: { color: string }) => (
              <Radar size={20} color={color} />
            ),
          }}
        />
        <MaterialTopTabs.Screen
          name="proximity"
          options={{
            title: t("tabs.proximity"),
            tabBarIcon: ({ color }: { color: string }) => (
              <Bluetooth size={20} color={color} />
            ),
          }}
        />
        <MaterialTopTabs.Screen
          name="wifi"
          options={{
            title: t("tabs.wifi"),
            tabBarIcon: ({ color }: { color: string }) => (
              <Wifi size={20} color={color} />
            ),
          }}
        />
        <MaterialTopTabs.Screen
          name="environment"
          options={{
            title: t("tabs.environment"),
            tabBarIcon: ({ color }: { color: string }) => (
              <Activity size={20} color={color} />
            ),
          }}
        />
        <MaterialTopTabs.Screen
          name="education"
          options={{
            title: t("tabs.education"),
            tabBarIcon: ({ color }: { color: string }) => (
              <BookOpen size={20} color={color} />
            ),
          }}
        />
      </MaterialTopTabs>
    </View>
  );
};

export default TabsLayout;
