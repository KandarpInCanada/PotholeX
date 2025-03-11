import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet } from "react-native";

export default function DashboardLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        // Icon configuration
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
        // Platform-specific tab bar styling
        tabBarStyle: [
          styles.tabBar,
          Platform.OS === "ios" ? styles.iosTabBar : styles.androidTabBar,
        ],
        tabBarItemStyle: styles.tabBarItem,
        tabBarActiveTintColor: "#007AFF", // Active icon/text color
        tabBarInactiveTintColor: "#64748b", // Inactive icon/text color
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      })}
    >
      {/* Tab Screens */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarLabel: "Home",
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
        name="report-list"
        options={{
          title: "Reports",
          tabBarLabel: "Reports",
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
    paddingBottom: Platform.OS === "ios" ? 20 : 10, // Extra bottom padding for iPhone
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
    paddingBottom: 20, // Additional bottom padding for iPhone home indicator
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
