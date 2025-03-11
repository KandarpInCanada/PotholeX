import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const isAuthenticated = false; // Replace with real authentication logic

export default function Index() {
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

  return (
    <Redirect
      href={
        isAuthenticated
          ? "(screens)/(dashboard)/home"
          : "(screens)/(auth)/login"
      }
    />
  );
}
