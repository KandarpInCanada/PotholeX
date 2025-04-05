"use client";

import { Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "react-native";

export default function AuthLayout() {
  // Set status bar to match auth screens
  useEffect(() => {
    StatusBar.setBarStyle("dark-content");
    StatusBar.setBackgroundColor("#F8FAFC");
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      <Stack.Screen
        name="login"
        options={{ title: "Login", animation: "none" }}
      />
      <Stack.Screen
        name="register"
        options={{ title: "Register", animation: "none" }}
      />
    </Stack>
  );
}
