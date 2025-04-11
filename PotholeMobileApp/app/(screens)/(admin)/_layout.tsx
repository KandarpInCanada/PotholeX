/**
 * Admin Layout Component
 *
 * This component provides the layout and tab navigation for the admin section of the app.
 * It includes tabs for Dashboard, Reports, Users, Notifications, and Settings.
 *
 * Key features:
 * - Tab-based navigation with icons and labels
 * - Authentication check to restrict access to admin users only
 * - Smooth animations for tab transitions
 * - Notification badges for unread notifications
 */

"use client";

import { StyleSheet, View, Dimensions } from "react-native";
import { Tabs } from "expo-router";
import { useAuth } from "../../../context/auth-context";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StatusBar } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NotificationBadge from "../../components/admin-components/notification-badge";

const { width } = Dimensions.get("window");

export default function AdminLayout() {
  // Get the isAdmin state from auth context
  const { isAdmin } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(activeIndex);
  const [currentRouteName, setCurrentRouteName] = useState<string | undefined>(
    undefined
  );
  const [isTabActive, setIsTabActive] = useState<boolean[]>(
    Array(4).fill(false)
  );

  // Animation values for tab transitions
  const tabBarOpacity = useSharedValue(0);
  const tabBarTranslateY = useSharedValue(20);

  /**
   * Redirect non-admin users away from admin screens and
   * animate tab bar entrance when admin is confirmed
   */
  useEffect(() => {
    if (!isAdmin) {
      router.replace("/(screens)/(auth)/login");
    } else {
      // Animate tab bar entrance when admin is confirmed
      tabBarOpacity.value = withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });
      tabBarTranslateY.value = withTiming(0, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [isAdmin, router]);

  /**
   * Set status bar to match admin header
   */
  useEffect(() => {
    StatusBar.setBarStyle("dark-content");
    StatusBar.setBackgroundColor("#F0F4FF"); // Updated to match new background color
  }, []);

  /**
   * Update active tab index when route changes
   */
  useEffect(() => {
    if (currentRouteName) {
      const index = [
        "portal",
        "report-list",
        "users",
        "profile-settings",
      ].indexOf(currentRouteName);
      if (index !== -1) {
        setActiveIndex(index);
        activeIndexRef.current = index;
        const newIsTabActive = [...Array(4).fill(false)];
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
    <>
      <Animated.View style={[styles.tabBarContainer, tabBarAnimatedStyle]}>
        <Tabs
          screenOptions={({ route }) => {
            return {
              tabBarIcon: ({ focused, color, size }) => {
                // Define the icon name based on the route and focused state
                let iconName: any; // Use 'any' type to bypass TypeScript checking for dynamic icon names
                if (route.name === "portal") {
                  iconName = focused ? "shield" : "shield-outline";
                } else if (route.name === "report-list") {
                  iconName = focused
                    ? "document-text"
                    : "document-text-outline";
                } else if (route.name === "users") {
                  iconName = focused ? "people" : "people-outline";
                } else if (route.name === "profile-settings") {
                  iconName = focused ? "settings" : "settings-outline";
                } else if (route.name === "admin-notifications") {
                  iconName = focused
                    ? "notifications"
                    : "notifications-outline";
                } else {
                  iconName = focused ? "alert-circle" : "alert-circle-outline"; // Default icon
                }

                // For notifications tab, include badge
                return (
                  <View style={{ position: "relative" }}>
                    <Ionicons name={iconName} size={size} color={color} />
                    {route.name === "admin-notifications" && (
                      <NotificationBadge isAdmin={true} />
                    )}
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
                  "portal",
                  "report-list",
                  "users",
                  "profile-settings",
                ].indexOf(routeName);

                return (
                  <Animated.View
                    style={[
                      styles.tabButton,
                      isActive && styles.activeTabButton,
                    ]}
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
            name="portal"
            options={{
              title: "Dashboard",
            }}
          />
          <Tabs.Screen
            name="report-list"
            options={{
              title: "Reports",
            }}
          />
          <Tabs.Screen
            name="users"
            options={{
              title: "Users",
            }}
          />
          <Tabs.Screen
            name="admin-notifications"
            options={{
              title: "Notifications",
            }}
          />
          <Tabs.Screen
            name="profile-settings"
            options={{
              title: "Settings",
            }}
          />
        </Tabs>
      </Animated.View>
    </>
  );
}

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
