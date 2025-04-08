"use client";

import { StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import { useTheme } from "../../../context/theme-context";

interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  toggleSecureEntry?: () => void;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  icon: string;
}

const AuthInput = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  toggleSecureEntry,
  keyboardType = "default",
  autoCapitalize = "none",
  icon,
}: AuthInputProps) => {
  const { theme, isDarkMode } = useTheme();

  return (
    <TextInput
      label={label}
      mode="outlined"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      style={[styles.input, { backgroundColor: theme.colors.surface }]}
      left={<TextInput.Icon icon={icon} color={theme.colors.primary} />}
      right={
        toggleSecureEntry && secureTextEntry !== undefined ? (
          <TextInput.Icon
            icon={secureTextEntry ? "eye-off" : "eye"}
            color={theme.colors.primary}
            onPress={toggleSecureEntry}
          />
        ) : null
      }
      theme={{
        colors: {
          primary: theme.colors.primary,
          onSurfaceVariant: theme.colors.onSurfaceVariant,
          background: theme.colors.surface,
        },
      }}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 16,
    height: 56,
    fontSize: 16,
    borderRadius: 12,
  },
});

export default AuthInput;
