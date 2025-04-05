"use client";

import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/auth-context";

export default function Index() {
  const { user, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const seen = await AsyncStorage.getItem("hasSeenOnboarding");
      setHasSeenOnboarding(seen === "true");
      setIsLoading(false);
    };

    checkOnboardingStatus();
  }, []);

  if (isLoading) return null; // Prevent flickering while checking storage

  if (!hasSeenOnboarding) {
    return <Redirect href="(screens)/(onboarding)/get-started" />;
  }

  // If user is authenticated, redirect based on admin status
  if (user) {
    if (isAdmin) {
      return <Redirect href="(screens)/(admin)/portal" />;
    } else {
      return <Redirect href="(screens)/(dashboard)/home" />;
    }
  }

  // If not authenticated, redirect to login
  return <Redirect href="(screens)/(auth)/login" />;
}
