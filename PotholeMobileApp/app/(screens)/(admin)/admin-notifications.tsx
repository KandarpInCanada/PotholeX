"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Divider, Portal } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  getNotifications,
  markNotificationsAsRead,
} from "../../../lib/notifications";
import { MotiView } from "moti";
import { useAuth } from "../../../context/auth-context";
import ReportDetailsSheet, {
  type ReportDetailsSheetRef,
} from "../../components/admin-components/report-details-sheet";
import { Swipeable } from "react-native-gesture-handler";
import { supabase } from "../../../lib/supabase";
import { FlashList } from "@shopify/flash-list";

interface Notification {
  id: string;
  title: string;
  message: string;
  report_id?: string;
  is_read: boolean;
  created_at: string;
  for_admins: boolean;
}

export default function AdminNotificationsScreen() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const reportDetailsRef = useRef<ReportDetailsSheetRef>(null);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAdmin) {
      router.replace("/(screens)/(dashboard)/home");
      return;
    }

    try {
      setLoading(true);
      const fetchedNotifications = await getNotifications(true);
      setNotifications(fetchedNotifications as Notification[]);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin, router]);

  // Set up real-time subscription to notifications table
  useEffect(() => {
    if (!isAdmin) return;

    // Set up Supabase real-time subscription
    const subscription = supabase
      .channel("admin-notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `for_admins=eq.true`,
        },
        (payload) => {
          console.log("Admin notification change received:", payload);
          // Refresh notifications when there's a change
          fetchNotifications();
        }
      )
      .subscribe();

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [isAdmin, fetchNotifications]);

  // Set up polling as a fallback mechanism
  useEffect(() => {
    if (!isAdmin) return;

    // Poll for new notifications every 30 seconds as a fallback
    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isAdmin, fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleNotificationPress = async (notification: Notification) => {
    try {
      // Mark notification as read
      if (!notification.is_read) {
        await markNotificationsAsRead([notification.id]);

        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
      }

      // Show report details if there's a report_id
      if (notification.report_id) {
        reportDetailsRef.current?.open(notification.report_id);
      }
    } catch (error) {
      console.error("Error handling notification:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderNotificationItem = ({
    item,
    index,
  }: {
    item: Notification;
    index: number;
  }) => {
    // Function to handle notification deletion
    const handleDelete = async (notificationId: string) => {
      try {
        // Delete the notification from the database
        const { error } = await supabase
          .from("notifications")
          .delete()
          .eq("id", notificationId);

        if (error) throw error;

        // Update local state to remove the deleted notification
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      } catch (error) {
        console.error("Error deleting notification:", error);
        Alert.alert("Error", "Failed to delete notification");
      }
    };

    // Render right actions (delete button) when swiped
    const renderRightActions = () => {
      return (
        <MotiView
          from={{ opacity: 0, translateX: 50 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: "spring", damping: 20 }}
          style={styles.deleteAction}
        >
          <TouchableOpacity
            onPress={() => {
              handleDelete(item.id);
              swipeableRefs.current.get(item.id)?.close(); // Close the swipeable after deletion
            }}
            style={{
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons name="delete" size={24} color="#FFFFFF" />
            <Text style={styles.deleteActionText}>Delete</Text>
          </TouchableOpacity>
        </MotiView>
      );
    };

    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: "spring",
          damping: 15,
          delay: index * 60,
          mass: 0.8,
          stiffness: 100,
        }}
      >
        <Swipeable
          ref={(ref) => {
            if (ref) {
              swipeableRefs.current.set(item.id, ref);
            } else {
              swipeableRefs.current.delete(item.id);
            }
          }}
          renderRightActions={renderRightActions}
          rightThreshold={40}
          overshootRight={false}
          onSwipeableOpen={() => {
            // Close other open items when this one is opened
            swipeableRefs.current.forEach((ref, id) => {
              if (id !== item.id) {
                ref.close();
              }
            });
          }}
        >
          <TouchableOpacity
            style={[
              styles.notificationItem,
              item.is_read
                ? styles.readNotification
                : styles.unreadNotification,
            ]}
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.notificationIcon}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={28}
                color={item.is_read ? "#64748B" : "#3B82F6"}
              />
              {!item.is_read && (
                <MotiView
                  from={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 10 }}
                  style={styles.unreadDot}
                />
              )}
            </View>

            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.notificationDate}>
                {formatDate(item.created_at)}
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#94A3B8"
            />
          </TouchableOpacity>
        </Swipeable>
      </MotiView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <LinearGradient
        colors={["#374151", "#1F2937"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerBanner}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              Stay updated on new pothole reports
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Notification List */}
      <FlashList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#3B82F6"]}
          />
        }
        estimatedItemSize={100}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="bell-off-outline"
              size={64}
              color="#94A3B8"
            />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>
              {loading
                ? "Loading notifications..."
                : "You'll be notified about new reports here"}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <Divider style={styles.divider} />}
      />

      {/* Report Details Sheet */}
      <Portal>
        <ReportDetailsSheet ref={reportDetailsRef} />
      </Portal>
    </SafeAreaView>
  );
}

// Add these styles at the end of the styles object
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4FF",
  },
  headerBanner: {
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
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  unreadNotification: {
    backgroundColor: "#EFF6FF",
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  readNotification: {
    borderLeftWidth: 0,
  },
  notificationIcon: {
    position: "relative",
    marginRight: 12,
  },
  unreadDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationDate: {
    fontSize: 12,
    color: "#94A3B8",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
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
  deleteAction: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "100%",
    flexDirection: "column",
  },
  deleteActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
});
