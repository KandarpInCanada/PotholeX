"use client";

import { StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { useAuth } from "../../../context/auth-context";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StatusBar } from "react-native";

export default function AdminLayout() {
  // Get the isAdmin state from auth context
  const { isAdmin } = useAuth();
  const router = useRouter();

  // Redirect non-admin users away from admin screens
  useEffect(() => {
    if (!isAdmin) {
      router.replace("/(screens)/(auth)/login");
    }
  }, [isAdmin, router]);

  // Set status bar to match admin header
  useEffect(() => {
    StatusBar.setBarStyle("dark-content");
    StatusBar.setBackgroundColor("#FFFFFF");
  }, []);

  // Admin-specific tab navigation
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "portal") {
            iconName = focused ? "shield" : "shield-outline";
          } else if (route.name === "report-list") {
            iconName = focused ? "document-text" : "document-text-outline";
          } else if (route.name === "users") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "profile-settings") {
            iconName = focused ? "settings" : "settings-outline";
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarStyle: [
          styles.tabBar,
          Platform.OS === "ios" ? styles.iosTabBar : styles.androidTabBar,
        ],
        tabBarItemStyle: styles.tabBarItem,
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#64748B",
        tabBarLabelStyle: { display: "none" }, // Hide the labels
        headerShown: false,
      })}
    >
      <Tabs.Screen
        name="portal"
        options={{
          title: "Dashboard",
          tabBarLabel: "", // Empty label
        }}
      />
      <Tabs.Screen
        name="report-list"
        options={{
          title: "Reports",
          tabBarLabel: "", // Empty label
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          tabBarLabel: "", // Empty label
        }}
      />
      <Tabs.Screen
        name="profile-settings"
        options={{
          title: "Settings",
          tabBarLabel: "", // Empty label
        }}
      />
      {/* Add notifications screen but hide it from tab bar */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarLabel: "", // Empty label
          href: null, // This prevents the tab from being accessible via the tab bar
        }}
      />
      {/* Hide any other screens from the tab bar */}
      <Tabs.Screen
        name="dashboard"
        options={{
          href: null, // This prevents the tab from being accessible via the tab bar
        }}
      />
      {/* Hide the original separate screens */}
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

// Update the tabBar style to make it more compact and properly sized
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#ffffff",
    borderTopWidth: 0,
    paddingBottom: Platform.OS === "ios" ? 10 : 5,
    height: Platform.OS === "ios" ? 70 : 50,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 10,
        borderTopColor: "transparent",
      },
    }),
  },
  iosTabBar: {
    paddingBottom: 10,
  },
  androidTabBar: {
    paddingBottom: 5,
  },
  tabBarItem: {
    padding: 4,
    margin: 4,
    borderRadius: 12,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "500",
    paddingBottom: 2,
  },
});
