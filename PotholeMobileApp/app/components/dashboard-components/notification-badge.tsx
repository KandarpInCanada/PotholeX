"use client";

import { useState, useEffect, useRef } from "react";
import { StyleSheet, Text } from "react-native";
import { countUnreadNotifications } from "../../../lib/notifications";
import { MotiView } from "moti";
import { useAuth } from "../../../context/auth-context";
import { supabase } from "../../../lib/supabase";

interface NotificationBadgeProps {
  isAdmin?: boolean;
}

export default function NotificationBadge({
  isAdmin = false,
}: NotificationBadgeProps) {
  const [count, setCount] = useState(0);
  const { user } = useAuth();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCount = async () => {
      if (!user) return;

      try {
        const unreadCount = await countUnreadNotifications(isAdmin);
        if (isMounted) {
          setCount(unreadCount);
        }
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    // Initial fetch
    fetchCount();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`notification-count-${isAdmin ? "admin" : "user"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `for_admins=eq.${isAdmin}`,
        },
        () => {
          // When any notification changes, update the count
          fetchCount();
        }
      )
      .subscribe();

    // Set up polling as a fallback (every 15 seconds)
    pollingIntervalRef.current = setInterval(fetchCount, 15000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isAdmin, user]);

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
