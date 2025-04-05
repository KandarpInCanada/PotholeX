"use client";

import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Button, Avatar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { lightTheme } from "../../../theme";
import { useAuth } from "../../../../context/auth-context";
import { useRouter } from "expo-router";

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
  const { isAdmin } = useAuth();
  const router = useRouter();

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

      {isAdmin && (
        <View style={styles.adminBadge}>
          <MaterialCommunityIcons
            name="shield-check"
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.adminBadgeText}>Administrator</Text>
        </View>
      )}

      <View style={styles.editButtonContainer}>
        {!editMode ? (
          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              onPress={() => setEditMode(true)}
              style={styles.editButton}
              icon="account-edit"
            >
              Edit Profile
            </Button>

            {isAdmin && (
              <Button
                mode="contained"
                onPress={() => router.push("/(screens)/(admin)/portal")}
                style={styles.adminButton}
                icon="shield-account"
              >
                Admin Portal
              </Button>
            )}
          </View>
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
    borderColor: "#3B82F6", // Updated to blue
  },
  avatarFallback: {
    backgroundColor: "#3B82F6", // Updated to blue
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
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  adminBadgeText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 4,
  },
  editButtonContainer: {
    width: "100%",
    alignItems: "center",
  },
  buttonRow: {
    width: "100%",
    flexDirection: "column",
    gap: 12,
  },
  editButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: "#3B82F6", // Updated to blue
    width: "100%",
  },
  adminButton: {
    backgroundColor: "#8B5CF6", // Purple for admin button
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
