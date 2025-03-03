// components/reports/ReportItem.tsx
import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { formatDistanceToNow } from "date-fns";
import {
  PotholeReport,
  ReportStatus,
  SeverityLevel,
} from "../../../../lib/supabase";
import { deleteReport } from "../../../services/report-service";

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
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{
        type: "timing",
        duration: 300,
        delay: index * 50,
      }}
    >
      <TouchableOpacity
        style={styles.reportItem}
        onPress={onPress}
        activeOpacity={0.7}
      >
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
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
};

// Sub-components
const StatusChip: React.FC<{ status: ReportStatus }> = ({ status }) => (
  <Chip
    style={[
      styles.statusChip,
      {
        backgroundColor: STATUS_COLORS[status] || "#6B7280",
      },
    ]}
    textStyle={styles.chipText}
    icon={() => (
      <MaterialCommunityIcons
        name={STATUS_ICONS[status]}
        size={16}
        color="#FFFFFF"
      />
    )}
  >
    {status}
  </Chip>
);

const SeverityChip: React.FC<{ severity: SeverityLevel }> = ({ severity }) => (
  <Chip
    style={[
      styles.severityChip,
      {
        backgroundColor: SEVERITY_COLORS[severity] || "#6B7280",
      },
    ]}
    textStyle={styles.chipText}
  >
    {severity}
  </Chip>
);

const ReportImage: React.FC<{ images?: string[] }> = ({ images }) => {
  if (images && images.length > 0) {
    return (
      <Image
        source={{ uri: images[0] }}
        style={styles.reportImage}
        defaultSource={require("../../../assets/placeholder-image.svg")}
      />
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
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
    height: 28,
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginVertical: 0,
  },
  reportContent: {
    flexDirection: "row",
    gap: 12,
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
    height: 24,
  },
});

export default ReportItem;
