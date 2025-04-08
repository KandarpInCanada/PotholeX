"use client";

import type React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, HelperText } from "react-native-paper";
import { useTheme } from "../../../../context/theme-context";

interface DescriptionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

const DescriptionInput: React.FC<DescriptionInputProps> = ({
  value,
  onChangeText,
  error,
}) => {
  const { theme, isDarkMode } = useTheme();

  return (
    <View>
      <TextInput
        mode="outlined"
        placeholder="Describe the pothole size, depth, and any hazards..."
        value={value}
        onChangeText={onChangeText}
        multiline
        numberOfLines={4}
        style={[styles.input, { backgroundColor: theme.colors.surface }]}
        outlineStyle={styles.inputOutline}
        outlineColor={error ? theme.colors.error : theme.colors.outline}
        activeOutlineColor={theme.colors.primary}
        error={!!error}
        left={
          <TextInput.Icon
            icon="text-box-outline"
            color={theme.colors.primary}
          />
        }
        maxLength={500}
        autoCapitalize="sentences"
        theme={{
          colors: {
            text: theme.colors.text,
            placeholder: theme.colors.placeholder,
            disabled: isDarkMode
              ? theme.colors.textSecondary
              : theme.colors.onSurfaceVariant,
            onSurfaceVariant: theme.colors.onSurfaceVariant,
            background: theme.colors.surface,
            primary: theme.colors.primary,
            error: theme.colors.error,
          },
        }}
      />
      {error ? (
        <HelperText
          type="error"
          visible={true}
          style={[styles.errorText, { color: theme.colors.error }]}
        >
          {error}
        </HelperText>
      ) : (
        <HelperText
          type="info"
          visible={true}
          style={[styles.helperText, { color: theme.colors.textSecondary }]}
        >
          Minimum 10 characters. {value.length}/500 characters used.
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    fontSize: 15,
    minHeight: 120,
  },
  inputOutline: {
    borderRadius: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default DescriptionInput;
