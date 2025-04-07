"use client";

// Update the StatusBar component to ensure it matches the header background color
import { Stack } from "expo-router";
import { View, ActivityIndicator, StatusBar } from "react-native";
import { AuthProvider, useAuth } from "../context/auth-context";
import { Provider as PaperProvider } from "react-native-paper";
import { ThemeProvider, useTheme } from "../context/theme-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { useEffect } from "react";

// Update the RootLayoutInner component to handle auth state changes more reliably
function RootLayoutInner() {
  const { user, loading, isAdmin } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  // Effect to handle navigation based on auth state
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/(screens)/(auth)/login");
      } else if (isAdmin) {
        router.replace("/(screens)/(admin)/portal");
      }
    }
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
          <Stack.Screen name="(screens)/(onboarding)/get-started" />
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
  return (
    <AuthProvider>
      <ThemeProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
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
