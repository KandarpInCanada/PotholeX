"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// Define notification types
type NotificationType = "report" | "user" | "system";

// Define notification interface
interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLink?: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data for notifications
  const mockNotifications: Notification[] = [
    {
      id: "1",
      type: "report",
      title: "New Report Submitted",
      message: "A new pothole report has been submitted in Downtown area.",
      timestamp: "2025-04-05T10:30:00Z",
      read: false,
      actionLink: "/(screens)/(admin)/report-list",
    },
    {
      id: "2",
      type: "user",
      title: "New User Registration",
      message: "John Doe has registered as a new user.",
      timestamp: "2025-04-04T15:45:00Z",
      read: false,
      actionLink: "/(screens)/(admin)/users",
    },
    {
      id: "3",
      type: "system",
      title: "System Update",
      message: "The system has been updated to version 1.2.0.",
      timestamp: "2025-04-03T08:15:00Z",
      read: true,
    },
    {
      id: "4",
      type: "report",
      title: "Report Status Updated",
      message: "A report has been marked as fixed by the maintenance team.",
      timestamp: "2025-04-02T14:20:00Z",
      read: true,
      actionLink: "/(screens)/(admin)/report-list",
    },
    {
      id: "5",
      type: "user",
      title: "User Feedback",
      message: "A user has provided feedback on the app experience.",
      timestamp: "2025-04-01T11:10:00Z",
      read: true,
    },
  ];

  useEffect(() => {
    // In a real app, you would fetch notifications from an API
    // For now, we'll use mock data
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    markAsRead(notification.id);

    // Navigate if there's an action link
    if (notification.actionLink) {
      router.push(notification.actionLink);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "report":
        return "clipboard-text";
      case "user":
        return "account";
      case "system":
        return "cog";
      default:
        return "bell";
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case "report":
        return "#3B82F6"; // Blue
      case "user":
        return "#8B5CF6"; // Purple
      case "system":
        return "#10B981"; // Green
      default:
        return "#64748B"; // Gray
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300 }}
    >
      <TouchableOpacity onPress={() => handleNotificationPress(item)}>
        <Card
          style={[styles.notificationCard, !item.read && styles.unreadCard]}
          mode="elevated"
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <View
                style={[
                  styles.iconBackground,
                  { backgroundColor: `${getNotificationColor(item.type)}20` },
                ]}
              >
                <MaterialCommunityIcons
                  name={getNotificationIcon(item.type)}
                  size={24}
                  color={getNotificationColor(item.type)}
                />
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </MotiView>
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header Banner */}
      <LinearGradient
        colors={["#3B82F6", "#2563EB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerBanner}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${
                    unreadCount > 1 ? "s" : ""
                  }`
                : "You're all caught up!"}
            </Text>
          </View>

          {unreadCount > 0 && (
            <Button
              mode="contained"
              onPress={markAllAsRead}
              style={styles.markReadButton}
              buttonColor="rgba(255, 255, 255, 0.2)"
            >
              Mark all as read
            </Button>
          )}
        </View>
      </LinearGradient>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="bell-off-outline"
              size={64}
              color="#94A3B8"
            />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>
              You don't have any notifications yet
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerBanner: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  markReadButton: {
    borderRadius: 8,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  notificationCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
    backgroundColor: "#F8FAFC",
  },
  cardContent: {
    flexDirection: "row",
    padding: 16,
  },
  iconContainer: {
    marginRight: 16,
    position: "relative",
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  contentContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 8,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: "#64748B",
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
});
