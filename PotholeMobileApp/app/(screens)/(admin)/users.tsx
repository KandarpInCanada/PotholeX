/**
 * Admin Users Screen
 *
 * This screen allows administrators to view and manage all users in the system.
 * Admins can search for users, view their details, and grant or revoke admin privileges.
 *
 * Key features:
 * - User search functionality
 * - Admin privilege management
 * - User information display with avatars
 * - Animated UI elements for better user experience
 */

"use client";

import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Avatar,
  Searchbar,
  Button,
  Dialog,
  Portal,
  Card,
  Divider,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { EXPO_PUBLIC_SUPABASE_SECRET_KEY } from "@env";
import { LinearGradient } from "expo-linear-gradient";
import { supabase, createAdminClient } from "../../../lib/supabase";
import {
  grantAdminPrivileges,
  revokeAdminPrivileges,
} from "../../services/admin-service";
import { useAuth } from "../../../context/auth-context";
import { MotiView } from "moti";
import { FlashList } from "@shopify/flash-list";

/**
 * Interface for user data structure
 */
interface User {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  is_admin: boolean;
  email: string | null;
}

export default function UsersScreen() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAdminDialog, setShowAdminDialog] = useState(false);

  /**
   * Fetch users when component mounts
   */
  useEffect(() => {
    fetchUsers();
  }, []);

  /**
   * Filter users when search query or users list changes
   */
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            (user.username && user.username.toLowerCase().includes(query)) ||
            (user.full_name && user.full_name.toLowerCase().includes(query)) ||
            (user.email && user.email.toLowerCase().includes(query))
        )
      );
    }
  }, [users, searchQuery]);

  /**
   * Fetches all users from the database with their admin status and email
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      if (!isAdmin) {
        console.error("Permission denied: User is not an admin");
        Alert.alert(
          "Permission Error",
          "Only administrators can view user data"
        );
        return;
      }
      const adminClient = createAdminClient(EXPO_PUBLIC_SUPABASE_SECRET_KEY);
      const { data, error } = await adminClient
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const usersWithEmail = await Promise.all(
        (data || []).map(async (profile) => {
          // Try to get email using the admin client
          let email = null;
          try {
            const { data: userData, error: userError } =
              await adminClient.auth.admin.getUserById(profile.id);
            if (!userError && userData && userData.user) {
              email = userData.user.email;
            }
          } catch (emailError) {
            console.error("Error fetching user email:", emailError);
          }
          return {
            ...profile,
            email: email || "Email hidden for privacy",
          };
        })
      );

      setUsers(usersWithEmail);
      setFilteredUsers(usersWithEmail);
    } catch (error) {
      console.error("Error fetching users:", error);
      const { data } = await supabase.from("profiles").select("*");
      setUsers(data || []);
      setFilteredUsers(data || []);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Opens the admin privilege dialog for a user
   */
  const handleToggleAdmin = (user: User) => {
    setSelectedUser(user);
    setShowAdminDialog(true);
  };

  /**
   * Grants or revokes admin privileges for the selected user
   */
  const confirmToggleAdmin = async () => {
    if (!selectedUser) return;

    try {
      if (selectedUser.is_admin) {
        await revokeAdminPrivileges(selectedUser.id);
      } else {
        await grantAdminPrivileges(selectedUser.id);
      }

      // Update local state
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, is_admin: !u.is_admin } : u
        )
      );

      setShowAdminDialog(false);
    } catch (error) {
      console.error("Error toggling admin status:", error);
    }
  };

  /**
   * Renders a user item with animations
   */
  const renderUserItem = ({ item, index }: { item: User; index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: "spring",
        delay: index * 70, // Staggered animation based on index
        damping: 15,
        mass: 0.9,
        stiffness: 100,
      }}
    >
      <Card style={styles.userCard} mode="elevated">
        <View style={{ overflow: "hidden", borderRadius: 12 }}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.userInfo}>
              {item.avatar_url ? (
                <Avatar.Image
                  size={60}
                  source={{ uri: item.avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <Avatar.Text
                  size={60}
                  label={(item.full_name || item.username || item.email || "U")
                    .substring(0, 2)
                    .toUpperCase()}
                  style={styles.avatar}
                />
              )}

              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {item.full_name || item.username || "Anonymous"}
                </Text>
                <Text style={styles.userEmail}>
                  {item.email || "No email available"}
                </Text>
                <Text style={styles.userDate}>
                  Joined: {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.userActions}>
              {item.is_admin && (
                <MotiView
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  style={styles.adminChip}
                >
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={16}
                    color="#FFFFFF"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.adminChipText}>Admin</Text>
                </MotiView>
              )}

              <TouchableOpacity
                style={[
                  styles.adminButton,
                  item.is_admin && styles.revokeButton,
                ]}
                onPress={() => handleToggleAdmin(item)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={item.is_admin ? "shield-off" : "shield"}
                  size={16}
                  color={item.is_admin ? "#EF4444" : "#3B82F6"}
                />
                <Text
                  style={[
                    styles.adminButtonText,
                    item.is_admin && styles.revokeButtonText,
                  ]}
                >
                  {item.is_admin ? "Revoke Admin" : "Make Admin"}
                </Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </View>
      </Card>
    </MotiView>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        {/* Header Banner */}
        <LinearGradient
          colors={["#374151", "#1F2937"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerBanner}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>User Management</Text>
              <Text style={styles.headerSubtitle}>
                View and manage user accounts and permissions
              </Text>
            </View>
          </View>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search users..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              iconColor="#3B82F6"
              inputStyle={styles.searchInput}
            />
          </View>
        </LinearGradient>
      </View>

      <FlashList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        estimatedItemSize={150}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="account-search"
              size={64}
              color="#94A3B8"
            />
            <Text style={styles.emptyText}>No users found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? "Try a different search term"
                : "There are no users in the system yet"}
            </Text>
          </View>
        }
      />

      {/* Admin Privilege Dialog */}
      <Portal>
        <Dialog
          visible={showAdminDialog}
          onDismiss={() => setShowAdminDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>
            {selectedUser?.is_admin
              ? "Revoke Admin Access"
              : "Grant Admin Access"}
          </Dialog.Title>
          <Dialog.Content>
            <View style={styles.dialogContent}>
              <MaterialCommunityIcons
                name={selectedUser?.is_admin ? "shield-off" : "shield"}
                size={32}
                color={selectedUser?.is_admin ? "#EF4444" : "#3B82F6"}
                style={styles.dialogIcon}
              />
              <Text style={styles.dialogText}>
                {selectedUser?.is_admin
                  ? `Are you sure you want to revoke admin privileges from ${
                      selectedUser?.username || "this user"
                    }?`
                  : `Are you sure you want to grant admin privileges to ${
                      selectedUser?.username || "this user"
                    }?`}
              </Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button
              onPress={() => setShowAdminDialog(false)}
              textColor="#64748B"
              style={styles.dialogButton}
              labelStyle={styles.dialogButtonLabel}
            >
              Cancel
            </Button>
            <Button
              onPress={confirmToggleAdmin}
              textColor={selectedUser?.is_admin ? "#EF4444" : "#3B82F6"}
              style={styles.dialogButton}
              labelStyle={styles.dialogButtonLabel}
            >
              Confirm
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
    backgroundColor: "#F0F4FF", // Updated to light blue background
  },
  content: {
    flex: 0,
  },
  headerBanner: {
    backgroundColor: "#3B82F6",
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    margin: 16,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  avatarHeader: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  searchContainer: {
    marginTop: 20,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    height: 48,
  },
  searchInput: {
    fontSize: 15,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Increase this value to ensure content isn't hidden behind the tab bar
  },
  userCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  userInfo: {
    flexDirection: "row",
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: "#3B82F6",
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  userEmail: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  userDate: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  userActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  adminChip: {
    backgroundColor: "#3B82F6",
    borderRadius: 4,
    paddingHorizontal: 12,
    height: 36,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  adminChipText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
    padding: 0,
    margin: 0,
    lineHeight: 14,
    height: 14,
  },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4, // Changed from rounded to square
  },
  adminButtonText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  revokeButton: {
    backgroundColor: "#FEF2F2",
  },
  revokeButtonText: {
    color: "#EF4444",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
  },
  dialog: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 8,
    maxWidth: "85%",
    alignSelf: "center",
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  dialogContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  dialogText: {
    flex: 1,
    fontSize: 16,
    color: "#334155",
    lineHeight: 24,
    marginLeft: 16,
  },
  dialogIcon: {
    marginRight: 4,
  },
  dialogActions: {
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dialogButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 100,
  },
  dialogButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});
