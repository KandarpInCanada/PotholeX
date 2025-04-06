// components/reports/ReportItem.tsx
import type React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { Badge } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import {
  type PotholeReport,
  ReportStatus,
  SeverityLevel,
} from "../../../../lib/supabase";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface ReportItemProps {
  report: PotholeReport;
  index: number;
  onPress: () => void;
  onReportsChange: (reports: PotholeReport[]) => void;
  reports: PotholeReport[];
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

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const STATUS_ICONS: Record<ReportStatus, IconName> = {
  [ReportStatus.SUBMITTED]: "check-circle-outline",
  [ReportStatus.IN_PROGRESS]: "progress-clock",
  [ReportStatus.FIXED]: "check-circle",
  [ReportStatus.REJECTED]: "close-circle",
};

const ReportItem: React.FC<ReportItemProps> = ({
  report,
  index,
  onPress,
  onReportsChange,
  reports,
}) => {
  // Animation values
  const scale = useSharedValue(1);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 10 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10 });
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={[styles.reportItem, animatedStyle]}>
        <View style={styles.reportHeader}>
          <View style={styles.reportInfo}>
            <Text style={styles.reportCategory}>{report.category}</Text>
            <Text style={styles.reportDate}>
              {formatDate(report.created_at)}
            </Text>
          </View>
          <StatusChip status={report.status as ReportStatus} />
        </View>

        <View style={styles.reportContent}>
          <ReportImage images={report.images} />

          <View style={styles.reportDetails}>
            <LocationInfo location={report.location} />
            <Text style={styles.description} numberOfLines={2}>
              {report.description}
            </Text>

            <View style={styles.reportFooter}>
              <SeverityChip severity={report.severity as SeverityLevel} />

              <View style={styles.reportStats}>
                {report.likes && report.likes > 0 && (
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons
                      name="thumb-up"
                      size={14}
                      color="#64748B"
                    />
                    <Text style={styles.statText}>{report.likes}</Text>
                  </View>
                )}
                {report.comments && report.comments > 0 && (
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons
                      name="comment"
                      size={14}
                      color="#64748B"
                    />
                    <Text style={styles.statText}>{report.comments}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// Sub-components
const StatusChip: React.FC<{ status: ReportStatus }> = ({ status }) => (
  <View
    style={[
      styles.statusChip,
      {
        backgroundColor: STATUS_COLORS[status] || "#6B7280",
      },
    ]}
  >
    <MaterialCommunityIcons
      name={STATUS_ICONS[status]}
      size={16}
      color="#FFFFFF"
      style={{ marginRight: 4 }}
    />
    <Text style={styles.chipText}>{status.toString().replace("_", " ")}</Text>
  </View>
);

// Replace the SeverityChip component with this implementation
const SeverityChip: React.FC<{ severity: SeverityLevel }> = ({ severity }) => (
  <View
    style={[
      styles.severityChip,
      {
        backgroundColor: SEVERITY_COLORS[severity] || "#6B7280",
      },
    ]}
  >
    <Text style={styles.chipText}>{severity}</Text>
  </View>
);

const ReportImage: React.FC<{ images?: string[] }> = ({ images }) => {
  if (images && images.length > 0) {
    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: images[0] }}
          style={styles.reportImage}
          defaultSource={require("../../../assets/placeholder-image.svg")}
        />
        {images.length > 1 && (
          <Badge style={styles.imageBadge} size={20}>
            {`+${images.length - 1}`}
          </Badge>
        )}
      </View>
    );
  }

  return (
    <View style={styles.noImageContainer}>
      <MaterialCommunityIcons name="image-off" size={24} color="#94A3B8" />
    </View>
  );
};

const LocationInfo: React.FC<{ location: string }> = ({ location }) => (
  <View style={styles.locationContainer}>
    <MaterialCommunityIcons name="map-marker" size={14} color="#0284c7" />
    <Text style={styles.location} numberOfLines={1}>
      {location}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  reportItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportCategory: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  reportDate: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  statusChip: {
    height: 36,
    borderRadius: 4,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
    elevation: 0, // Remove any elevation that might affect alignment
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    padding: 0,
    margin: 0,
    lineHeight: 14, // Match the font size
    height: 14, // Set explicit height
    alignSelf: "center", // Ensure self-alignment
  },
  reportContent: {
    flexDirection: "row",
    gap: 12,
  },
  imageContainer: {
    position: "relative",
  },
  reportImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  imageBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#0284c7",
    color: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  } as const,
  noImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  reportDetails: {
    flex: 1,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: "#0284c7",
    marginLeft: 4,
    fontWeight: "500",
    flex: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#334155",
    marginBottom: 8,
  },
  reportFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  severityChip: {
    height: 36,
    borderRadius: 4,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
    elevation: 0, // Remove any elevation that might affect alignment
  },
  reportStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
});

export default ReportItem;
