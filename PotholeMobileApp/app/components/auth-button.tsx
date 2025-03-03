import type React from "react";
import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { lightTheme } from "../../app/theme";

interface AuthButtonProps {
  onPress: () => void;
  loading?: boolean;
  mode?: "text" | "outlined" | "contained";
  icon?: () => React.ReactNode;
  children: React.ReactNode;
  style?: object;
  disabled?: boolean;
}

const AuthButton = ({
  onPress,
  loading = false,
  mode = "contained",
  icon,
  children,
  style,
  disabled = false,
}: AuthButtonProps) => {
  const buttonStyle =
    mode === "contained" ? styles.primaryButton : styles.secondaryButton;
  const contentStyle =
    mode === "contained"
      ? styles.primaryButtonContent
      : styles.secondaryButtonContent;
  const textStyle =
    mode === "contained"
      ? styles.primaryButtonText
      : styles.secondaryButtonText;

  return (
    <Button
      mode={mode}
      onPress={onPress}
      loading={loading}
      disabled={loading || disabled}
      style={[buttonStyle, style]}
      contentStyle={contentStyle}
      labelStyle={textStyle}
      icon={icon}
    >
      {children}
    </Button>
  );
};

const styles = StyleSheet.create({
  primaryButton: {
    height: 56,
    backgroundColor: lightTheme.colors.buttonBackground,
    borderRadius: 28,
    marginTop: 8,
  },
  primaryButtonContent: {
    height: 56,
  },
  primaryButtonText: {
    fontSize: 16,
    letterSpacing: 0.5,
    fontWeight: "600",
    color: lightTheme.colors.buttonText,
  },
  secondaryButton: {
    borderColor: lightTheme.colors.outline,
    borderWidth: 2,
    borderRadius: 28,
    height: 56,
  },
  secondaryButtonContent: {
    height: 56,
  },
  secondaryButtonText: {
    color: lightTheme.colors.text,
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default AuthButton;
