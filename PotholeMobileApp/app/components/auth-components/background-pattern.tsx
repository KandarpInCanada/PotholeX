import type React from "react";
import { StyleSheet } from "react-native";
import Svg, { Defs, Pattern, Rect, Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

export const BackgroundPattern = () => (
  <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
    <Defs>
      <Pattern
        id="pattern"
        patternUnits="userSpaceOnUse"
        width="60"
        height="60"
        patternTransform="rotate(45)"
      >
        <Circle cx="30" cy="30" r="1.5" fill="rgba(66, 133, 244, 0.1)" />
      </Pattern>
    </Defs>
    <Rect width="100%" height="100%" fill="url(#pattern)" />
  </Svg>
);

export const AuthBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={StyleSheet.absoluteFillObject}>
      <BackgroundPattern />
      <LinearGradient
        colors={[
          "rgba(66, 133, 244, 0.08)",
          "rgba(52, 168, 83, 0.05)",
          "transparent",
        ]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {children}
    </View>
  );
};
