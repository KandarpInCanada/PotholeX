/**
 * Lottie Splash Screen Component
 *
 * This component displays an animated splash screen using Lottie animation.
 * It includes a fallback timer to ensure navigation continues even if the
 * animation fails to complete or trigger the callback.
 *
 * The animation is loaded from the splash-screen.json file in the assets folder.
 */
"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import { MotiView } from "moti";

interface LottieSplashProps {
  onAnimationFinish?: () => void;
}

const LottieSplash: React.FC<LottieSplashProps> = ({ onAnimationFinish }) => {
  // Reference to the Lottie animation component
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    // Play the animation when component mounts
    if (animationRef.current) {
      animationRef.current.play();
    }

    // Ensure animation plays and callback is triggered even if animation fails
    const timer = setTimeout(() => {
      if (onAnimationFinish) {
        console.log("Fallback timer triggered navigation");
        onAnimationFinish();
      }
    }, 3000); // Fallback after 3 seconds

    return () => clearTimeout(timer);
  }, [onAnimationFinish]);

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 500 }}
        style={styles.content}
      >
        <LottieView
          ref={animationRef}
          source={require("../../assets/splash-screen.json")}
          style={styles.animation}
          autoPlay={true}
          loop={false}
          speed={1}
          resizeMode="cover"
          onAnimationFinish={() => {
            console.log("Animation finished, triggering navigation");
            if (onAnimationFinish) onAnimationFinish();
          }}
        />
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E1E", // Dark background to match your screenshot
  },
  content: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  animation: {
    width: "100%",
    height: "100%",
  },
});

export default LottieSplash;
