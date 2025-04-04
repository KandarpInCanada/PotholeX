import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Button, Avatar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { lightTheme } from "../../../theme";

type ProfileHeaderProps = {
  profile: {
    full_name: string;
    email: string;
    avatar_url: string;
    username: string;
  };
  editMode: boolean;
  updating: boolean;
  setEditMode: (value: boolean) => void;
  pickImage: () => void;
  handleUpdateProfile: () => void;
  fetchUserProfile: () => void;
};

export default function ProfileHeader({
  profile,
  editMode,
  updating,
  setEditMode,
  pickImage,
  handleUpdateProfile,
  fetchUserProfile,
}: ProfileHeaderProps) {
  // Add console log to debug the profile data
  console.log("ProfileHeader received profile:", profile);

  // Get initials for avatar
  const getInitials = () => {
    if (profile.full_name && profile.full_name.trim() !== "") {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    if (profile.username && profile.username.trim() !== "") {
      return profile.username.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  // Display name with fallbacks
  const displayName =
    profile.full_name || profile.username || "Update your profile";

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={pickImage}
        disabled={!editMode}
      >
        {profile.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <Avatar.Text
            size={100}
            label={getInitials()}
            style={styles.avatarFallback}
          />
        )}
        {editMode && (
          <View style={styles.editAvatarOverlay}>
            <MaterialCommunityIcons name="camera" size={24} color="white" />
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.name}>{displayName}</Text>
      <Text style={styles.email}>{profile.email || ""}</Text>

      <View style={styles.editButtonContainer}>
        {!editMode ? (
          <Button
            mode="contained"
            onPress={() => setEditMode(true)}
            style={styles.editButton}
            icon="account-edit"
          >
            Edit Profile
          </Button>
        ) : (
          <View style={styles.editModeButtons}>
            <Button
              mode="outlined"
              onPress={() => {
                setEditMode(false);
                fetchUserProfile(); // Reset to original values
              }}
              style={[styles.editActionButton, styles.cancelButton]}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleUpdateProfile}
              style={styles.editActionButton}
              loading={updating}
              disabled={updating}
            >
              Save
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: lightTheme.colors.primary,
  },
  avatarFallback: {
    backgroundColor: lightTheme.colors.primary,
  },
  editAvatarOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: lightTheme.colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: lightTheme.colors.textSecondary,
    marginBottom: 16,
  },
  editButtonContainer: {
    width: "100%",
    alignItems: "center",
  },
  editButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: lightTheme.colors.primary,
  },
  editModeButtons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    gap: 16,
  },
  editActionButton: {
    flex: 1,
    borderRadius: 8,
  },
  cancelButton: {
    borderColor: lightTheme.colors.outline,
  },
});
