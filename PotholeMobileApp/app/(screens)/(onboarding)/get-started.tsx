"use client";

import { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  type FlatList,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import { Text } from "react-native-paper";
import { MotiView } from "moti";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import { lightTheme } from "../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  gradient: readonly [string, string];
}

const onboardingData: OnboardingItem[] = [
  {
    id: "1",
    title: "Report Potholes",
    description:
      "Easily report road issues with just a few taps. Help make your community safer for everyone.",
    icon: "map-marker-alert",
    gradient: ["#4A148C", "#7B1FA2"],
  },
  {
    id: "2",
    title: "Track Progress",
    description:
      "Stay updated on repair progress. Get notifications when issues are resolved.",
    icon: "progress-check",
    gradient: ["#1E88E5", "#1565C0"],
  },
  {
    id: "3",
    title: "Community Impact",
    description:
      "Join a community of active citizens making real changes in road safety.",
    icon: "account-group",
    gradient: ["#00C853", "#1B5E20"],
  },
];

const GetStartedScreen = () => {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Set status bar to match onboarding screen
  useEffect(() => {
    StatusBar.setBarStyle("dark-content");
    StatusBar.setBackgroundColor("#F8FAFC");
  }, []);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      router.replace("/login");
    }
  };

  const renderOnboardingItem = ({ item }: { item: OnboardingItem }) => (
    <View style={[styles.slide, { width: windowWidth }]}>
      <LinearGradient
        colors={item.gradient}
        style={styles.iconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <MotiView
          from={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "timing", duration: 700, delay: 300 }}
        >
          <MaterialCommunityIcons name={item.icon} size={80} color="white" />
        </MotiView>
      </LinearGradient>

      <MotiView
        from={{ opacity: 0, translateY: 50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 700, delay: 500 }}
        style={styles.textContainer}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </MotiView>
    </View>
  );

  const dotStyles = onboardingData.map((_, index) => {
    return useAnimatedStyle(() => {
      const input = scrollX.value / windowWidth;
      const opacity = interpolate(
        input,
        [index - 1, index, index + 1],
        [0.3, 1, 0.3],
        "clamp"
      );
      const width = interpolate(
        input,
        [index - 1, index, index + 1],
        [8, 24, 8],
        "clamp"
      );
      return { opacity, width };
    });
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => router.replace("/login")}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Animated.FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderOnboardingItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />

      <View style={styles.dotsContainer}>
        {onboardingData.map((_, index) => {
          return (
            <Animated.View
              key={index.toString()}
              style={[styles.dot, dotStyles[index]]}
            />
          );
        })}
      </View>

      <MotiView
        from={{ opacity: 0, translateY: 50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 700, delay: 700 }}
        style={styles.bottomContainer}
      >
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <LinearGradient
            colors={onboardingData[currentIndex].gradient}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.buttonText}>
              {currentIndex === onboardingData.length - 1
                ? "Get Started"
                : "Next"}
            </Text>
            <MaterialCommunityIcons
              name={
                currentIndex === onboardingData.length - 1
                  ? "arrow-right-circle"
                  : "arrow-right"
              }
              size={24}
              color="white"
              style={styles.buttonIcon}
            />
          </LinearGradient>
        </TouchableOpacity>
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    fontSize: 16,
    color: lightTheme.colors.textSecondary,
    fontWeight: "600",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  textContainer: {
    alignItems: "center",
    maxWidth: "80%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: lightTheme.colors.text,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: lightTheme.colors.textSecondary,
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: lightTheme.colors.textSecondary,
    marginHorizontal: 4,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  button: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonIcon: {
    marginLeft: 8,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default GetStartedScreen;
