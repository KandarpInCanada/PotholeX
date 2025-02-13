import React, { useState } from "react";
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Alert 
} from "react-native";
import { 
  Button, 
  Text, 
  Avatar, 
  Divider, 
  PaperProvider 
} from "react-native-paper";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { lightTheme } from "../theme"; // ✅ Using your custom light theme
import { MotiView } from "moti";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: "Kandarp Patel",
    email: "kandarp@example.com",
    phone: "+1 123-456-7890",
    profilePic: "https://randomuser.me/api/portraits/men/1.jpg", // Placeholder image
  });

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Profile editing feature coming soon!");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => router.replace("/auth/login") },
    ]);
  };

  return (
    <PaperProvider theme={lightTheme}>
      <SafeAreaView style={styles.safeArea}>
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 10 }}
          style={styles.container}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <Avatar.Image size={100} source={{ uri: user.profilePic }} />
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>

          <Divider style={styles.divider} />

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoText}>{user.phone}</Text>
          </View>

          <Divider style={styles.divider} />

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleEditProfile} style={styles.editProfileButton}>
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>

            <Button 
              mode="contained" 
              onPress={handleLogout} 
              style={styles.logoutButton}
              labelStyle={{ color: lightTheme.colors.buttonText }} 
              buttonColor={lightTheme.colors.buttonBackground}
            >
              Logout
            </Button>
          </View>
        </MotiView>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: lightTheme.colors.background, // ✅ Your theme applied
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: lightTheme.colors.primary, // ✅ Your theme applied
    marginTop: 10,
  },
  userEmail: {
    fontSize: 16,
    color: lightTheme.colors.textSecondary, // ✅ Your theme applied
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: lightTheme.colors.outline, // ✅ Your theme applied
    marginVertical: 15,
  },
  profileInfo: {
    width: "100%",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: lightTheme.colors.primary, // ✅ Your theme applied
  },
  infoText: {
    fontSize: 16,
    color: lightTheme.colors.text, // ✅ Your theme applied
    marginTop: 5,
  },
  actions: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  editProfileButton: {
    backgroundColor: lightTheme.colors.surface, // ✅ Your theme applied
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: lightTheme.colors.primary, // ✅ Your theme applied
  },
  editProfileText: {
    fontSize: 16,
    fontWeight: "bold",
    color: lightTheme.colors.primary, // ✅ Your theme applied
  },
  logoutButton: {
    paddingVertical: 8,
    width: "80%",
    borderRadius: 10,
  },
});