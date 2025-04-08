"use client";

import type React from "react";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { formatDistanceToNow } from "date-fns";
import {
  type PotholeReport,
  ReportStatus,
  SeverityLevel,
} from "../../../../lib/supabase";
import { memo } from "react";

interface ReportCardProps {
  item: PotholeReport;
  index: number;
  onLike: (reportId: string) => void;
  onPress: () => void;
}

// Update the ReportCard component to match the overall UI design
const ReportCard: React.FC<ReportCardProps> = ({
  item,
  index,
  onLike,
  onPress,
}) => {
  const [pressed, setPressed] = useState(false);
  const [liked, setLiked] = useState(false);
  const profile = item?.profiles || null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "pothole":
        return "road";
      case "manhole":
        return "circle-slice-8";
      case "crack":
        return "alert-octagon";
      case "surface break":
        return "road-variant";
      case "deep hole":
        return "arrow-collapse-down";
      case "edge damage":
        return "road-variant";
      case "sinkhole":
        return "arrow-collapse-down";
      default:
        return "alert-circle";
    }
  };

  const handleLike = () => {
    if (!liked && item.id) {
      setLiked(true);
      onLike(item.id);
    }
  };

  // Add this helper function inside the ReportCard component, before the return statement
  const wasRecentlyUpdated = (item: PotholeReport) => {
    if (!item.updated_at || !item.created_at) return false;

    // Check if updated_at is different from created_at (meaning it was updated)
    const createdDate = new Date(item.created_at).getTime();
    const updatedDate = new Date(item.updated_at).getTime();

    // Check if it was updated in the last 24 hours
    const oneDayAgo = new Date().getTime() - 24 * 60 * 60 * 1000;

    return updatedDate > createdDate && updatedDate > oneDayAgo;
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: "timing",
        duration: 300,
        delay: Math.min(index * 50, 300), // Cap the delay to prevent too much staggering
      }}
    >
      <Pressable
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <MotiView
          animate={{ scale: pressed ? 0.98 : 1 }}
          transition={{
            type: "timing",
            duration: 100,
          }}
        >
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.userInfo}>
              {profile?.avatar_url ? (
                <Image
                  style={styles.avatar}
                  source={{ uri: profile.avatar_url }}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>
                    {(profile?.username || "A").substring(0, 1).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {profile?.username || "Anonymous"}
                </Text>
                <Text style={styles.date}>{formatDate(item.created_at)}</Text>
              </View>
            </View>

            {wasRecentlyUpdated(item) && (
              <View style={styles.notificationBadge}>
                <MaterialCommunityIcons name="bell" size={16} color="#FFFFFF" />
              </View>
            )}
          </View>

          {/* Image */}
          {item?.images && item.images.length > 0 && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.images[0] }} style={styles.image} />

              {/* Category Badge */}
              <View style={styles.categoryBadge}>
                <MaterialCommunityIcons
                  name={getCategoryIcon(item.category || "")}
                  size={14}
                  color="#475569"
                />
                <Text style={styles.categoryText}>
                  {item.category || "Unknown"}
                </Text>
              </View>

              {/* Multiple Images Badge */}
              {item.images.length > 1 && (
                <View style={styles.imageCountBadge}>
                  <MaterialCommunityIcons
                    name="image-multiple"
                    size={14}
                    color="white"
                  />
                  <Text style={styles.imageCountText}>
                    +{item.images.length - 1}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.contentContainer}>
            {/* Location */}
            <View style={styles.locationContainer}>
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color="#3B82F6"
              />
              <Text style={styles.location} numberOfLines={1}>
                {item?.location || "Unknown location"}
              </Text>
            </View>

            {/* Description */}
            <Text style={styles.description} numberOfLines={2}>
              {item?.description || "No description provided"}
            </Text>

            {/* Status and Severity Badges */}
            <View style={styles.badgesContainer}>
              <View
                style={[
                  styles.severityBadge,
                  {
                    backgroundColor:
                      SEVERITY_COLORS[
                        (item?.severity as SeverityLevel) ||
                          SeverityLevel.MEDIUM
                      ] || "#6B7280",
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {item?.severity || "Medium"}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      STATUS_COLORS[
                        (item?.status as ReportStatus) || ReportStatus.SUBMITTED
                      ] || "#6B7280",
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {(item?.status || "submitted").replace("_", " ")}
                </Text>
              </View>
            </View>

            {/* Footer with Like, Comment, Share */}
            <View style={styles.footer}>
              <View style={styles.interactionButtons}>
                <TouchableOpacity
                  style={[
                    styles.interactionButton,
                    liked && styles.likedButton,
                  ]}
                  onPress={handleLike}
                >
                  <MaterialCommunityIcons
                    name={liked ? "thumb-up" : "thumb-up-outline"}
                    size={18}
                    color={liked ? "#3B82F6" : "#64748B"}
                  />
                  <Text
                    style={[styles.interactionText, liked && styles.likedText]}
                  >
                    {(item?.likes || 0) + (liked ? 1 : 0)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.interactionButton}>
                  <MaterialCommunityIcons
                    name="comment-outline"
                    size={18}
                    color="#64748B"
                  />
                  <Text style={styles.interactionText}>
                    {item?.comments || 0}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.interactionButton}>
                <MaterialCommunityIcons
                  name="share-outline"
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>
        </MotiView>
      </Pressable>
    </MotiView>
  );
};

// Update the SEVERITY_COLORS and STATUS_COLORS constants to match the UI design
const SEVERITY_COLORS = {
  [SeverityLevel.DANGER]: "#DC2626", // Red for danger
  [SeverityLevel.MEDIUM]: "#F59E0B", // Amber for medium
  [SeverityLevel.LOW]: "#10B981", // Green for low
};

const STATUS_COLORS = {
  [ReportStatus.SUBMITTED]: "#64748B", // Gray for submitted
  [ReportStatus.IN_PROGRESS]: "#3B82F6", // Blue for in progress
  [ReportStatus.FIXED]: "#10B981", // Green for fixed
  [ReportStatus.REJECTED]: "#6B7280", // Gray for rejected
};

// Update the styles to match the overall UI design
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24, // Updated to more rounded corners
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.7)",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    backgroundColor: "#F8FAFC",
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    lineHeight: 20,
  },
  date: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16, // Updated to more rounded corners
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  imageCountBadge: {
    position: "absolute",
    right: 12,
    top: 12,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16, // Updated to more rounded corners
    flexDirection: "row",
    alignItems: "center",
  },
  imageCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  contentContainer: {
    padding: 16,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#F1F5F9",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16, // Updated to more rounded corners
    alignSelf: "flex-start",
  },
  location: {
    fontSize: 14,
    color: "#3B82F6",
    marginLeft: 6,
    fontWeight: "500",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
    marginBottom: 14,
  },
  badgesContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16, // Updated to more rounded corners
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16, // Updated to more rounded corners
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  interactionButtons: {
    flexDirection: "row",
  },
  interactionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16, // Updated to more rounded corners
    marginRight: 8,
  },
  likedButton: {
    backgroundColor: "#EFF6FF",
  },
  interactionText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  likedText: {
    color: "#3B82F6",
  },
  notificationBadge: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 8,
    right: 8,
  },
});

export default memo(ReportCard, (prevProps, nextProps) => {
  // Only re-render if the item ID changes or if the index changes significantly
  return (
    prevProps.item.id === nextProps.item.id &&
    Math.abs(prevProps.index - nextProps.index) < 5
  );
});
