"use client";

import type React from "react";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
} from "react-native";
import { Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { formatDistanceToNow } from "date-fns";
import {
  type PotholeReport,
  ReportStatus,
  SeverityLevel,
} from "../../../../lib/supabase";

interface ReportCardProps {
  item: PotholeReport;
  index: number;
  onLike: (reportId: string) => void;
  onPress: () => void;
}

const SEVERITY_COLORS = {
  [SeverityLevel.DANGER]: "#DC2626",
  [SeverityLevel.MEDIUM]: "#F59E0B",
  [SeverityLevel.LOW]: "#10B981",
};

const STATUS_COLORS = {
  [ReportStatus.SUBMITTED]: "#64748B",
  [ReportStatus.IN_PROGRESS]: "#2563EB",
  [ReportStatus.FIXED]: "#059669",
  [ReportStatus.REJECTED]: "#6B7280",
};

const ReportCard: React.FC<ReportCardProps> = ({
  item,
  index,
  onLike,
  onPress,
}) => {
  const [pressed, setPressed] = useState(false);
  const [liked, setLiked] = useState(false);
  const profile = item.profiles;

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

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: "timing",
        duration: 500,
        delay: index * 100,
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
          transition={{ type: "timing", duration: 100 }}
        >
          {item.images && item.images.length > 0 && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.images[0] }}
                style={styles.image}
                defaultSource={require("../../../assets/placeholder-image.svg")}
              />
              <View style={styles.gradientOverlay} />

              <View style={styles.floatingCategory}>
                <MaterialCommunityIcons
                  name={getCategoryIcon(item.category)}
                  size={14}
                  color="#475569"
                />
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>

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
            <View style={styles.cardHeader}>
              <View style={styles.userInfo}>
                <Image
                  style={styles.avatar}
                  source={
                    profile?.avatar_url
                      ? { uri: profile.avatar_url }
                      : require("../../../assets/default-avatar.png")
                  }
                />
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>
                    {profile?.username || "Anonymous"}
                  </Text>
                  <Text style={styles.date}>{formatDate(item.created_at)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.locationContainer}>
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color="#0284c7"
              />
              <Text style={styles.location} numberOfLines={1}>
                {item.location}
              </Text>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.tagsContainer}>
              <Chip
                style={[
                  styles.severityChip,
                  {
                    backgroundColor:
                      SEVERITY_COLORS[item.severity as SeverityLevel] ||
                      "#6B7280",
                  },
                ]}
                textStyle={styles.chipText}
              >
                {item.severity}
              </Chip>
              <Chip
                style={[
                  styles.statusChip,
                  {
                    backgroundColor:
                      STATUS_COLORS[item.status as ReportStatus] || "#6B7280",
                  },
                ]}
                textStyle={styles.chipText}
              >
                {item.status}
              </Chip>
            </View>

            <View style={styles.footer}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                    color={liked ? "#0284c7" : "#64748B"}
                  />
                  <Text
                    style={[styles.interactionText, liked && styles.likedText]}
                  >
                    {(item.likes || 0) + (liked ? 1 : 0)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.interactionButton, { marginLeft: 8 }]}
                >
                  <MaterialCommunityIcons
                    name="comment-outline"
                    size={18}
                    color="#64748B"
                  />
                  <Text style={styles.interactionText}>
                    {item.comments || 0}
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

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardPressed: {
    backgroundColor: "#F8FAFC",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  floatingCategory: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  imageCountBadge: {
    position: "absolute",
    right: 12,
    top: 12,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
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
    padding: 18,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#F8FAFC",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  location: {
    fontSize: 14,
    color: "#0284c7",
    marginLeft: 6,
    fontWeight: "600",
    lineHeight: 20,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
    marginBottom: 14,
    fontWeight: "400",
    letterSpacing: -0.2,
  },
  tagsContainer: {
    flexDirection: "row",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 6,
  },
  severityChip: {
    height: 30,
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  statusChip: {
    height: 30,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    includeFontPadding: false,
    textTransform: "capitalize",
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 14,
    borderTopWidth: 1.5,
    borderTopColor: "#F1F5F9",
    marginTop: 8,
  },
  interactionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  likedButton: {
    backgroundColor: "#EFF6FF",
  },
  interactionText: {
    marginLeft: 6,
    fontSize: 13.5,
    color: "#475569",
    fontWeight: "600",
  },
  likedText: {
    color: "#0284c7",
  },
});

export default ReportCard;
