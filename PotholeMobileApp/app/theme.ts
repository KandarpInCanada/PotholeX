import { MD3LightTheme, MD3DarkTheme } from "react-native-paper"
import type { MD3Theme } from "react-native-paper"

// Create a complete custom colors type that includes all MD3Colors properties
// plus our additional custom properties
export interface CustomColors {
  // Standard MD3 colors that we need to include
  primary: string
  onPrimary: string
  primaryContainer: string
  onPrimaryContainer: string
  secondary: string
  onSecondary: string
  secondaryContainer: string
  onSecondaryContainer: string
  tertiary: string
  onTertiary: string
  tertiaryContainer: string
  onTertiaryContainer: string
  error: string
  onError: string
  errorContainer: string
  onErrorContainer: string
  background: string
  onBackground: string
  surface: string
  onSurface: string
  surfaceVariant: string
  onSurfaceVariant: string
  outline: string
  outlineVariant: string
  shadow: string
  scrim: string
  inverseSurface: string
  inverseOnSurface: string
  inversePrimary: string
  surfaceDisabled: string
  onSurfaceDisabled: string
  backdrop: string
  
  // Our custom colors
  text: string
  textSecondary: string
  buttonBackground: string
  buttonText: string
  inputText: string
  inputBackground: string
  link: string
  divider: string
  placeholder: string
  success: string
  warning: string
  info: string
  accent1: string
  accent2: string
  accent3: string
  
  // Include elevation to match MD3Theme
  elevation: {
    level0: string
    level1: string
    level2: string
    level3: string
    level4: string
    level5: string
  }
}

// Define our custom theme type
export interface CustomTheme extends Omit<MD3Theme, 'colors'> {
  colors: CustomColors
}

// Light Theme with blue color scheme
const lightTheme: CustomTheme = {
  ...MD3LightTheme,
  colors: {
    // Include all original MD3 colors
    ...MD3LightTheme.colors,
    
    // Override and add our custom colors
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
}

// Updated dark theme with better text contrast
const darkTheme: CustomTheme = {
  ...MD3DarkTheme,
  colors: {
    // Include all original MD3 colors
    ...MD3DarkTheme.colors,
    
    // Override and add our custom colors
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
    inputText: "#F8FAFC", // Light text for inputs in dark mode

    placeholder: "#94A3B8", // Slate 400 - placeholder text
    outline: "#475569", // Slate 600 - borders

    buttonBackground: "#60A5FA", // Lighter blue - button background
    buttonText: "#FFFFFF", // White text for buttons

    error: "#F87171", // Lighter red for dark mode
    success: "#34D399", // Lighter green for dark mode
    warning: "#FBBF24", // Lighter amber for dark mode
    info: "#60A5FA", // Lighter blue for dark mode

    link: "#60A5FA", // Lighter blue for links
    inputBackground: "#1E293B", // Darker background for inputs in dark mode
    divider: "#475569", // Slate 600 for dividers

    // Additional accent colors
    accent1: "#A78BFA", // Lighter violet for dark mode
    accent2: "#FB7185", // Lighter rose for dark mode
    accent3: "#38BDF8", // Lighter sky for dark mode
  },
  roundness: 16, // Increased roundness for dark theme as well
}

export { lightTheme, darkTheme }

export default {
  lightTheme,
  darkTheme,
}