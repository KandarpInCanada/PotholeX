import { MD3LightTheme, MD3DarkTheme } from "react-native-paper"

// Light Theme with blue color scheme
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#3B82F6", // Blue - main brand color
    secondary: "#60A5FA", // Lighter blue - secondary accent
    tertiary: "#0EA5E9", // Sky blue - tertiary accent

    background: "#F8FAFC", // Light background
    surface: "#FFFFFF", // White surface for cards
    surfaceVariant: "#F1F5F9", // Light gray for variant surfaces

    text: "#0F172A", // Darker text for better visibility
    textSecondary: "#334155", // Darker secondary text
    onSurface: "#0F172A", // Darker text on surfaces
    onSurfaceVariant: "#334155", // Darker text on variant surfaces
    inputText: "#0F172A", // Very dark slate for input text

    placeholder: "#64748B", // Slate 500 - placeholder text (darker for better visibility)
    outline: "#CBD5E1", // Slate 300 - borders

    buttonBackground: "#3B82F6", // Blue - button background
    buttonText: "#FFFFFF", // White text for buttons

    error: "#EF4444", // Red for error states
    success: "#10B981", // Green for success states
    warning: "#F59E0B", // Amber for warnings
    info: "#3B82F6", // Blue for information

    link: "#3B82F6", // Blue for links
    inputBackground: "#F8FAFC", // Very light gray for input backgrounds
    divider: "#E2E8F0", // Light gray for dividers

    // Additional accent colors
    accent1: "#8B5CF6", // Violet
    accent2: "#F43F5E", // Rose
    accent3: "#0EA5E9", // Sky
  },
  roundness: 16, // Increased roundness for a more curved look
  fonts: {
    ...MD3LightTheme.fonts,
  },
}

// Also update the dark theme text colors for consistency
const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#60A5FA", // Lighter blue for dark mode
    secondary: "#93C5FD", // Even lighter blue for dark mode
    tertiary: "#38BDF8", // Lighter sky blue for dark mode

    background: "#0F172A", // Dark slate background
    surface: "#1E293B", // Slate 800 surface
    surfaceVariant: "#334155", // Slate 700 for variant surfaces

    text: "#F8FAFC", // Slate 50 - primary text
    textSecondary: "#E2E8F0", // Slate 200 - secondary text (lighter for better visibility in dark mode)
    onSurface: "#F8FAFC", // Slate 50 - text on surfaces
    onSurfaceVariant: "#E2E8F0", // For input labels and other variant surfaces

    placeholder: "#94A3B8", // Slate 400 - placeholder text
    outline: "#475569", // Slate 600 - borders

    buttonBackground: "#60A5FA", // Lighter blue - button background
    buttonText: "#FFFFFF", // White text for buttons

    error: "#F87171", // Lighter red for dark mode
    success: "#34D399", // Lighter green for dark mode
    warning: "#FBBF24", // Lighter amber for dark mode
    info: "#60A5FA", // Lighter blue for dark mode

    link: "#60A5FA", // Lighter blue for links
    inputBackground: "#334155", // Slate 700 for input backgrounds
    divider: "#475569", // Slate 600 for dividers

    // Additional accent colors
    accent1: "#A78BFA", // Lighter violet for dark mode
    accent2: "#FB7185", // Lighter rose for dark mode
    accent3: "#38BDF8", // Lighter sky for dark mode
  },
  roundness: 16, // Increased roundness for dark theme as well
  fonts: {
    ...MD3DarkTheme.fonts,
  },
}

export { lightTheme, darkTheme }

