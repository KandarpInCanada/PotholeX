"use client";

import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/auth-context";
import { checkAdminStatus } from "./services/admin-service"; // Import directly

export default function Index() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const seen = await AsyncStorage.getItem("hasSeenOnboarding");
      setHasSeenOnboarding(seen === "true");

      // If user is logged in, check admin status directly
      if (user) {
        try {
          const adminStatus = await checkAdminStatus(user.id);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      }

      setIsLoading(false);
    };

    checkOnboardingStatus();
  }, [user]);

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
