"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Divider, Button } from "react-native-paper";
import { getReportById } from "../../services/report-service";
import {
  type PotholeReport,
  ReportStatus,
  SeverityLevel,
} from "../../../lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "expo-router";

const { height } = Dimensions.get("window");

export interface ReportDetailsSheetRef {
  open: (reportId: string) => void;
  close: () => void;
}

const ReportDetailsSheet = forwardRef<ReportDetailsSheetRef, {}>((_, ref) => {
  const [report, setReport] = useState<PotholeReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const router = useRouter();

  useImperativeHandle(ref, () => ({
    open: (reportId: string) => {
      fetchReportDetails(reportId);
      setVisible(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 10,
        velocity: 3,
        overshootClamping: false,
      }).start();
    },
    close: () => {
      Animated.spring(slideAnim, {
        toValue: height,
        useNativeDriver: true,
        tension: 65,
        friction: 12,
        velocity: 8,
      }).start(() => {
        setVisible(false);
        setReport(null);
      });
    },
  }));

  const fetchReportDetails = async (reportId: string) => {
    try {
      setLoading(true);
      setError(null);
      const reportData = await getReportById(reportId);
      if (reportData) {
        setReport(reportData);
      } else {
        setError("Report not found");
      }
    } catch (err) {
      console.error("Error fetching report:", err);
      setError("Failed to load report details");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    Animated.spring(slideAnim, {
      toValue: height,
      useNativeDriver: true,
      tension: 65,
      friction: 12,
      velocity: 8,
    }).start(() => {
      setVisible(false);
      setReport(null);
    });
  };

  const handleViewFullReport = () => {
    if (report?.id) {
      handleClose();
      // Navigate to the full report details page
      router.push(`/admin/report-details/${report.id}`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case ReportStatus.FIXED:
        return "#10B981";
      case ReportStatus.IN_PROGRESS:
        return "#3B82F6";
      case ReportStatus.REJECTED:
        return "#6B7280";
      default:
        return "#64748B";
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case SeverityLevel.DANGER:
        return "#DC2626";
      case SeverityLevel.MEDIUM:
        return "#F59E0B";
      case SeverityLevel.LOW:
        return "#10B981";
      default:
        return "#64748B";
    }
  };

  const formatStatus = (status?: string) => {
    if (!status) return "Unknown";
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        onPress={handleClose}
        activeOpacity={1}
      />
      <Animated.View
        style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.handle} />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading report details...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={48}
              color="#EF4444"
            />
            <Text style={styles.errorText}>{error}</Text>
            <Button
              mode="contained"
              onPress={handleClose}
              style={styles.closeButton}
            >
              Close
            </Button>
          </View>
        ) : report ? (
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.title}>
                  {report.category || "Pothole Report"}
                </Text>
                <Text style={styles.date}>{formatDate(report.created_at)}</Text>
              </View>
              <TouchableOpacity style={styles.closeIcon} onPress={handleClose}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {report.images && report.images.length > 0 && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: report.images[0] }}
                  style={styles.image}
                />
                {report.images.length > 1 && (
                  <View style={styles.imageCountBadge}>
                    <Text style={styles.imageCountText}>
                      +{report.images.length - 1}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.detailsContainer}>
              <View style={styles.badgesContainer}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: getSeverityColor(report.severity) },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {report.severity || "Unknown"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: getStatusColor(report.status) },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {formatStatus(report.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.locationContainer}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={20}
                  color="#3B82F6"
                />
                <Text style={styles.location}>
                  {report.location || "Unknown location"}
                </Text>
              </View>

              <Divider style={styles.divider} />

              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>
                {report.description || "No description provided"}
              </Text>

              <Divider style={styles.divider} />

              <Text style={styles.sectionTitle}>Reporter</Text>
              <View style={styles.reporterContainer}>
                {report.profiles?.avatar_url ? (
                  <Image
                    source={{ uri: report.profiles.avatar_url }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {(report.profiles?.username || "A")
                        .substring(0, 1)
                        .toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.reporterName}>
                  {report.profiles?.username || "Anonymous"}
                </Text>
              </View>

              <Button
                mode="contained"
                onPress={handleViewFullReport}
                style={styles.viewButton}
              >
                View Full Report
              </Button>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No report data available</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 40 : 16,
    maxHeight: height * 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 20, // Increase elevation for Android
    zIndex: 1001, // Ensure this is higher than the tab bar
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#E2E8F0",
    borderRadius: 2.5,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 8,
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#64748B",
  },
  closeIcon: {
    padding: 4,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageCountBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  imageCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  detailsContainer: {
    paddingBottom: 24,
  },
  badgesContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  location: {
    fontSize: 14,
    color: "#334155",
    marginLeft: 8,
    flex: 1,
    fontWeight: "400",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
    fontWeight: "400",
  },
  reporterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  reporterName: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "500",
  },
  viewButton: {
    marginTop: 16,
    marginBottom: 24, // Add more bottom margin
    backgroundColor: "#3B82F6",
    borderRadius: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
  },
  errorContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
});

export default ReportDetailsSheet;
