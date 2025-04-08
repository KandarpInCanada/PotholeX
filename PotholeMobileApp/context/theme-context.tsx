"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { lightTheme, darkTheme, type CustomTheme } from "../app/theme";

// Define the theme context type using our CustomTheme
type ThemeContextType = {
  theme: CustomTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
};

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
});

// Create a provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Get the device color scheme
  const colorScheme = useColorScheme();

  // Initialize state based on device preference
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");

  // Update theme when device preference changes
  useEffect(() => {
    setIsDarkMode(colorScheme === "dark");
  }, [colorScheme]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Get the current theme
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme
export const useTheme = () => useContext(ThemeContext);
