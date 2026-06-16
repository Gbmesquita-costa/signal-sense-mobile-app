/**
 * AnimatedSplashScreen — "Signal Awakening"
 *
 * Phases (~1.8s):
 * 1. Orb + glow (0–0.35s)
 * 2. Ripples + motes + icon (0.35–0.9s)
 * 3. Brand + separator + tagline (0.9–1.2s)
 * 4. Hold (1.2–1.45s)
 * 5. Dissolve exit (1.45–1.8s)
 */

import { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, Image, Text, View } from "react-native";

import LinearGradient from "react-native-linear-gradient";

const { width, height } = Dimensions.get("window");

interface AnimatedSplashScreenProps {
  onFinish: () => void;
  isDark: boolean;
  tagline: string;
}

const AnimatedSplashScreen = ({
  onFinish,
  isDark,
  tagline,
}: AnimatedSplashScreenProps) => {
  // ── Central orb ──
  const orbScale = useRef(new Animated.Value(0.3)).current;
  const orbOpacity = useRef(new Animated.Value(0)).current;

  const orbGlow1 = useRef(new Animated.Value(0)).current;
  const orbGlow2 = useRef(new Animated.Value(0)).current;

  // ── Sonar ripples ──
  const r1Scale = useRef(new Animated.Value(0.6)).current;
  const r1Op = useRef(new Animated.Value(0)).current;

  const r2Scale = useRef(new Animated.Value(0.6)).current;
  const r2Op = useRef(new Animated.Value(0)).current;

  const r3Scale = useRef(new Animated.Value(0.6)).current;
  const r3Op = useRef(new Animated.Value(0)).current;

  // ── Floating motes ──
  const motes = useRef(
    Array.from({ length: 8 }, () => ({
      opacity: new Animated.Value(0),
      y: new Animated.Value(0),
      x: new Animated.Value(0),
      scale: new Animated.Value(0),
    })),
  ).current;

  // ── Icon ──
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.7)).current;

  // ── Brand text ──
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandY = useRef(new Animated.Value(10)).current;

  // ── Separator line ──
  const lineWidth = useRef(new Animated.Value(0)).current;
  const lineOpacity = useRef(new Animated.Value(0)).current;

  // ── Tagline ──
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const tagY = useRef(new Animated.Value(6)).current;

  // ── Exit ──
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  const moteConfigs = [
    {
      startX: -45,
      startY: 30,
      driftX: -12,
      driftY: -120,
      size: 5,
      delay: 0,
      color: "#60A5FA",
    },
    {
      startX: 55,
      startY: -20,
      driftX: 8,
      driftY: -130,
      size: 4,
      delay: 30,
      color: "#38BDF8",
    },
    {
      startX: -25,
      startY: -50,
      driftX: -18,
      driftY: -100,
      size: 6,
      delay: 60,
      color: "#93C5FD",
    },
    {
      startX: 70,
      startY: 45,
      driftX: 15,
      driftY: -140,
      size: 3.5,
      delay: 20,
      color: "#22D3EE",
    },
    {
      startX: -65,
      startY: -10,
      driftX: -20,
      driftY: -110,
      size: 4.5,
      delay: 70,
      color: "#7DD3FC",
    },
    {
      startX: 35,
      startY: 60,
      driftX: 5,
      driftY: -125,
      size: 5.5,
      delay: 40,
      color: "#BAE6FD",
    },
    {
      startX: -10,
      startY: -65,
      driftX: -8,
      driftY: -95,
      size: 3,
      delay: 90,
      color: "#67E8F9",
    },
    {
      startX: 50,
      startY: 15,
      driftX: 22,
      driftY: -135,
      size: 4,
      delay: 55,
      color: "#A5F3FC",
    },
  ];

  useEffect(() => {
    const ripple = (scale: Animated.Value, op: Animated.Value, delay: number) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(op, {
            toValue: 0.5,
            duration: 40,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 2.8,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(op, {
            toValue: 0,
            duration: 500,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]);

    const moteDrift = (mote: (typeof motes)[0], cfg: (typeof moteConfigs)[0]) =>
      Animated.sequence([
        Animated.delay(cfg.delay),
        Animated.parallel([
          Animated.timing(mote.x, {
            toValue: cfg.driftX,
            duration: 700,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(mote.y, {
            toValue: cfg.driftY,
            duration: 700,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(mote.scale, {
            toValue: 1,
            duration: 150,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(mote.opacity, {
              toValue: 0.8,
              duration: 180,
              useNativeDriver: true,
            }),
            Animated.delay(200),
            Animated.timing(mote.opacity, {
              toValue: 0,
              duration: 320,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]);

    const animation = Animated.sequence([
      // ═══ Phase 1: Orb (0–0.35s) ═══
      Animated.parallel([
        Animated.timing(orbOpacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(orbScale, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(100),
          Animated.timing(orbGlow1, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(180),
          Animated.timing(orbGlow2, {
            toValue: 1,
            duration: 200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),

      // ═══ Phase 2: Ripples + motes + icon (0.35–0.9s) ═══
      Animated.parallel([
        ripple(r1Scale, r1Op, 0),
        ripple(r2Scale, r2Op, 80),
        ripple(r3Scale, r3Op, 160),
        ...motes.map((m, i) => moteDrift(m, moteConfigs[i])),
        Animated.sequence([
          Animated.delay(60),
          Animated.parallel([
            Animated.timing(iconOpacity, {
              toValue: 1,
              duration: 280,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(iconScale, {
              toValue: 1,
              duration: 320,
              easing: Easing.out(Easing.back(1.05)),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),

      // ═══ Phase 3: Brand + separator + tagline (0.9–1.2s) ═══
      Animated.parallel([
        Animated.parallel([
          Animated.timing(brandOpacity, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(brandY, {
            toValue: 0,
            duration: 280,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(60),
          Animated.parallel([
            Animated.timing(lineOpacity, {
              toValue: 1,
              duration: 180,
              useNativeDriver: true,
            }),
            Animated.timing(lineWidth, {
              toValue: 1,
              duration: 220,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.sequence([
          Animated.delay(120),
          Animated.parallel([
            Animated.timing(tagOpacity, {
              toValue: 1,
              duration: 200,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(tagY, {
              toValue: 0,
              duration: 250,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),

      // ═══ Phase 4: Hold (1.2–1.45s) ═══
      Animated.delay(250),

      // ═══ Phase 5: Dissolve (1.45–1.8s) ═══
      Animated.parallel([
        Animated.timing(exitOpacity, {
          toValue: 0,
          duration: 350,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(exitScale, {
          toValue: 1.08,
          duration: 350,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start(() => onFinish());
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      className="absolute inset-0 z-50"
      style={{ opacity: exitOpacity, transform: [{ scale: exitScale }] }}
    >
      <LinearGradient
        colors={
          isDark
            ? ["#0C1A30", "#122448", "#1A3260"]
            : ["#E0EAFC", "#C9D6F0", "#B6C5E8"]
        }
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1 }}
      >
        <View className="flex-1 items-center justify-center">
          {/* ── Sonar ripples ── */}
          {[
            {
              scale: r1Scale,
              opacity: r1Op,
              color: isDark ? "rgba(96,165,250,0.30)" : "rgba(59,130,246,0.25)",
            },
            {
              scale: r2Scale,
              opacity: r2Op,
              color: isDark ? "rgba(56,189,248,0.25)" : "rgba(14,165,233,0.22)",
            },
            {
              scale: r3Scale,
              opacity: r3Op,
              color: isDark ? "rgba(34,211,238,0.20)" : "rgba(59,130,246,0.18)",
            },
          ].map((ring, i) => (
            <Animated.View
              key={`ring-${i}`}
              className="absolute rounded-full"
              style={{
                width: 140,
                height: 140,
                borderWidth: 1.5,
                borderColor: ring.color,
                opacity: ring.opacity,
                transform: [{ scale: ring.scale }],
              }}
            />
          ))}

          {/* ── Outer glow ── */}
          <Animated.View
            className="absolute rounded-full"
            style={{
              width: 200,
              height: 200,
              backgroundColor: isDark
                ? "rgba(96,165,250,0.08)"
                : "rgba(59,130,246,0.10)",
              opacity: orbGlow2,
              transform: [{ scale: orbScale }],
            }}
          />

          {/* ── Inner glow ── */}
          <Animated.View
            className="absolute rounded-full"
            style={{
              width: 150,
              height: 150,
              backgroundColor: isDark
                ? "rgba(96,165,250,0.15)"
                : "rgba(59,130,246,0.14)",
              opacity: orbGlow1,
              transform: [{ scale: orbScale }],
            }}
          />

          {/* ── Central orb ── */}
          <Animated.View
            className="absolute rounded-full"
            style={{
              width: 110,
              height: 110,
              backgroundColor: isDark
                ? "rgba(96,165,250,0.22)"
                : "rgba(59,130,246,0.18)",
              opacity: orbOpacity,
              transform: [{ scale: orbScale }],
            }}
          />

          {/* ── Floating motes ── */}
          {motes.map((mote, i) => {
            const cfg = moteConfigs[i];
            return (
              <Animated.View
                key={`mote-${i}`}
                className="absolute rounded-full"
                style={{
                  width: cfg.size,
                  height: cfg.size,
                  backgroundColor: cfg.color,
                  left: width / 2 + cfg.startX - cfg.size / 2,
                  top: height / 2 + cfg.startY - cfg.size / 2,
                  opacity: mote.opacity,
                  transform: [
                    { translateX: mote.x },
                    { translateY: mote.y },
                    { scale: mote.scale },
                  ],
                  shadowColor: cfg.color,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.9,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              />
            );
          })}

          {/* ── App icon (logo only — sits on top of the glowing orb) ── */}
          <Animated.View
            className="items-center justify-center"
            style={{
              opacity: iconOpacity,
              transform: [{ scale: iconScale }],
            }}
          >
            <Image
              source={require("@/assets/images/icon.png")}
              style={{ width: 120, height: 120 }}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* ── Bottom brand area ── */}
        <View className="absolute bottom-0 left-0 right-0 items-center pb-32">
          <Animated.View
            style={{
              opacity: brandOpacity,
              transform: [{ translateY: brandY }],
            }}
          >
            <Text
              className="text-lg tracking-widest"
              style={{
                fontWeight: "300",
                color: isDark
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(30,58,138,0.85)",
              }}
            >
              Signal Sense
            </Text>
          </Animated.View>

          <Animated.View
            className="mt-3 mb-3"
            style={{
              height: 0.5,
              width: 40,
              backgroundColor: isDark
                ? "rgba(148,163,184,0.4)"
                : "rgba(30,58,138,0.2)",
              opacity: lineOpacity,
              transform: [{ scaleX: lineWidth }],
            }}
          />

          <Animated.View
            style={{
              opacity: tagOpacity,
              transform: [{ translateY: tagY }],
            }}
          >
            <Text
              className="text-xs tracking-wider"
              style={{
                fontWeight: "300",
                color: isDark
                  ? "rgba(255,255,255,0.4)"
                  : "rgba(30,58,138,0.45)",
              }}
            >
              {tagline}
            </Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export { AnimatedSplashScreen };
