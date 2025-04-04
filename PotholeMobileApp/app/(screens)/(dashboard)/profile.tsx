"use client";

import { useState, useEffect } from "react";
import { Text, StyleSheet, ScrollView, Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button, Divider, ActivityIndicator } from "react-native-paper";
import { MotiView } from "moti";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../../context/auth-context";
import {
  getUserProfile,
  updateUserProfile,
} from "../../services/profile-service";
import { lightTheme } from "../../theme";
import ProfileHeader from "../../components/dashboard-components/profile/profile-header";
import ProfileForm from "../../components/dashboard-components/profile/profile-form";
import AppInfo from "../../components/dashboard-components/profile/app-info";
import LoadingScreen from "../../components/dashboard-components/profile/loading-screen";

export default function ProfileScreen() {
  // Authentication and routing hooks
  const { user, signOut } = useAuth();
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

  // Fetch user profile when component mounts
  useEffect(() => {
    fetchUserProfile();
  }, []);

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

        console.log("Profile state updated:", {
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

      console.log("Logout successful, redirecting to login screen");

      // Short delay to show the loading state before redirecting
      setTimeout(() => {
        router.replace("(screens)/(auth)/login");
      }, 500);
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
        setProfile((prev) => ({
          ...prev,
          avatar_url: result.assets[0].uri,
        }));
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
          {/* Profile Header Component */}
          <ProfileHeader
            profile={profile}
            editMode={editMode}
            updating={updating}
            setEditMode={setEditMode}
            pickImage={pickImage}
            handleUpdateProfile={handleUpdateProfile}
            fetchUserProfile={fetchUserProfile}
          />

          <Divider style={styles.divider} />

          {/* Profile Form Component */}
          <ProfileForm
            profile={profile}
            editMode={editMode}
            setProfile={setProfile}
          />

          <Divider style={styles.divider} />

          {/* App Information Component */}
          <AppInfo />

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
  },
  // Divider styling
  divider: {
    marginVertical: 16,
    backgroundColor: lightTheme.colors.outline,
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
