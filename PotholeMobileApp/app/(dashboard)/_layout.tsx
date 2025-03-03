import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function DashboardLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        // Icon configuration
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "AddReport") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "ReportList") {
            iconName = focused ? "document-text" : "document-text-outline";
          } else if (route.name === "map") {
            iconName = focused ? "map" : "map-outline";
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },

        // Tab bar styling
        tabBarStyle: {
          backgroundColor: "#ffffff", // Background color
          borderTopWidth: 0, // Remove top border
          paddingBottom: 4, // Bottom padding
          elevation: 10, // Android shadow
          shadowColor: "#000000", // iOS shadow
          shadowOffset: { width: 0, height: -2 }, // iOS shadow
          shadowOpacity: 0.1, // iOS shadow
          shadowRadius: 4, // iOS shadow
        },
        tabBarItemStyle: {
          padding: 4, // Individual tab item padding
          margin: 4, // Space between items
          borderRadius: 12, // Rounded corners
        },
        tabBarActiveTintColor: "#007AFF", // Active icon/text color
        tabBarInactiveTintColor: "#64748b", // Inactive icon/text color
        tabBarLabelStyle: {
          fontSize: 12, // Label text size
          fontWeight: "500", // Label text weight
          paddingBottom: 2, // Space between icon and text
        },
        headerShown: false,
      })}
    >
      {/* Your tab screens */}
      <Tabs.Screen
        name="home"
        options={{ title: "Home", headerShown: false }}
      />
      <Tabs.Screen
        name="AddReport"
        options={{ title: "Add Report", headerShown: false }}
      />
      <Tabs.Screen
        name="ReportList"
        options={{ title: "Reports", headerShown: false }}
      />
      <Tabs.Screen name="map" options={{ title: "Map", headerShown: false }} />
    </Tabs>
  );
}
