"use client";

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Chip,
  Searchbar,
  Button,
  Divider,
  IconButton,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { getUserReports, deleteReport } from "../services/report-service";
import { PotholeReport, ReportStatus, SeverityLevel } from "../../lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { MotiView } from "moti";

const { width } = Dimensions.get("window");

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

export default function ReportListScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<PotholeReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<PotholeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ReportStatus | "all">("all");

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserReports();
      setReports(data);
      setFilteredReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterReports(query, activeFilter);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  const handleFilter = (filter: ReportStatus | "all") => {
    setActiveFilter(filter);
    filterReports(searchQuery, filter);
  };

  const filterReports = (query: string, filter: ReportStatus | "all") => {
    let filtered = reports;

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter((report) => report.status === filter);
    }

    // Apply search filter
    if (query.trim() !== "") {
      filtered = filtered.filter(
        (report) =>
          report.location.toLowerCase().includes(query.toLowerCase()) ||
          report.description.toLowerCase().includes(query.toLowerCase()) ||
          report.category.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  };

  const handleDeleteReport = async (reportId: string) => {
    const success = await deleteReport(reportId);
    if (success) {
      // Update local state
      const updatedReports = reports.filter((report) => report.id !== reportId);
      setReports(updatedReports);
      setFilteredReports(updatedReports);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  const renderReportItem = ({
    item,
    index,
  }: {
    item: PotholeReport;
    index: number;
  }) => (
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
        onPress={() => router.push(`/dashboard/report-details/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.reportHeader}>
          <View style={styles.reportInfo}>
            <Text style={styles.reportCategory}>{item.category}</Text>
            <Text style={styles.reportDate}>{formatDate(item.created_at)}</Text>
          </View>
          <Chip
            style={[
              styles.statusChip,
              {
                backgroundColor:
                  STATUS_COLORS[item.status as ReportStatus] || "#6B7280",
              },
            ]}
            textStyle={styles.chipText}
            icon={() => (
              <MaterialCommunityIcons
                name={STATUS_ICONS[item.status as ReportStatus]}
                size={16}
                color="#FFFFFF"
              />
            )}
          >
            {item.status}
          </Chip>
        </View>

        <View style={styles.reportContent}>
          {item.images && item.images.length > 0 ? (
            <Image
              source={{ uri: item.images[0] }}
              style={styles.reportImage}
              defaultSource={require("../assets/placeholder-image.svg")}
            />
          ) : (
            <View style={styles.noImageContainer}>
              <MaterialCommunityIcons
                name="image-off"
                size={24}
                color="#94A3B8"
              />
            </View>
          )}

          <View style={styles.reportDetails}>
            <View style={styles.locationContainer}>
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color="#0284c7"
              />
              <Text style={styles.location} numberOfLines={1}>
                {item.location}
              </Text>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.reportFooter}>
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
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );

  const renderFilterButton = (filter: ReportStatus | "all", label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === filter && styles.activeFilterButton,
      ]}
      onPress={() => handleFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === filter && styles.activeFilterButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>My Reports</Text>
          <IconButton
            icon="plus"
            size={24}
            iconColor="#0284c7"
            onPress={() => router.push("/(dashboard)/AddReport")}
          />
        </View>

        <Searchbar
          placeholder="Search reports..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor="#64748B"
          placeholderTextColor="#94A3B8"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {renderFilterButton("all", "All")}
          {renderFilterButton(ReportStatus.SUBMITTED, "Submitted")}
          {renderFilterButton(ReportStatus.IN_PROGRESS, "In Progress")}
          {renderFilterButton(ReportStatus.FIXED, "Fixed")}
          {renderFilterButton(ReportStatus.REJECTED, "Rejected")}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.loadingText}>Loading your reports...</Text>
        </View>
      ) : filteredReports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="clipboard-text-outline"
            size={64}
            color="#94A3B8"
          />
          <Text style={styles.emptyText}>No reports found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery || activeFilter !== "all"
              ? "Try changing your filters"
              : "You haven't reported any potholes yet"}
          </Text>
          <Button
            mode="contained"
            style={styles.createButton}
            contentStyle={styles.createButtonContent}
            onPress={() => router.push("/dashboard/add-report")}
          >
            Create New Report
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={renderReportItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <Divider style={styles.divider} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#0284c7"]}
              tintColor="#0284c7"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 0,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    height: 46,
  },
  searchInput: {
    fontSize: 15,
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  activeFilterButton: {
    backgroundColor: "#0284c7",
    borderColor: "#0284c7",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
  },
  activeFilterButtonText: {
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: "#0284c7",
  },
  createButtonContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  listContainer: {
    padding: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 8,
  },
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
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButtonText: {
    fontSize: 12,
    color: "#0284c7",
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 12,
    color: "#DC2626",
    marginLeft: 4,
  },
});
