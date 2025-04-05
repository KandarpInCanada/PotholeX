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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Divider, TextInput, Avatar, Switch } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../../context/auth-context";
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileAvatar,
} from "../../services/profile-service";
import { lightTheme } from "../../theme";
import LoadingScreen from "../../components/dashboard-components/profile/loading-screen";

export default function UserProfileScreen() {
  // Authentication and routing hooks
  const { user, signOut } = useAuth();

  // State management for loading, updating, profile data, and edit mode
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    full_name: "",
    avatar_url: "",
    email: "",
  });
  const [editMode, setEditMode] = useState(false);

  // User preferences
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Fetch user profile when component mounts
  useEffect(() => {
    fetchUserProfile();
    loadUserPreferences();
  }, []);

  // Load user preferences from AsyncStorage
  const loadUserPreferences = async () => {
    try {
      const prefsString = await AsyncStorage.getItem("userPreferences");
      if (prefsString) {
        const prefs = JSON.parse(prefsString);
        setNotificationsEnabled(prefs.notifications ?? true);
        setLocationEnabled(prefs.location ?? true);
        setDarkModeEnabled(prefs.darkMode ?? false);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  // Save user preferences to AsyncStorage
  const saveUserPreferences = async () => {
    try {
      const prefs = {
        notifications: notificationsEnabled,
        location: locationEnabled,
        darkMode: darkModeEnabled,
      };
      await AsyncStorage.setItem("userPreferences", JSON.stringify(prefs));
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  // Async function to retrieve user profile from service
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      console.log("Fetching user profile...");

      const userProfile = await getUserProfile();
      console.log("User profile fetched:", userProfile);

      if (userProfile) {
        // Update profile state with retrieved data
        setProfile({
          username: userProfile.username || "",
          full_name: userProfile.full_name || "",
          avatar_url: userProfile.avatar_url || "",
          email: userProfile.email || "",
        });
      } else {
        console.warn("No user profile returned from getUserProfile");
      }
    } catch (error) {
      // Handle errors in fetching profile
      console.error("Error fetching profile:", error);
      Alert.alert("Error", "Failed to load profile information");
    } finally {
      setLoading(false);
    }
  };

  // Handle profile update submission
  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);
      console.log("Updating profile with:", profile);

      // Call service to update user profile
      const success = await updateUserProfile({
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      });

      if (success) {
        // Show success message and exit edit mode
        Alert.alert("Success", "Profile updated successfully");
        setEditMode(false);

        // Save user preferences
        await saveUserPreferences();
      } else {
        // Handle update failure
        Alert.alert("Error", "Failed to update profile");
      }
    } catch (error) {
      // Handle errors in updating profile
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  // Handle logout process
  const handleLogout = async () => {
    // Show confirmation dialog before logging out
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: performLogout,
        },
      ],
      { cancelable: true }
    );
  };

  // Perform the actual logout
  const performLogout = async () => {
    try {
      setLoggingOut(true);
      console.log("Logging out...");

      // Clear all app data
      await Promise.all([
        signOut(),
        AsyncStorage.removeItem("hasSeenOnboarding"),
        // Add any other app data that should be cleared on logout
        AsyncStorage.removeItem("userSettings"),
        AsyncStorage.removeItem("recentReports"),
      ]);

      console.log("Logout successful");
    } catch (error) {
      setLoggingOut(false);
      console.error("Error during logout:", error);
      Alert.alert(
        "Logout Failed",
        "There was a problem logging out. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  // Handle image selection for avatar
  const pickImage = async () => {
    // Only allow image pick in edit mode
    if (!editMode) return;

    try {
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      // Update profile with selected image
      if (!result.canceled && result.assets.length > 0) {
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
          setProfile((prev) => ({
            ...prev,
            avatar_url: result.assets[0].uri,
          }));
        }
      }
    } catch (error) {
      // Handle image picking errors
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  // Show loading screen while fetching profile
  if (loading) {
    return <LoadingScreen />;
  }

  // Show logout overlay when logging out
  if (loggingOut) {
    return (
      <View style={styles.loggingOutContainer}>
        <ActivityIndicator size="large" color={lightTheme.colors.primary} />
        <Text style={styles.loggingOutText}>Logging out...</Text>
      </View>
    );
  }

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

  // Main profile screen rendering
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated view for smooth entrance */}
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
        >
          {/* Profile Header */}
          <View style={styles.header}>
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

            <Text style={styles.name}>
              {profile.full_name || profile.username || "Update your profile"}
            </Text>
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

          <Divider style={styles.divider} />

          {/* Profile Form */}
          <View style={styles.section}>
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
                left={<TextInput.Icon icon="account" />}
                placeholder="Enter username"
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
                left={<TextInput.Icon icon="badge-account" />}
                placeholder="Enter full name"
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
                left={<TextInput.Icon icon="email" />}
              />
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* User Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={24}
                  color="#3B82F6"
                />
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={(value) => {
                  setNotificationsEnabled(value);
                  if (editMode) saveUserPreferences();
                }}
                disabled={!editMode}
                color="#3B82F6"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={24}
                  color="#3B82F6"
                />
                <Text style={styles.settingLabel}>Location Services</Text>
              </View>
              <Switch
                value={locationEnabled}
                onValueChange={(value) => {
                  setLocationEnabled(value);
                  if (editMode) saveUserPreferences();
                }}
                disabled={!editMode}
                color="#3B82F6"
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
                onValueChange={(value) => {
                  setDarkModeEnabled(value);
                  if (editMode) saveUserPreferences();
                }}
                disabled={!editMode}
                color="#3B82F6"
              />
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* App Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Information</Text>

            <TouchableOpacity style={styles.infoRow}>
              <MaterialCommunityIcons
                name="information-outline"
                size={24}
                color="#3B82F6"
              />
              <Text style={styles.infoText}>About PotholeX</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={lightTheme.colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoRow}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={24}
                color="#3B82F6"
              />
              <Text style={styles.infoText}>Privacy Policy</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={lightTheme.colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoRow}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={24}
                color="#3B82F6"
              />
              <Text style={styles.infoText}>Terms of Service</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={lightTheme.colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoRow}>
              <MaterialCommunityIcons
                name="help-circle-outline"
                size={24}
                color="#3B82F6"
              />
              <Text style={styles.infoText}>Help & Support</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={lightTheme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            icon="logout"
            textColor={lightTheme.colors.error}
            buttonColor="transparent"
          >
            Logout
          </Button>

          {/* App Version */}
          <Text style={styles.versionText}>PotholeX v1.0.0</Text>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles for the profile screen
const styles = StyleSheet.create({
  // Safe area styling to prevent content overlap with device edges
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  // Container and content container styles
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100, // Increase this value to ensure content isn't hidden behind the tab bar
  },
  // Header styles
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
    borderColor: "#3B82F6",
  },
  avatarFallback: {
    backgroundColor: "#3B82F6",
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
    backgroundColor: "#3B82F6",
    width: "100%",
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
  // Divider styling
  divider: {
    marginVertical: 16,
    backgroundColor: lightTheme.colors.outline,
  },
  // Section styling
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: lightTheme.colors.text,
    marginBottom: 16,
  },
  // Input styling
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
  // Settings styling
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.outline,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingLabel: {
    fontSize: 16,
    color: lightTheme.colors.text,
    marginLeft: 12,
  },
  // Info row styling
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.outline,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: lightTheme.colors.text,
    marginLeft: 16,
  },
  // Logout button styling
  logoutButton: {
    marginBottom: 24,
    borderColor: lightTheme.colors.error,
    borderWidth: 1.5,
  },
  // Version text styling
  versionText: {
    textAlign: "center",
    fontSize: 14,
    color: lightTheme.colors.textSecondary,
    marginBottom: 16,
  },
  // Logging out container
  loggingOutContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  // Logging out text
  loggingOutText: {
    marginTop: 16,
    fontSize: 18,
    color: lightTheme.colors.text,
    fontWeight: "500",
  },
});
