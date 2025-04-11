/**
 * App Entry Point
 *
 * This is the main entry point for the application. It redirects to the
 * root layout which will handle showing the splash screen and navigation.
 */
"use client";

import { Redirect } from "expo-router";

export default function Index() {
  // Redirect to the root layout which will handle the splash screen
  return <Redirect href="/" />;
}
