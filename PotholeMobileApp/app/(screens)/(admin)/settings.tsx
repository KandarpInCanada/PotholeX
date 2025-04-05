"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Divider, Button, TextInput, Dialog, Portal } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../../context/auth-context";

export default function AdminSettings() {
  const { signOut } = useAuth();

  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoApproveReports, setAutoApproveReports] = useState(false);
  const [aiDetectionEnabled, setAiDetectionEnabled] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // API settings
  const [apiUrl, setApiUrl] = useState("https://api.potholex.com");
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [editingApiUrl, setEditingApiUrl] = useState("");

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out");
    }
  };

  const saveApiSettings = () => {
    setApiUrl(editingApiUrl);
    setShowApiDialog(false);
    Alert.alert("Success", "API settings updated successfully");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Settings</Text>

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
                name="check-circle-outline"
                size={24}
                color="#3B82F6"
              />
              <Text style={styles.settingLabel}>Auto-approve Reports</Text>
            </View>
            <Switch
              value={autoApproveReports}
              onValueChange={setAutoApproveReports}
              trackColor={{ false: "#CBD5E1", true: "#93C5FD" }}
              thumbColor={autoApproveReports ? "#3B82F6" : "#F1F5F9"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="brain" size={24} color="#3B82F6" />
              <Text style={styles.settingLabel}>AI Pothole Detection</Text>
            </View>
            <Switch
              value={aiDetectionEnabled}
              onValueChange={setAiDetectionEnabled}
              trackColor={{ false: "#CBD5E1", true: "#93C5FD" }}
              thumbColor={aiDetectionEnabled ? "#3B82F6" : "#F1F5F9"}
            />
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>

          <TouchableOpacity
            style={styles.apiSettingItem}
            onPress={() => {
              setEditingApiUrl(apiUrl);
              setShowApiDialog(true);
            }}
          >
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="api" size={24} color="#3B82F6" />
              <View>
                <Text style={styles.settingLabel}>API Endpoint</Text>
                <Text style={styles.apiUrl}>{apiUrl}</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="pencil" size={20} color="#64748B" />
          </TouchableOpacity>

          <View style={styles.apiNote}>
            <MaterialCommunityIcons
              name="information-outline"
              size={16}
              color="#64748B"
            />
            <Text style={styles.apiNoteText}>
              Changes to API settings will affect all pothole detection
              functionality.
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <Button
            mode="outlined"
            icon="logout"
            onPress={() => setShowLogoutDialog(true)}
            style={styles.logoutButton}
            textColor="#EF4444"
          >
            Logout from Admin
          </Button>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>PotholeX Admin v1.0.0</Text>
        </View>
      </ScrollView>

      <Portal>
        <Dialog
          visible={showApiDialog}
          onDismiss={() => setShowApiDialog(false)}
        >
          <Dialog.Title>Edit API Endpoint</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="API URL"
              value={editingApiUrl}
              onChangeText={setEditingApiUrl}
              mode="outlined"
              style={styles.apiInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowApiDialog(false)}>Cancel</Button>
            <Button onPress={saveApiSettings}>Save</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={showLogoutDialog}
          onDismiss={() => setShowLogoutDialog(false)}
        >
          <Dialog.Title>Logout</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to logout from the admin portal?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLogoutDialog(false)}>Cancel</Button>
            <Button onPress={handleLogout} textColor="#EF4444">
              Logout
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 16,
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
  divider: {
    marginVertical: 8,
    backgroundColor: "#E2E8F0",
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
  logoutButton: {
    marginTop: 8,
    borderColor: "#EF4444",
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  versionText: {
    fontSize: 14,
    color: "#94A3B8",
  },
});
