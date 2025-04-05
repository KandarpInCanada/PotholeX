"use client";

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, StatusBar } from "react-native";
import { useEffect } from "react";

// Regular user tabs only - admin screens are now completely separate
export default function DashboardLayout() {
  // Set status bar to match dashboard header
  useEffect(() => {
    StatusBar.setBarStyle("dark-content");
    StatusBar.setBackgroundColor("#F8FAFC");
  }, []);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
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
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      })}
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
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
        }}
      />
    </Tabs>
  );
}

// Styles with platform-specific considerations
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#ffffff",
    borderTopWidth: 0,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    height: Platform.OS === "ios" ? 90 : 60,
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
    paddingBottom: 20,
  },
  androidTabBar: {
    paddingBottom: 10,
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
