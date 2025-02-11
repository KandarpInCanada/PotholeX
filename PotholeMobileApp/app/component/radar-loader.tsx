import React from "react";
import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedProps,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RadarLoader = ({ size = 150 }: { size?: number }) => {
  const rotation = useSharedValue(0);
  const pulseProgress = useSharedValue(0);
  const coreScale = useSharedValue(1);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1
    );
    pulseProgress.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.bezier(0.42, 0, 0.58, 1) }),
      -1
    );
    coreScale.value = withRepeat(
      withTiming(1.4, { duration: 1000, easing: Easing.linear }),
      -1,
      true
    );
  }, []);
  const pulseAnimatedProps = useAnimatedProps(() => ({
    r: pulseProgress.value * 40,
    opacity: 1 - pulseProgress.value,
  }));
  const coreAnimatedProps = useAnimatedProps(() => ({
    transform: [{ scale: coreScale.value }],
  }));
  const arcRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <AnimatedCircle cx="50" cy="50" fill="#00e0ff" animatedProps={pulseAnimatedProps} />
        <Animated.View style={[arcRotationStyle, { position: "absolute", width: size, height: size }]}>
          <Svg width="100%" height="100%" viewBox="0 0 100 100">
            <Path
              d="M50,50 L95,50 A45,45 0 0,1 81.82,81.82 Z"
              fill="rgba(0,224,255,0.15)"
            />
          </Svg>
        </Animated.View>
        <AnimatedCircle cx="50" cy="50" r="5" fill="#00e0ff" animatedProps={coreAnimatedProps} />
      </Svg>
    </View>
  );
};
export default RadarLoader;
