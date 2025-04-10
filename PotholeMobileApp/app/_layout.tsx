/**
 * Root Layout Component
 *
 * This component serves as the root layout for the entire application.
 * It wraps the app with necessary providers and handles authentication state,
 * navigation based on auth status, and app initialization.
 *
 * Key responsibilities:
 * - Providing auth context
 * - Providing theme context
 * - Handling navigation based on authentication state
 * - Managing session timeouts
 * - Registering for push notifications
 * - Showing splash screen on every app launch
 */
"use client";

import { Slot } from "expo-router";
import {
  View,
  ActivityIndicator,
  StatusBar,
  Platform,
  AppState,
} from "react-native";
import { AuthProvider, useAuth } from "../context/auth-context";
import { Provider as PaperProvider } from "react-native-paper";
import { ThemeProvider, useTheme } from "../context/theme-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { registerForPushNotificationsAsync } from "../lib/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieSplash from "./(screens)/(onboarding)/lottie-splash";

// Update the RootLayoutInner component to handle auth state changes more reliably
function RootLayoutInner() {
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
  const navigationPerformedRef = useRef(false);
  const lastActivityTimeRef = useRef(Date.now());
  const [authState, setAuthState] = useState<{
    user: any | null;
    loading: boolean;
    isAdmin: boolean;
  }>({
    user: null,
    loading: true,
    isAdmin: false,
  });
  const { user, loading, isAdmin, signOut } = useAuth(); // Moved useAuth here

  // Add state for splash screen
  const [showSplash, setShowSplash] = useState(true);
  const appState = useRef(AppState.currentState);

  // Handle app state changes to show splash when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // When app comes from background to active state, show splash
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        setShowSplash(true);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Handle splash screen completion
  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  useEffect(() => {
    setAuthState({ user, loading, isAdmin });
  }, [user, loading, isAdmin]);

  // Update StatusBar based on theme
  useEffect(() => {
    StatusBar.setBarStyle(isDarkMode ? "light-content" : "dark-content");
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor(
        isDarkMode ? theme.colors.background : "#FFFFFF"
      );
    }
  }, [isDarkMode, theme]);

  // Add session activity tracking
  useEffect(() => {
    const updateLastActivity = () => {
      lastActivityTimeRef.current = Date.now();
      AsyncStorage.setItem(
        "last_activity_time",
        lastActivityTimeRef.current.toString()
      );
    };

    // Update last activity time when component mounts
    updateLastActivity();

    // Set up interval to check for session timeout
    const checkSessionTimeout = async () => {
      const lastActivityStr = await AsyncStorage.getItem("last_activity_time");
      if (lastActivityStr) {
        const lastActivity = Number.parseInt(lastActivityStr);
        const currentTime = Date.now();
        const inactiveTime = currentTime - lastActivity;

        // If inactive for more than 1 hour (3600000 ms), sign out
        if (inactiveTime > 3600000 && authState.user) {
          console.log("Session timeout due to inactivity, signing out...");
          await signOut();
        }
      }
    };

    const interval = setInterval(checkSessionTimeout, 60000); // Check every minute

    return () => {
      clearInterval(interval);
    };
  }, [authState.user, signOut]);

  // Effect to handle navigation based on auth state
  useEffect(() => {
    if (!authState.loading && !showSplash) {
      // Reset the navigation flag when auth state changes
      navigationPerformedRef.current = false;
    }
  }, [authState.loading, showSplash]);

  // Separate effect for navigation to avoid race conditions
  useEffect(() => {
    const handleNavigation = async () => {
      if (!authState.loading && !showSplash) {
        navigationPerformedRef.current = true;
        console.log(
          "Navigation state: user=",
          authState.user ? "logged in" : "logged out",
          "isAdmin=",
          authState.isAdmin
        );

        if (!authState.user) {
          console.log("Navigating to login screen");
          router.replace("/(screens)/(auth)/login");
        } else if (authState.isAdmin) {
          console.log("Navigating to admin portal");
          router.replace("/(screens)/(admin)/portal");
        } else {
          console.log("Navigating to user dashboard");
          router.replace("/(screens)/(dashboard)/home");
        }
      }
    };

    handleNavigation();
  }, [
    authState.user,
    authState.isAdmin,
    authState.loading,
    router,
    showSplash,
  ]);

  // Show splash screen
  if (showSplash) {
    return <LottieSplash onAnimationFinish={handleSplashFinish} />;
  }

  // Show loading indicator while auth is being determined
  if (authState.loading) {
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

  // Use Slot instead of Stack to render children
  return <Slot />;
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
