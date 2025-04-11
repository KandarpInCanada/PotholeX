/**
 * Theme Context
 *
 * This module provides theme management for the application, handling both light and dark modes.
 * It automatically detects the device's preferred color scheme and allows manual theme toggling.
 *
 * Features:
 * - Device color scheme detection and synchronization
 * - Theme toggle functionality
 * - Context provider for theme access throughout the app
 * - Custom hook for easy theme consumption
 */

"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { lightTheme, darkTheme, type CustomTheme } from "../app/theme";

/**
 * Theme context type definition
 * Provides the current theme, dark mode status, and toggle function
 */
type ThemeContextType = {
  theme: CustomTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
});

/**
 * ThemeProvider component
 *
 * Wraps the application to provide theme context to all child components.
 * Handles theme state management and synchronization with device preferences.
 *
 * @param {React.ReactNode} children - Child components that will have access to the theme context
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");

  useEffect(() => {
    setIsDarkMode(colorScheme === "dark");
  }, [colorScheme]);

  /**
   * Toggle between light and dark themes
   * This allows users to override their device's default preference
   */
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to use the theme context
 *
 * Provides easy access to the current theme, dark mode status, and toggle function.
 * Throws an error if used outside of a ThemeProvider.
 *
 * @returns {ThemeContextType} The theme context value
 */
export const useTheme = () => useContext(ThemeContext);
