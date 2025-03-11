import type React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import { lightTheme } from "../../../theme";

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
  return (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Profile Information</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Username</Text>
        <TextInput
          value={profile.username}
          onChangeText={(text) =>
            setProfile((prev) => ({ ...prev, username: text }))
          }
          style={styles.input}
          disabled={!editMode}
          mode="outlined"
          outlineColor={lightTheme.colors.outline}
          activeOutlineColor={lightTheme.colors.primary}
          left={<TextInput.Icon icon="account" />}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          value={profile.full_name}
          onChangeText={(text) =>
            setProfile((prev) => ({ ...prev, full_name: text }))
          }
          style={styles.input}
          disabled={!editMode}
          mode="outlined"
          outlineColor={lightTheme.colors.outline}
          activeOutlineColor={lightTheme.colors.primary}
          left={<TextInput.Icon icon="badge-account" />}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          value={profile.email}
          style={styles.input}
          disabled={true}
          mode="outlined"
          outlineColor={lightTheme.colors.outline}
          left={<TextInput.Icon icon="email" />}
        />
        <Text style={styles.helperText}>Email cannot be changed</Text>
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
    color: lightTheme.colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: lightTheme.colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: lightTheme.colors.background,
  },
  helperText: {
    fontSize: 12,
    color: lightTheme.colors.textSecondary,
    marginTop: 4,
    marginLeft: 8,
  },
});
