import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Path, Line, G, Defs, RadialGradient, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  useAnimatedProps,
  useAnimatedStyle,
  Easing,
  withDelay,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

interface RadarTarget {
  x: number;
  y: number;
  strength: number;
  detected: boolean;
}

interface RadarLoaderProps {
  size?: number;
  color?: string;
  gridColor?: string;
}

const RadarLoader = ({
  size = 300,
  color = "#00e0ff",
  gridColor = "rgba(0,224,255,0.15)",
}: RadarLoaderProps) => {
  const rotation = useSharedValue(0);
  const pulseProgress = useSharedValue(0);
  const noisePulse = useSharedValue(0);
  const sweepOpacity = useSharedValue(0.3);
  const afterglowOpacity = useSharedValue(0.1);

  // Simulated radar targets
  const targets: RadarTarget[] = [
    { x: 65, y: 35, strength: 0.8, detected: false },
    { x: 30, y: 70, strength: 0.6, detected: false },
    { x: 75, y: 60, strength: 0.9, detected: false },
  ];

  React.useEffect(() => {
    // Main sweep rotation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 4000,
        easing: Easing.linear,
      }),
      -1
    );

    // Multiple pulse waves
    pulseProgress.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.out(Easing.cubic),
      }),
      -1
    );

    // Noise effect animation
    noisePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 200, easing: Easing.inOut(Easing.sin) })
      ),
      -1
    );

    // Sweep opacity variation
    sweepOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 100 }),
        withTiming(0.3, { duration: 100 })
      ),
      -1
    );

    // Afterglow effect
    afterglowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 2000 }),
        withTiming(0.1, { duration: 2000 })
      ),
      -1
    );
  }, []);

  const renderGrid = () => {
    const gridElements = [];
    const center = 50;
    const gridSpacing = 10;

    // Circular grid lines
    for (let i = 1; i <= 4; i++) {
      gridElements.push(
        <Circle
          key={`circle-${i}`}
          cx={center}
          cy={center}
          r={i * gridSpacing}
          stroke={gridColor}
          strokeWidth="0.5"
          fill="none"
        />
      );
    }

    // Cross lines
    gridElements.push(
      <Line
        key="vertical"
        x1={center}
        y1="10"
        x2={center}
        y2="90"
        stroke={gridColor}
        strokeWidth="0.5"
      />,
      <Line
        key="horizontal"
        x1="10"
        y1={center}
        x2="90"
        y2={center}
        stroke={gridColor}
        strokeWidth="0.5"
      />
    );

    // Diagonal lines
    gridElements.push(
      <Line
        key="diagonal1"
        x1="10"
        y1="10"
        x2="90"
        y2="90"
        stroke={gridColor}
        strokeWidth="0.5"
        opacity="0.5"
      />,
      <Line
        key="diagonal2"
        x1="10"
        y1="90"
        x2="90"
        y2="10"
        stroke={gridColor}
        strokeWidth="0.5"
        opacity="0.5"
      />
    );

    return gridElements;
  };

  const pulseAnimatedProps = useAnimatedProps(() => ({
    r: pulseProgress.value * 45,
    opacity: (1 - pulseProgress.value) * 0.3,
  }));

  const secondPulseAnimatedProps = useAnimatedProps(() => ({
    r: ((pulseProgress.value + 0.5) % 1) * 45,
    opacity: (1 - ((pulseProgress.value + 0.5) % 1)) * 0.3,
  }));

  const noiseAnimatedProps = useAnimatedProps(() => ({
    opacity: noisePulse.value * 0.1,
  }));

  const sweepAnimatedProps = useAnimatedProps(() => ({
    opacity: sweepOpacity.value,
  }));

  const afterglowAnimatedProps = useAnimatedProps(() => ({
    opacity: afterglowOpacity.value,
  }));

  const arcRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="scanGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Background gradient */}
        <Circle cx="50" cy="50" r="45" fill="url(#scanGradient)" />

        {/* Grid */}
        <G>{renderGrid()}</G>

        {/* Pulse rings */}
        <AnimatedCircle
          cx="50"
          cy="50"
          stroke={color}
          strokeWidth="1"
          fill="none"
          animatedProps={pulseAnimatedProps}
        />
        <AnimatedCircle
          cx="50"
          cy="50"
          stroke={color}
          strokeWidth="1"
          fill="none"
          animatedProps={secondPulseAnimatedProps}
        />

        {/* Noise effect */}
        <AnimatedCircle
          cx="50"
          cy="50"
          r="45"
          fill={color}
          animatedProps={noiseAnimatedProps}
        />

        {/* Sweep */}
        <Animated.View style={[arcRotationStyle, styles.sweepContainer]}>
          <Svg width="100%" height="100%" viewBox="0 0 100 100">
            <AnimatedPath
              d="M50,50 L95,50 A45,45 0 0,1 81.82,81.82 Z"
              fill={color}
              animatedProps={sweepAnimatedProps}
            />
            <AnimatedPath
              d="M50,50 L95,50 A45,45 0 0,1 81.82,81.82 Z"
              fill={color}
              animatedProps={afterglowAnimatedProps}
              transform="rotate(5, 50, 50)"
            />
          </Svg>
        </Animated.View>

        {/* Targets */}
        {targets.map((target, index) => (
          <G key={index}>
            <Circle
              cx={target.x}
              cy={target.y}
              r="1"
              fill={color}
              opacity={target.strength}
            />
            <Circle
              cx={target.x}
              cy={target.y}
              r="2"
              stroke={color}
              strokeWidth="0.5"
              fill="none"
              opacity={target.strength * 0.5}
            />
          </G>
        ))}

        {/* Center point */}
        <Circle cx="50" cy="50" r="2" fill={color} />
        <Circle cx="50" cy="50" r="1" fill="#ffffff" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  sweepContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
});

export default RadarLoader;