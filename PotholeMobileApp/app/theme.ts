import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

// Light Theme
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#6A5AE0",
    background: "#F8F7FF",
    surface: "#FFFFFF",
    text: "#2D2D2D",
    textSecondary: "#707070",
    onSurface: "#444",
    placeholder: "#BDBDBD",
    outline: "#6A5AE0",
    buttonBackground: "#FFD700",
    buttonText: "#2D2D2D",
  },
};

export { lightTheme };