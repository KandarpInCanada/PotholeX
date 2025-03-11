import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";

// Light Theme
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#4B6BFB", // Blue color from the login screen
    background: "#FFFFFF", // Pure white background
    surface: "#FFFFFF",
    text: "#333333", // Dark text for readability
    textSecondary: "#71717A", // Subtle gray for secondary text
    onSurface: "#333333",
    placeholder: "#A1A1AA", // Lighter gray for placeholders
    outline: "#E4E4E7", // Very light gray for borders
    buttonBackground: "#FFD60A", // Yellow button color from login screen
    buttonText: "#18181B", // Dark text for buttons
    error: "#EF4444", // Red for error states
    success: "#10B981", // Green for success states
    link: "#4B6BFB", // Blue for links and interactive elements
    inputBackground: "#F8FAFC", // Light gray for input backgrounds
    divider: "#E2E8F0", // Light gray for dividers
  },
  roundness: 12, // Rounded corners matching the login design
  fonts: {
    ...MD3LightTheme.fonts,
    // Assuming system fonts, but you can specify custom fonts if needed
  },
};

// Dark Theme
const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#4B6BFB",
    background: "#18181B",
    surface: "#27272A",
    text: "#FFFFFF",
    textSecondary: "#A1A1AA",
    onSurface: "#FFFFFF",
    placeholder: "#71717A",
    outline: "#3F3F46",
    buttonBackground: "#FFD60A",
    buttonText: "#18181B",
    error: "#EF4444",
    success: "#10B981",
    link: "#4B6BFB",
    inputBackground: "#27272A",
    divider: "#3F3F46",
  },
  roundness: 12,
  fonts: {
    ...MD3DarkTheme.fonts,
  },
};

export { lightTheme, darkTheme };