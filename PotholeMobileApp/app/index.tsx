"use client";

import { useState } from "react";
import { Redirect } from "expo-router";
import LottieSplash from "../app/(screens)/(onboarding)/lottie-splash";

export default function Index() {
  const [splashFinished, setSplashFinished] = useState(false);

  const handleSplashFinish = () => {
    setSplashFinished(true);
  };

  // Show splash screen
  if (!splashFinished) {
    return <LottieSplash onAnimationFinish={handleSplashFinish} />;
  }

  // After splash screen, go directly to login
  return <Redirect href="(screens)/(auth)/login" />;
}
