import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function DashboardLayout() {
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
          } else if (route.name === "profile") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          } else if (route.name === "map") {
            iconName = focused ? "map" : "map-outline";
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        headerShown: false, // Hide header globally
      })}
    >
      <Tabs.Screen name="home" options={{ title: "Home", headerShown: false }} />
      <Tabs.Screen name="add-report" options={{ title: "Add Report", headerShown: false }} />
      <Tabs.Screen name="report-list" options={{ title: "Reports", headerShown: false }} />
      <Tabs.Screen name="map" options={{ title: "Map", headerShown: false }} /> {/* New Map tab */}
      <Tabs.Screen name="profile" options={{ title: "Profile", headerShown: false }} />
    </Tabs>
  );
}