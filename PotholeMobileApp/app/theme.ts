import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

// Dark Theme
const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#00e0ff",
    background: "#121212",
    surface: "#1E1E1E",
    textSecondary: "#B0B0B0",
    text: "#ffffff",
    onSurface: "#ffffff",
    placeholder: "#aaa",
    outline: "#00e0ff",
    buttonBackground: "#00e0ff",
    buttonText: "#121212",
  },
};

// Light Theme
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#6A5AE0", // Soft pastel purple
    background: "#F8F7FF", // Very light background
    surface: "#FFFFFF", // White for card surfaces
    text: "#2D2D2D", // Dark text for readability
    textSecondary: "#707070", // Muted secondary text
    onSurface: "#444", // Darker text on surfaces
    placeholder: "#BDBDBD", // Muted input placeholder
    outline: "#6A5AE0", // Accent color for outlines
    buttonBackground: "#FFD700", // Soft yellow for CTA buttons
    buttonText: "#2D2D2D", // Dark text on buttons
  },
};

export { lightTheme, darkTheme }; // ✅ Correctly exporting both themes