"use client";

import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Linking,
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { height, width } = Dimensions.get("window");

// Make sure the export interface is properly exported
export interface ReportDetailsSheetRef {
  open: (reportId: string) => void;
  close: () => void;
}

const ReportDetailsSheet = forwardRef<ReportDetailsSheetRef, {}>((_, ref) => {
  const [report, setReport] = useState<PotholeReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const translateY = useSharedValue(height);
  const backgroundOpacity = useSharedValue(0);
  const router = useRouter();

  // Photo gallery state
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Update the ReportDetailsSheet to listen for events
  // Add this inside the component, after the state declarations:

  useEffect(() => {
    // Listen for events to open the report details sheet
    const handleOpenReportDetails = (reportId: string) => {
      fetchReportDetails(reportId);
      setVisible(true);
      backgroundOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
    };

    // Add event listener
    if (global.reportDetailsEvents) {
      global.reportDetailsEvents.on(
        "openReportDetails",
        handleOpenReportDetails
      );
    }

    // Clean up event listener
    return () => {
      if (global.reportDetailsEvents) {
        global.reportDetailsEvents.off(
          "openReportDetails",
          handleOpenReportDetails
        );
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    open: (reportId: string) => {
      fetchReportDetails(reportId);
      setVisible(true);
      backgroundOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
    },
    close: () => {
      backgroundOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withSpring(height, {
        damping: 20,
        stiffness: 90,
      });

      // Reset state after animation
      setTimeout(() => {
        setVisible(false);
        setReport(null);
        setActivePhotoIndex(0);
      }, 300);
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
    backgroundOpacity.value = withTiming(0, { duration: 200 });
    translateY.value = withSpring(height, {
      damping: 20,
      stiffness: 90,
    });

    // Reset state after animation
    setTimeout(() => {
      setVisible(false);
      setReport(null);
      setActivePhotoIndex(0);
    }, 300);
  };

  const handleViewFullReport = () => {
    if (report?.id) {
      handleClose();
      // Navigate to the full report details page
      router.push(`/dashboard/report-details/${report.id}`);
    }
  };

  const handleShareReport = () => {
    // Platform-specific share implementation could be added here
    alert("Share functionality would be implemented here");
  };

  const handleDirections = () => {
    if (report?.latitude && report?.longitude) {
      const scheme = Platform.OS === "ios" ? "maps:" : "geo:";
      const url =
        Platform.OS === "ios"
          ? `${scheme}?ll=${report.latitude},${
              report.longitude
            }&q=${encodeURIComponent(report.location || "Pothole")}`
          : `${scheme}${report.latitude},${
              report.longitude
            }?q=${encodeURIComponent(report.location || "Pothole")}`;

      Linking.openURL(url).catch((err) => {
        console.error("Error opening maps:", err);
        alert("Could not open maps application");
      });
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

  const animatedSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: backgroundOpacity.value,
    };
  });

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[styles.backdrop, animatedBackgroundStyle]}
        onTouchEnd={handleClose}
      />
      <Animated.View style={[styles.container, animatedSheetStyle]}>
        {/* Handle bar for dragging */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

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

            {/* Image Gallery */}
            {report.images && report.images.length > 0 && (
              <View style={styles.galleryContainer}>
                <Image
                  source={{ uri: report.images[activePhotoIndex] }}
                  style={styles.mainImage}
                  resizeMode="cover"
                />

                {/* Thumbnails */}
                {report.images.length > 1 && (
                  <ScrollView
                    horizontal
                    style={styles.thumbnailsContainer}
                    showsHorizontalScrollIndicator={false}
                  >
                    {report.images.map((image, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setActivePhotoIndex(index)}
                        style={[
                          styles.thumbnailButton,
                          activePhotoIndex === index && styles.activeThumbnail,
                        ]}
                      >
                        <Image
                          source={{ uri: image }}
                          style={styles.thumbnail}
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
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
                {report.description &&
                report.description.length > 0 &&
                !/^[a-zA-Z0-9\s.,;:!?]+$/.test(report.description)
                  ? "No valid description provided"
                  : report.description || "No description provided"}
              </Text>

              <Divider style={styles.divider} />

              <Text style={styles.sectionTitle}>Road Condition</Text>
              <Text style={styles.roadCondition}>
                {report.road_condition || "Not specified"}
              </Text>

              <Divider style={styles.divider} />

              <Text style={styles.sectionTitle}>Reported By</Text>
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

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Button
                  mode="contained"
                  onPress={handleViewFullReport}
                  style={styles.viewButton}
                  icon="arrow-right"
                >
                  View Full Report
                </Button>

                <View style={styles.secondaryButtons}>
                  <Button
                    mode="outlined"
                    onPress={handleDirections}
                    style={styles.directionButton}
                    icon="map-marker"
                  >
                    Directions
                  </Button>

                  <Button
                    mode="outlined"
                    onPress={handleShareReport}
                    style={styles.shareButton}
                    icon="share-variant"
                  >
                    Share
                  </Button>
                </View>
              </View>
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
    zIndex: 1100, // Increase z-index to be higher than tab bar
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
    paddingBottom: Platform.OS === "ios" ? 100 : 80, // Increase bottom padding to account for tab bar
    maxHeight: height * 0.9, // Increase max height to show more content
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 30, // Increase elevation for Android
    zIndex: 1101, // Ensure this is higher than the overlay and tab bar
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#E2E8F0",
    borderRadius: 2.5,
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
  galleryContainer: {
    marginBottom: 16,
  },
  mainImage: {
    width: "100%",
    height: 220,
    borderRadius: 16,
  },
  thumbnailsContainer: {
    marginTop: 8,
    height: 64,
  },
  thumbnailButton: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeThumbnail: {
    borderColor: "#3B82F6",
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: 6,
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
  },
  roadCondition: {
    fontSize: 15,
    color: "#334155",
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
  actionButtons: {
    marginTop: 16,
    marginBottom: 40, // Add more bottom margin to ensure buttons are visible
  },
  viewButton: {
    marginBottom: 16,
    backgroundColor: "#3B82F6",
    borderRadius: 16,
  },
  secondaryButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  directionButton: {
    flex: 1,
    borderRadius: 16,
    borderColor: "#3B82F6",
  },
  shareButton: {
    flex: 1,
    borderRadius: 16,
    borderColor: "#3B82F6",
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
