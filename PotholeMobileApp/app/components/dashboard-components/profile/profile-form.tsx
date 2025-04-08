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
  console.log("ProfileForm received profile:", profile);
  return (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Profile Information</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Username</Text>
        <TextInput
          value={profile.username || ""}
          onChangeText={(text) =>
            setProfile((prev) => ({ ...prev, username: text }))
          }
          style={styles.input}
          disabled={!editMode}
          mode="outlined"
          outlineColor={lightTheme.colors.outline}
          activeOutlineColor={lightTheme.colors.primary}
          left={<TextInput.Icon icon="account" color="#3B82F6" />}
          placeholder="Enter username"
          theme={{
            colors: {
              text: "#0F172A",
              placeholder: "#64748B",
              disabled: "#334155",
              onSurfaceVariant: "#475569",
              background: "#FFFFFF",
            },
          }}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          value={profile.full_name || ""}
          onChangeText={(text) =>
            setProfile((prev) => ({ ...prev, full_name: text }))
          }
          style={styles.input}
          disabled={!editMode}
          mode="outlined"
          outlineColor={lightTheme.colors.outline}
          activeOutlineColor={lightTheme.colors.primary}
          left={<TextInput.Icon icon="badge-account" color="#3B82F6" />}
          placeholder="Enter full name"
          theme={{
            colors: {
              text: "#0F172A",
              placeholder: "#64748B",
              disabled: "#334155",
              onSurfaceVariant: "#475569",
              background: "#FFFFFF",
            },
          }}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          value={profile.email || ""}
          style={styles.input}
          disabled={true}
          mode="outlined"
          outlineColor={lightTheme.colors.outline}
          left={<TextInput.Icon icon="email" color="#3B82F6" />}
          theme={{
            colors: {
              text: "#0F172A",
              placeholder: "#64748B",
              disabled: "#334155",
              onSurfaceVariant: "#475569",
              background: "#FFFFFF",
            },
          }}
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
    color: "#475569",
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: lightTheme.colors.background,
    color: "#1E293B",
  },
  helperText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    marginLeft: 8,
  },
});
