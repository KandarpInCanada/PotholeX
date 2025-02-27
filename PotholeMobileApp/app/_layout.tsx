import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { firebase_auth } from "../firebaseConfig";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebase_auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
          <Stack.Screen name="/onboarding/GetStarted" />
          <Stack.Screen name="(auth)" />
        </>
      ) : (
        <Stack.Screen name="(dashboard)" />
      )}
    </Stack>
  );
}