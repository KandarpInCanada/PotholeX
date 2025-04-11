"use client";

// Update the StatusBar component to ensure it matches the header background color
import { Stack } from "expo-router";
import { View, ActivityIndicator, StatusBar, Platform } from "react-native";
import { AuthProvider, useAuth } from "../context/auth-context";
import { Provider as PaperProvider } from "react-native-paper";
import { ThemeProvider, useTheme } from "../context/theme-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { registerForPushNotificationsAsync } from "../lib/notifications";

// Update the RootLayoutInner component to handle auth state changes more reliably
function RootLayoutInner() {
  const { user, loading, isAdmin } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
  const navigationPerformedRef = useRef(false);

  // Update StatusBar based on theme
  useEffect(() => {
    StatusBar.setBarStyle(isDarkMode ? "light-content" : "dark-content");
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor(
        isDarkMode ? theme.colors.background : "#FFFFFF"
      );
    }
  }, [isDarkMode, theme]);

  // Effect to handle navigation based on auth state
  useEffect(() => {
    if (!loading) {
      // Reset the navigation flag when auth state changes
      navigationPerformedRef.current = false;
    }
  }, [loading]);

  // Separate effect for navigation to avoid race conditions
  useEffect(() => {
    const handleNavigation = async () => {
      if (!loading && !navigationPerformedRef.current) {
        navigationPerformedRef.current = true;
        console.log(
          "Navigation state: user=",
          user ? "logged in" : "logged out",
          "isAdmin=",
          isAdmin
        );

        if (!user) {
          console.log("Navigating to login screen");
          router.replace("/(screens)/(auth)/login");
        } else if (isAdmin) {
          console.log("Navigating to admin portal");
          router.replace("/(screens)/(admin)/portal");
        } else {
          console.log("Navigating to user dashboard");
          router.replace("/(screens)/(dashboard)/home");
        }
      }
    };

    handleNavigation();
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      {!user ? (
        // Not logged in - show onboarding and auth screens
        <>
          <Stack.Screen name="(screens)/(onboarding)/lottie-splash" />
          <Stack.Screen name="(screens)/(auth)" />
        </>
      ) : isAdmin ? (
        // Admin user - ONLY show admin screens
        <Stack.Screen name="(screens)/(admin)" />
      ) : (
        // Regular user - ONLY show dashboard screens
        <Stack.Screen name="(screens)/(dashboard)" />
      )}
    </Stack>
  );
}

// Wrap the entire app with AuthProvider and ThemeProvider
export default function RootLayout() {
  useEffect(() => {
    // Register for push notifications when the app starts
    const registerForNotifications = async () => {
      try {
        await registerForPushNotificationsAsync();
      } catch (error) {
        console.error("Error registering for push notifications:", error);
      }
    };

    registerForNotifications();
  }, []);
  return (
    <AuthProvider>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <InnerApp />
        </GestureHandlerRootView>
      </ThemeProvider>
    </AuthProvider>
  );
}

// This component uses the theme context
function InnerApp() {
  const { theme } = useTheme();

  return (
    <PaperProvider theme={theme}>
      <RootLayoutInner />
    </PaperProvider>
  );
}
