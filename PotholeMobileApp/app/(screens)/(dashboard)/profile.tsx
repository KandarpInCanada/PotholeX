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
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../../context/auth-context";
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileAvatar,
} from "../../services/profile-service";
import { LinearGradient } from "expo-linear-gradient";
import LoadingScreen from "../../components/dashboard-components/profile/loading-screen";
import { useRouter } from "expo-router";

export default function UserProfileScreen() {
  // Authentication and routing hooks
  const { user, signOut, isAdmin } = useAuth();
  const router = useRouter();

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
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  // Update the performLogout function to avoid double navigation
  const performLogout = async () => {
    try {
      setLoggingOut(true);
      console.log("Logging out...");

      // Clear all app data
      await signOut();

      // Keep the loading state active to prevent double navigation
      // The auth state change in _layout.tsx will handle the navigation
      console.log("Logout successful, waiting for auth state to update");

      // We'll keep the loading state active but won't navigate manually
      // This prevents the double navigation issue
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
        <ActivityIndicator size="large" color="#4B5563" />
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
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
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

              {isAdmin && (
                <View style={styles.adminBadge}>
                  <MaterialCommunityIcons
                    name="shield"
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.adminBadgeText}>Administrator</Text>
                </View>
              )}
            </View>

            {!editMode ? (
              <TouchableOpacity
                style={styles.editProfileButton}
                onPress={() => setEditMode(true)}
              >
                <Text style={styles.editProfileButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editModeButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditMode(false);
                    fetchUserProfile(); // Reset to original values
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleUpdateProfile}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
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
                  color="#4B5563"
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
                  value={profile.email}
                  style={styles.input}
                  disabled={true}
                  mode="outlined"
                  outlineColor="#E2E8F0"
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
            </Card.Content>
          </Card>

          <Divider style={styles.divider} />

          {/* General Settings */}
          <Card style={styles.sectionCard}>
            <Card.Title
              title="General Settings"
              titleStyle={styles.sectionTitle}
              left={(props) => (
                <MaterialCommunityIcons name="cog" size={24} color="#4B5563" />
              )}
            />
            <Card.Content>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <MaterialCommunityIcons
                    name="bell-outline"
                    size={24}
                    color="#4B5563"
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
                  trackColor={{ false: "#CBD5E1", true: "#9CA3AF" }}
                  thumbColor={notificationsEnabled ? "#4B5563" : "#F1F5F9"}
                />
              </View>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={24}
                    color="#4B5563"
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
                  trackColor={{ false: "#CBD5E1", true: "#9CA3AF" }}
                  thumbColor={locationEnabled ? "#4B5563" : "#F1F5F9"}
                />
              </View>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <MaterialCommunityIcons
                    name="theme-light-dark"
                    size={24}
                    color="#4B5563"
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
                  trackColor={{ false: "#CBD5E1", true: "#9CA3AF" }}
                  thumbColor={darkModeEnabled ? "#4B5563" : "#F1F5F9"}
                />
              </View>
            </Card.Content>
          </Card>

          <Divider style={styles.divider} />

          {/* App Information */}
          <Card style={styles.sectionCard}>
            <Card.Title
              title="App Information"
              titleStyle={styles.sectionTitle}
              left={(props) => (
                <MaterialCommunityIcons
                  name="information-outline"
                  size={24}
                  color="#4B5563"
                />
              )}
            />
            <Card.Content>
              <TouchableOpacity style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={24}
                  color="#4B5563"
                />
                <Text style={styles.infoText}>About PotholeX</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#64748B"
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={24}
                  color="#4B5563"
                />
                <Text style={styles.infoText}>Privacy Policy</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#64748B"
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={24}
                  color="#4B5563"
                />
                <Text style={styles.infoText}>Terms of Service</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#64748B"
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="help-circle-outline"
                  size={24}
                  color="#4B5563"
                />
                <Text style={styles.infoText}>Help & Support</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#64748B"
                />
              </TouchableOpacity>
            </Card.Content>
          </Card>

          {/* Edit Mode Buttons */}
          {/* ProfileHeader component with edit mode buttons */}

          {/* Logout Button */}
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            icon="logout"
            textColor="#EF4444"
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
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 140, // Increased from 100 to 140 to ensure logout button is visible
  },
  profileHeader: {
    borderRadius: 24, // Updated for more curved edges
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
    backgroundColor: "#374151",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20, // Updated for curved edges
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
    color: "#3B82F6", // Updated from purple to blue
    fontWeight: "600",
    fontSize: 16,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: "#E2E8F0",
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 24, // Updated for curved corners
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
    borderRadius: 16, // Added curved borders for inputs
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
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: "#334155",
    marginLeft: 16,
  },
  editModeButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cancelButtonText: {
    color: "#3B82F6",
    fontWeight: "600",
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#374151",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 40, // Increased from 24 to 40 for more space
    borderColor: "#EF4444",
    borderWidth: 1.5,
    borderRadius: 24, // Updated for curved edges
  },
  versionText: {
    textAlign: "center",
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 0, // Added to ensure no extra space
  },
  loggingOutContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  loggingOutText: {
    marginTop: 16,
    fontSize: 18,
    color: "#4B5563",
    fontWeight: "500",
  },
});
