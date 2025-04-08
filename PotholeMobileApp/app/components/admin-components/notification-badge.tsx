"use client";

import { useState, useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import { countUnreadNotifications } from "../../../lib/notifications";
import { MotiView } from "moti";

interface NotificationBadgeProps {
  isAdmin: boolean;
}

export default function NotificationBadge({ isAdmin }: NotificationBadgeProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchCount = async () => {
      try {
        const unreadCount = await countUnreadNotifications(isAdmin);
        if (isMounted) {
          setCount(unreadCount);
        }
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 60000); // Check every minute

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAdmin]);

  if (count === 0) return null;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 15 }}
      style={styles.badge}
    >
      <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    zIndex: 10,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
