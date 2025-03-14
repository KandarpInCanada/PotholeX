import { Stack } from "expo-router";
import React from "react";
import { View, ActivityIndicator } from "react-native";
import { AuthProvider, useAuth } from "../context/auth-context";
import { Provider as PaperProvider } from "react-native-paper";
import { lightTheme } from "./theme";

function RootLayoutInner() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      {!user ? (
        <>
          <Stack.Screen name="(screens)/(onboarding)/get-started" />
          <Stack.Screen name="(screens)/(auth)" />
        </>
      ) : (
        <Stack.Screen name="(screens)/(dashboard)" />
      )}
    </Stack>
  );
}

// Wrap the entire app with AuthProvider
export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider theme={lightTheme}>
        <RootLayoutInner />
      </PaperProvider>
    </AuthProvider>
  );
}
