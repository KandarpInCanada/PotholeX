"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Button,
  Divider,
  TextInput,
  Avatar,
  Switch,
  Card,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../../context/auth-context";
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileAvatar,
} from "../../services/profile-service";
import { LinearGradient } from "expo-linear-gradient";
import { Portal, Dialog } from "react-native-paper";
import { ActivityIndicator } from "react-native-paper";
import { useRouter } from "expo-router";

// Update the component to remove AdminHeader
export default function AdminProfileSettings() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Profile state
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    full_name: "",
    avatar_url: "",
    email: "",
  });

  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoApproveReports, setAutoApproveReports] = useState(false);
  const [aiDetectionEnabled, setAiDetectionEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [dataUsageEnabled, setDataUsageEnabled] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // API settings
  const [apiUrl, setApiUrl] = useState("https://api.potholex.com");
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [editingApiUrl, setEditingApiUrl] = useState("");

  // Fetch user profile when component mounts
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await getUserProfile();

      if (userProfile) {
        setProfile({
          username: userProfile.username || "",
          full_name: userProfile.full_name || "",
          avatar_url: userProfile.avatar_url || "",
          email: userProfile.email || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("Error", "Failed to load profile information");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);

      const success = await updateUserProfile({
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      });

      if (success) {
        Alert.alert("Success", "Profile updated successfully");
        setEditMode(false);
      } else {
        Alert.alert("Error", "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const pickImage = async () => {
    if (!editMode) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        // Upload the image if user is available
        if (user?.id) {
          setUpdating(true);
          const uploadedUrl = await uploadProfileAvatar(
            result.assets[0].uri,
            user.id
          );
          if (uploadedUrl) {
            setProfile((prev) => ({
              ...prev,
              avatar_url: uploadedUrl,
            }));
          }
          setUpdating(false);
        } else {
          // Just update the local state if no user ID is available
          setProfile((prev) => ({
            ...prev,
            avatar_url: result.assets[0].uri,
          }));
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  const handleLogout = async () => {
    try {
      setShowLogoutDialog(false);
      // Show loading state
      const loadingOverlay = (
        <View style={styles.loggingOutContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loggingOutText}>Logging out...</Text>
        </View>
      );

      // Actually perform the logout
      await signOut();

      // The signOut function should handle navigation automatically through the auth context
      // But we'll add a fallback just in case
      console.log("Logout completed, redirecting to login screen");

      // Force navigation to login screen after a short delay
      setTimeout(() => {
        router.replace("/(screens)/(auth)/login");
      }, 500);
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  const saveApiSettings = () => {
    setApiUrl(editingApiUrl);
    setShowApiDialog(false);
    Alert.alert("Success", "API settings updated successfully");
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (profile.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return profile.username.substring(0, 2).toUpperCase() || "";
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
        >
          {/* Profile Header with Admin Badge */}
          <LinearGradient
            colors={["#374151", "#1F2937"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.profileHeader}
          >
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={pickImage}
              disabled={!editMode}
            >
              {profile.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <Avatar.Text
                  size={100}
                  label={getInitials()}
                  style={styles.avatarFallback}
                />
              )}
              {editMode && (
                <View style={styles.editAvatarOverlay}>
                  <MaterialCommunityIcons
                    name="camera"
                    size={24}
                    color="white"
                  />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profile.full_name || profile.username}
              </Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>

              <View style={styles.adminBadge}>
                <MaterialCommunityIcons
                  name="shield"
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.adminBadgeText}>Administrator</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => setEditMode(true)}
            >
              <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </LinearGradient>

          <Divider style={styles.divider} />

          {/* Profile Form */}
          <Card style={styles.sectionCard}>
            <Card.Title
              title="Profile Information"
              titleStyle={styles.sectionTitle}
              left={(props) => (
                <MaterialCommunityIcons
                  name="account-circle"
                  size={24}
                  color="#3B82F6"
                />
              )}
            />
            <Card.Content>
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
                  outlineColor="#E2E8F0"
                  activeOutlineColor="#3B82F6"
                  left={<TextInput.Icon icon="account" color="#3B82F6" />}
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
                  outlineColor="#E2E8F0"
                  activeOutlineColor="#3B82F6"
                  left={<TextInput.Icon icon="badge-account" color="#3B82F6" />}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  value={profile.email}
                  style={styles.input}
                  disabled={true}
                  mode="outlined"
                  outlineColor="#E2E8F0"
                  left={<TextInput.Icon icon="email" color="#3B82F6" />}
                />
                <Text style={styles.helperText}>Email cannot be changed</Text>
              </View>
            </Card.Content>
          </Card>

          {/* The rest of the component remains unchanged */}
          <Divider style={styles.divider} />

          {/* General Settings */}
          <Card style={styles.sectionCard}>
            <Card.Title
              title="General Settings"
              titleStyle={styles.sectionTitle}
              left={(props) => (
                <MaterialCommunityIcons name="cog" size={24} color="#3B82F6" />
              )}
            />
            <Card.Content>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <MaterialCommunityIcons
                    name="bell-outline"
                    size={24}
                    color="#3B82F6"
                  />
                  <Text style={styles.settingLabel}>Admin Notifications</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: "#CBD5E1", true: "#93C5FD" }}
                  thumbColor={notificationsEnabled ? "#3B82F6" : "#F1F5F9"}
                />
              </View>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <MaterialCommunityIcons
                    name="theme-light-dark"
                    size={24}
                    color="#3B82F6"
                  />
                  <Text style={styles.settingLabel}>Dark Mode</Text>
                </View>
                <Switch
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                  trackColor={{ false: "#CBD5E1", true: "#93C5FD" }}
                  thumbColor={darkModeEnabled ? "#3B82F6" : "#F1F5F9"}
                />
              </View>
            </Card.Content>
          </Card>

          {/* Logout Button */}
          <Button
            mode="outlined"
            onPress={() => setShowLogoutDialog(true)}
            style={styles.logoutButton}
            icon="logout"
            textColor="#EF4444"
          >
            Logout from Admin
          </Button>

          <Text style={styles.versionText}>PotholeX Admin v1.0.0</Text>
        </MotiView>
      </ScrollView>

      {/* API Dialog */}
      <Portal>
        <Dialog
          visible={showApiDialog}
          onDismiss={() => setShowApiDialog(false)}
          style={styles.logoutDialog}
        >
          <Dialog.Title style={styles.logoutDialogTitle}>
            Edit API Endpoint
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="API URL"
              value={editingApiUrl}
              onChangeText={setEditingApiUrl}
              mode="outlined"
              style={styles.apiInput}
              outlineColor="#E2E8F0"
              activeOutlineColor="#3B82F6"
            />
          </Dialog.Content>
          <Dialog.Actions style={styles.logoutDialogActions}>
            <Button
              onPress={() => setShowApiDialog(false)}
              textColor="#64748B"
              style={styles.dialogButton}
              labelStyle={styles.dialogButtonLabel}
            >
              Cancel
            </Button>
            <Button
              onPress={saveApiSettings}
              textColor="#3B82F6"
              style={styles.dialogButton}
              labelStyle={styles.dialogButtonLabel}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Logout Dialog */}
      <Portal>
        <Dialog
          visible={showLogoutDialog}
          onDismiss={() => setShowLogoutDialog(false)}
          style={styles.logoutDialog}
        >
          <Dialog.Title style={styles.logoutDialogTitle}>Logout</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.logoutDialogContent}>
              Are you sure you want to logout from the admin portal?
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.logoutDialogActions}>
            <Button
              onPress={() => setShowLogoutDialog(false)}
              textColor="#3B82F6"
              style={styles.dialogButton}
              labelStyle={styles.dialogButtonLabel}
            >
              Cancel
            </Button>
            <Button
              onPress={handleLogout}
              textColor="#EF4444"
              style={styles.dialogButton}
              labelStyle={styles.dialogButtonLabel}
            >
              Logout
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

// Update the logout dialog styling to fix the text cutoff issue
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100, // Increase this value to ensure content isn't hidden behind the tab bar
  },
  profileHeader: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  avatarContainer: {
    alignSelf: "center",
    marginBottom: 16,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  avatarFallback: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
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
  profileInfo: {
    alignItems: "center",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 12,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4, // Changed from rounded to square
    marginBottom: 16,
  },
  adminBadgeText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 4,
  },
  editProfileButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    width: "100%",
    alignItems: "center",
  },
  editProfileButtonText: {
    color: "#6366F1",
    fontWeight: "600",
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#8B5CF6",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },
  divider: {
    marginVertical: 16,
    backgroundColor: "#E2E8F0",
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
  },
  helperText: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingLabel: {
    fontSize: 16,
    color: "#334155",
    marginLeft: 12,
  },
  apiSettingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  apiUrl: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 12,
    marginTop: 2,
  },
  apiNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },
  apiNoteText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 8,
    flex: 1,
  },
  apiInput: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#334155",
    marginLeft: 12,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 24,
    borderColor: "#EF4444",
    borderWidth: 1.5,
  },
  versionText: {
    textAlign: "center",
    fontSize: 14,
    color: "#94A3B8",
  },
  // Update these specific styles for the logout dialog
  logoutDialog: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "85%",
    alignSelf: "center",
    padding: 8,
    maxHeight: 200, // Set a fixed maximum height
  },
  logoutDialogTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  logoutDialogContent: {
    fontSize: 16,
    color: "#334155",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  logoutDialogActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  dialogButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    minWidth: 80,
  },
  dialogButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  loggingOutContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loggingOutText: {
    marginTop: 10,
    fontSize: 16,
    color: "#3B82F6",
  },
});
