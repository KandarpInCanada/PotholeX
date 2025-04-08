"use client";

import type React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import { useTheme } from "../../../../context/theme-context";

type ProfileFormProps = {
  profile: {
    username: string;
    full_name: string;
    email: string;
  };
  editMode: boolean;
  setProfile: React.Dispatch<
    React.SetStateAction<{
      username: string;
      full_name: string;
      avatar_url: string;
      email: string;
    }>
  >;
};

export default function ProfileForm({
  profile,
  editMode,
  setProfile,
}: ProfileFormProps) {
  const { theme, isDarkMode } = useTheme();

  return (
    <View style={styles.formContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Profile Information
      </Text>

      <View style={styles.inputContainer}>
        <Text
          style={[styles.inputLabel, { color: theme.colors.textSecondary }]}
        >
          Username
        </Text>
        <TextInput
          value={profile.username || ""}
          onChangeText={(text) =>
            setProfile((prev) => ({ ...prev, username: text }))
          }
          style={[styles.input, { backgroundColor: theme.colors.surface }]}
          disabled={!editMode}
          mode="outlined"
          outlineColor={theme.colors.outline}
          activeOutlineColor="#3B82F6"
          left={<TextInput.Icon icon="account" color="#3B82F6" />}
          placeholder="Enter username"
          theme={{
            colors: {
              text: theme.colors.text,
              placeholder: theme.colors.placeholder,
              disabled: isDarkMode
                ? theme.colors.textSecondary
                : theme.colors.onSurfaceVariant,
              onSurfaceVariant: theme.colors.onSurfaceVariant,
              background: theme.colors.surface,
              primary: "#3B82F6",
            },
          }}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text
          style={[styles.inputLabel, { color: theme.colors.textSecondary }]}
        >
          Full Name
        </Text>
        <TextInput
          value={profile.full_name || ""}
          onChangeText={(text) =>
            setProfile((prev) => ({ ...prev, full_name: text }))
          }
          style={[styles.input, { backgroundColor: theme.colors.surface }]}
          disabled={!editMode}
          mode="outlined"
          outlineColor={theme.colors.outline}
          activeOutlineColor="#3B82F6"
          left={<TextInput.Icon icon="badge-account" color="#3B82F6" />}
          placeholder="Enter full name"
          theme={{
            colors: {
              text: theme.colors.text,
              placeholder: theme.colors.placeholder,
              disabled: isDarkMode
                ? theme.colors.textSecondary
                : theme.colors.onSurfaceVariant,
              onSurfaceVariant: theme.colors.onSurfaceVariant,
              background: theme.colors.surface,
              primary: "#3B82F6",
            },
          }}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text
          style={[styles.inputLabel, { color: theme.colors.textSecondary }]}
        >
          Email
        </Text>
        <TextInput
          value={profile.email || ""}
          style={[styles.input, { backgroundColor: theme.colors.surface }]}
          disabled={true}
          mode="outlined"
          outlineColor={theme.colors.outline}
          left={<TextInput.Icon icon="email" color="#3B82F6" />}
          theme={{
            colors: {
              text: theme.colors.text,
              placeholder: theme.colors.placeholder,
              disabled: isDarkMode
                ? theme.colors.textSecondary
                : theme.colors.onSurfaceVariant,
              onSurfaceVariant: theme.colors.onSurfaceVariant,
              background: theme.colors.surface,
              primary: "#3B82F6",
            },
          }}
        />
        <Text
          style={[styles.helperText, { color: theme.colors.textSecondary }]}
        >
          Email cannot be changed
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
});
