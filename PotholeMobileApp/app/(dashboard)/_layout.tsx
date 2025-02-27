import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function DashboardLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "AddReport") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "ReportList") {
            iconName = focused ? "document-text" : "document-text-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          } else if (route.name === "Map") {
            iconName = focused ? "map" : "map-outline";
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        headerShown: false, // Hide header globally
      })}
    >
      <Tabs.Screen name="Home" options={{ title: "Home", headerShown: false }} />
      <Tabs.Screen name="AddReport" options={{ title: "Add Report", headerShown: false }} />
      <Tabs.Screen name="ReportList" options={{ title: "Reports", headerShown: false }} />
      <Tabs.Screen name="Map" options={{ title: "Map", headerShown: false }} /> {/* New Map tab */}
      <Tabs.Screen name="Profile" options={{ title: "Profile", headerShown: false }} />
    </Tabs>
  );
}