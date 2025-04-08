// components/reports/ReportItem.tsx
import type React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
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
import { memo } from "react";

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

// Update the ReportItem component to place severity and status badges side by side
const ReportItem: React.FC<ReportItemProps> = ({
  report,
  index,
  onPress,
  onReportsChange,
  reports,
}) => {
  // Animation values
  const scale = useSharedValue(1);

  // Animated styles with optimized configuration
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
    scale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={[styles.reportItem, animatedStyle]}>
        {/* Header with title and date */}
        <View style={styles.reportHeader}>
          <View style={styles.titleDateContainer}>
            <Text style={styles.reportCategory}>{report.category}</Text>
            <Text style={styles.reportDate}>
              {formatDate(report.created_at)}
            </Text>
          </View>
          {/* Status badge moved to the badges container below */}
        </View>

        <View style={styles.reportContent}>
          {/* Image thumbnail */}
          <ReportImage images={report.images} />

          <View style={styles.reportDetails}>
            {/* Location with pin icon */}
            <LocationInfo location={report.location} />

            {/* Description */}
            <Text style={styles.description} numberOfLines={2}>
              {report.description}
            </Text>

            {/* Badges container - both badges side by side */}
            <View style={styles.badgesContainer}>
              <SeverityBadge severity={report.severity as SeverityLevel} />
              <StatusBadge status={report.status as ReportStatus} />
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// Update the StatusBadge component to be smaller
const StatusBadge: React.FC<{ status: ReportStatus }> = ({ status }) => {
  // Convert the status to a properly formatted string
  const statusText = status.toString().replace("_", " ");

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor:
            status === ReportStatus.FIXED
              ? "#4ADE80"
              : STATUS_COLORS[status] || "#6B7280",
        },
      ]}
    >
      {status === ReportStatus.FIXED && (
        <MaterialCommunityIcons
          name="check"
          size={14}
          color="#FFFFFF"
          style={{ marginRight: 2 }}
        />
      )}
      <Text style={styles.badgeText}>
        {status === ReportStatus.FIXED ? "fixed" : statusText}
      </Text>
    </View>
  );
};

// Update the SeverityBadge component to be smaller
const SeverityBadge: React.FC<{ severity: SeverityLevel }> = ({ severity }) => {
  // Make sure severity is a string
  const severityText = String(severity);

  return (
    <View
      style={[
        styles.severityBadge,
        {
          backgroundColor:
            severity === SeverityLevel.LOW
              ? "#4ADE80"
              : SEVERITY_COLORS[severity] || "#6B7280",
        },
      ]}
    >
      <Text style={styles.badgeText}>{severityText}</Text>
    </View>
  );
};

// Update LocationInfo with blue pin icon and text
const LocationInfo: React.FC<{ location: string }> = ({ location }) => (
  <View style={styles.locationContainer}>
    <MaterialCommunityIcons name="map-marker" size={18} color="#3B82F6" />
    <Text style={styles.location} numberOfLines={1}>
      {location}
    </Text>
  </View>
);

// Update the ReportImage component for a cleaner look
const ReportImage: React.FC<{ images?: string[] }> = ({ images }) => {
  if (images && images.length > 0) {
    return (
      <View style={styles.imageContainer}>
        <Image source={{ uri: images[0] }} style={styles.reportImage} />
      </View>
    );
  }

  return (
    <View style={styles.noImageContainer}>
      <MaterialCommunityIcons name="image-off" size={24} color="#94A3B8" />
    </View>
  );
};

// Update the styles for the badges
const styles = StyleSheet.create({
  reportItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleDateContainer: {
    flex: 1,
  },
  reportCategory: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 14,
    color: "#64748B",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#4ADE80",
  },
  severityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#4ADE80",
    marginRight: 8,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  badgesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportContent: {
    flexDirection: "row",
    gap: 16,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: "hidden",
  },
  reportImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  noImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
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
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: "#3B82F6",
    marginLeft: 4,
    fontWeight: "500",
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: "#334155",
    marginBottom: 12,
  },
});

export default memo(ReportItem, (prevProps, nextProps) => {
  // Only re-render if the report ID changes
  return prevProps.report.id === nextProps.report.id;
});
