"use client";

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Platform,
  StyleSheet,
  StatusBar,
  View,
  Dimensions,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import NotificationBadge from "../../components/dashboard-components/notification-badge";

const { width } = Dimensions.get("window");

// Regular user tabs only - admin screens are now completely separate
export default function DashboardLayout() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(activeIndex);
  const [currentRouteName, setCurrentRouteName] = useState<string | undefined>(
    undefined
  );
  const [isTabActive, setIsTabActive] = useState<boolean[]>(
    Array(6).fill(false)
  );

  // Animation values for tab transitions
  const tabBarOpacity = useSharedValue(0);
  const tabBarTranslateY = useSharedValue(20);

  // Set status bar to match dashboard header
  useEffect(() => {
    StatusBar.setBarStyle("dark-content");
    StatusBar.setBackgroundColor("#F8FAFC");

    // Animate tab bar entrance
    tabBarOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    tabBarTranslateY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  useEffect(() => {
    if (currentRouteName) {
      const index = [
        "home",
        "report-list",
        "add-report",
        "map",
        "notifications",
        "profile",
      ].indexOf(currentRouteName);
      if (index !== -1) {
        setActiveIndex(index);
        activeIndexRef.current = index;
        const newIsTabActive = [...Array(6).fill(false)];
        newIsTabActive[index] = true;
        setIsTabActive(newIsTabActive);
      }
    }
  }, [currentRouteName]);

  // Animated styles for tab bar
  const tabBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: tabBarOpacity.value,
      transform: [{ translateY: tabBarTranslateY.value }],
    };
  });

  return (
    <Animated.View style={[styles.tabBarContainer, tabBarAnimatedStyle]}>
      <Tabs
        screenOptions={({ route }) => {
          return {
            tabBarIcon: ({ focused, color, size }) => {
              // Define the icon name based on the route and focused state
              let iconName;
              if (route.name === "home") {
                iconName = focused ? "home" : "home-outline";
              } else if (route.name === "add-report") {
                iconName = focused ? "add-circle" : "add-circle-outline";
              } else if (route.name === "report-list") {
                iconName = focused ? "document-text" : "document-text-outline";
              } else if (route.name === "map") {
                iconName = focused ? "map" : "map-outline";
              } else if (route.name === "profile") {
                iconName = focused ? "person" : "person-outline";
              } else if (route.name === "notifications") {
                iconName = focused ? "notifications" : "notifications-outline";
              }

              // For notifications tab, include badge
              return (
                <View style={{ position: "relative" }}>
                  <Ionicons name={iconName as any} size={size} color={color} />
                  {route.name === "notifications" && <NotificationBadge />}
                </View>
              );
            },
            tabBarStyle: [
              styles.tabBar,
              { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 },
              Platform.OS === "ios" ? styles.iosTabBar : styles.androidTabBar,
            ],
            tabBarItemStyle: styles.tabBarItem,
            tabBarActiveTintColor: "#3B82F6",
            tabBarInactiveTintColor: "#64748B",
            tabBarLabelStyle: styles.tabBarLabel,
            headerShown: false,
            tabBarBackground: () => (
              <View style={styles.tabBarBackground}>
                <View style={styles.tabBarBackgroundInner} />
              </View>
            ),
            tabBarButton: (props) => {
              const { onPress, children, accessibilityState } = props;
              const isActive = accessibilityState?.selected;
              const routeName = route.name;
              const index = [
                "home",
                "report-list",
                "add-report",
                "map",
                "notifications",
                "profile",
              ].indexOf(routeName);

              return (
                <Animated.View
                  style={[styles.tabButton, isActive && styles.activeTabButton]}
                >
                  <Animated.View
                    style={[
                      styles.tabButtonInner,
                      isActive && styles.activeTabButtonInner,
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.tabButtonContent,
                        isActive && {
                          backgroundColor: "rgba(59, 130, 246, 0.1)",
                        },
                      ]}
                    >
                      <Animated.View
                        style={[
                          styles.tabButtonWrapper,
                          { opacity: isActive ? 1 : 0.8 },
                        ]}
                        onTouchEnd={onPress}
                      >
                        {children}
                      </Animated.View>
                    </Animated.View>
                  </Animated.View>
                </Animated.View>
              );
            },
          };
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarLabel: "Home",
          }}
        />
        <Tabs.Screen
          name="report-list"
          options={{
            title: "Reports",
            tabBarLabel: "Reports",
          }}
        />
        <Tabs.Screen
          name="add-report"
          options={{
            title: "Add Report",
            headerShown: false,
            tabBarLabel: "Add Report",
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: "Map",
            headerShown: false,
            tabBarLabel: "Map",
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: "Notifications",
            tabBarLabel: "Notifications",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarLabel: "Profile",
          }}
        />
      </Tabs>
    </Animated.View>
  );
}

// Enhanced styles for a more modern tab bar
const styles = StyleSheet.create({
  tabBarContainer: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    position: "absolute",
    elevation: 0,
    height: Platform.OS === "ios" ? 85 : 70,
    paddingTop: 5,
    zIndex: 1000, // Set a specific z-index that's lower than the report details sheet
  },
  iosTabBar: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  androidTabBar: {
    elevation: 8,
  },
  tabBarBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
  tabBarBackgroundInner: {
    backgroundColor: "#FFFFFF",
    height: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBarItem: {
    padding: 0,
    margin: 0,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  activeTabButton: {
    transform: [{ scale: 1.05 }],
  },
  tabButtonInner: {
    width: "90%",
    alignItems: "center",
  },
  activeTabButtonInner: {
    transform: [{ translateY: -2 }],
  },
  tabButtonContent: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 80,
  },
  tabButtonWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});
