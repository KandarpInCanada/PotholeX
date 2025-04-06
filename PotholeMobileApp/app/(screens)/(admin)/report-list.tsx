"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Searchbar,
  Menu,
  Button,
  Dialog,
  Portal,
  ActivityIndicator,
  Divider,
  Card,
} from "react-native-paper";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useRouter } from "expo-router";
import {
  supabase,
  createAdminClient,
  ReportStatus,
  SeverityLevel,
  type PotholeReport,
} from "../../../lib/supabase";
import { useAuth } from "../../../context/auth-context";
import { EXPO_PUBLIC_SUPABASE_SECRET_KEY } from "@env";
import { LinearGradient } from "expo-linear-gradient";

export default function AdminReportList() {
  const router = useRouter();
  const { user, isAdmin } = useAuth(); // Add useAuth hook
  const [reports, setReports] = useState<PotholeReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<PotholeReport[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filter and sort states
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");

  // Menu visibility states
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showSeverityMenu, setShowSeverityMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Report action states
  const [selectedReport, setSelectedReport] = useState<PotholeReport | null>(
    null
  );
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedStatus, setEditedStatus] = useState<ReportStatus>(
    ReportStatus.SUBMITTED
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, searchQuery, statusFilter, severityFilter, sortBy]);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.from("pothole_reports").select(`
        *,
        profiles:user_id (
          username,
          avatar_url,
          full_name
        )
      `);

      if (error) throw error;

      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      Alert.alert("Error", "Failed to load reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...reports];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          (report.location && report.location.toLowerCase().includes(query)) ||
          (report.description &&
            report.description.toLowerCase().includes(query)) ||
          (report.category && report.category.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }

    // Apply severity filter
    if (severityFilter) {
      filtered = filtered.filter(
        (report) => report.severity === severityFilter
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at || "").getTime() -
            new Date(b.created_at || "").getTime()
          );
        case "severity_high":
          return getSeverityValue(b.severity) - getSeverityValue(a.severity);
        case "severity_low":
          return getSeverityValue(a.severity) - getSeverityValue(b.severity);
        default:
          return 0;
      }
    });

    setFilteredReports(filtered);
  }, [reports, searchQuery, statusFilter, severityFilter, sortBy]);

  const getSeverityValue = (severity?: string) => {
    switch (severity) {
      case SeverityLevel.DANGER:
        return 3;
      case SeverityLevel.MEDIUM:
        return 2;
      case SeverityLevel.LOW:
        return 1;
      default:
        return 0;
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearFilters = () => {
    setStatusFilter(null);
    setSeverityFilter(null);
    setSortBy("newest");
  };

  const handleEditReport = (report: PotholeReport) => {
    setSelectedReport(report);
    setEditedStatus(report.status as ReportStatus);
    setShowEditDialog(true);
  };

  const handleDeleteReport = (report: PotholeReport) => {
    setSelectedReport(report);
    setShowDeleteDialog(true);
  };

  const saveReportChanges = async () => {
    if (!selectedReport || !selectedReport.id) {
      console.error("No report selected or report ID is missing");
      Alert.alert("Error", "Cannot update report: No valid report selected");
      return;
    }

    if (!isAdmin) {
      Alert.alert(
        "Permission Error",
        "Only administrators can update report status"
      );
      return;
    }

    try {
      // Get the exact string value from the enum
      const statusValue = editedStatus.toString();
      console.log(
        `Updating report ${selectedReport.id} with status: ${statusValue}`
      );
      const adminClient = createAdminClient(EXPO_PUBLIC_SUPABASE_SECRET_KEY);
      const { data, error } = await adminClient
        .from("pothole_reports")
        .update({
          status: statusValue,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedReport.id)
        .select();
      if (error) {
        console.error("Update error:", error);
        Alert.alert(
          "Permission Error",
          "You may not have permission to update this report. Please check your database permissions.",
          [{ text: "OK", onPress: () => setShowEditDialog(false) }]
        );
        return;
      }

      console.log("Update response:", data);

      // Update local state
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === selectedReport.id
            ? { ...report, status: editedStatus }
            : report
        )
      );

      setShowEditDialog(false);
      Alert.alert("Success", "Report status updated successfully");

      // Refresh the reports list to ensure we have the latest data
      fetchReports();
    } catch (error: any) {
      console.error("Unexpected error updating report:", error);
      Alert.alert(
        "Error",
        `An unexpected error occurred: ${error.message || "Unknown error"}`,
        [{ text: "OK", onPress: () => setShowEditDialog(false) }]
      );
    }
  };

  const confirmDeleteReport = async () => {
    if (!selectedReport) return;

    try {
      const { error } = await supabase
        .from("pothole_reports")
        .delete()
        .eq("id", selectedReport.id);

      if (error) throw error;

      // Update local state
      setReports((prevReports) =>
        prevReports.filter((report) => report.id !== selectedReport.id)
      );

      setShowDeleteDialog(false);
      Alert.alert("Success", "Report deleted successfully");
    } catch (error) {
      console.error("Error deleting report:", error);
      Alert.alert("Error", "Failed to delete report");
    }
  };

  // Replace the StatusChip component with this implementation
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
        name={STATUS_ICONS[status] as any}
        size={16}
        color="#FFFFFF"
        style={{ marginRight: 4 }}
      />
      <Text style={styles.chipText}>{status.toString().replace("_", " ")}</Text>
    </View>
  );

  const renderReportItem = ({ item }: { item: PotholeReport }) => (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300 }}
    >
      <Card style={styles.reportCard} mode="elevated">
        <View style={{ overflow: "hidden", borderRadius: 12 }}>
          <Card.Content style={styles.reportContent}>
            <View style={styles.reportHeader}>
              <View style={styles.reportInfo}>
                <Text style={styles.reportCategory}>
                  {item.category || "Pothole"}
                </Text>
                <Text style={styles.reportDate}>
                  {new Date(item.created_at || "").toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.reportActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditReport(item)}
                >
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color="#3B82F6"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteReport(item)}
                >
                  <MaterialCommunityIcons
                    name="delete"
                    size={20}
                    color="#EF4444"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.locationContainer}>
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color="#3B82F6"
              />
              <Text style={styles.location} numberOfLines={1}>
                {item.location || "Unknown location"}
              </Text>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {item.description || "No description provided"}
            </Text>

            <View style={styles.tagsContainer}>
              <View
                style={[
                  styles.severityChip,
                  { backgroundColor: getSeverityColor(item.severity) },
                ]}
              >
                <Text style={styles.chipText}>
                  {item.severity || "Unknown"}
                </Text>
              </View>
              <View
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                <Text style={styles.chipText}>{formatStatus(item.status)}</Text>
              </View>
            </View>

            {item.admin_notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Admin Notes:</Text>
                <Text style={styles.notesText}>{item.admin_notes}</Text>
              </View>
            )}

            <Divider style={styles.reportDivider} />

            <View style={styles.reportFooter}>
              <View style={styles.userInfo}>
                <Text style={styles.reportedBy}>Reported by: </Text>
                <Text style={styles.username}>
                  {item.profiles?.username || "Anonymous"}
                </Text>
              </View>
              <Text style={styles.reportId}>
                ID: {item.id?.substring(0, 8)}
              </Text>
            </View>
          </Card.Content>
        </View>
      </Card>
    </MotiView>
  );

  const renderEditDialog = () => (
    <Portal>
      <Dialog
        visible={showEditDialog}
        onDismiss={() => setShowEditDialog(false)}
        style={styles.dialog}
      >
        <Dialog.Title style={styles.dialogTitle}>
          Update Report Status
        </Dialog.Title>
        <Dialog.Content>
          <Text style={styles.dialogLabel}>Status:</Text>
          <View style={styles.statusOptions}>
            {Object.values(ReportStatus).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  editedStatus === status && styles.selectedStatusOption,
                  { borderColor: getStatusColor(status) },
                  editedStatus === status && {
                    backgroundColor: `${getStatusColor(status)}20`,
                  },
                ]}
                onPress={() => setEditedStatus(status)}
              >
                <MaterialCommunityIcons
                  name={getStatusIcon(status)}
                  size={18}
                  color={getStatusColor(status)}
                  style={styles.statusOptionIcon}
                />
                <Text
                  style={[
                    styles.statusOptionText,
                    editedStatus === status && {
                      color: getStatusColor(status),
                      fontWeight: "600",
                    },
                  ]}
                >
                  {formatStatus(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowEditDialog(false)} textColor="#64748B">
            Cancel
          </Button>
          <Button onPress={saveReportChanges} textColor="#3B82F6">
            Save Changes
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        {/* Blue Header Banner */}
        <LinearGradient
          colors={["#3B82F6", "#2563EB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerBanner}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Manage Reports</Text>
              <Text style={styles.headerSubtitle}>
                View, edit and manage all pothole reports
              </Text>
            </View>
          </View>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search reports..."
              onChangeText={handleSearch}
              value={searchQuery}
              style={styles.searchBar}
              iconColor="#3B82F6"
              inputStyle={styles.searchInput}
            />
          </View>
        </LinearGradient>
        {/* Filter Buttons */}
        <View style={styles.filterButtonsContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowStatusMenu(true)}
          >
            <MaterialCommunityIcons
              name="filter-variant"
              size={20}
              color="#3B82F6"
            />
            <Text style={styles.filterButtonText}>Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowSeverityMenu(true)}
          >
            <Ionicons name="alert-circle-outline" size={20} color="#3B82F6" />
            <Text style={styles.filterButtonText}>Severity</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowSortMenu(true)}
          >
            <MaterialCommunityIcons name="sort" size={20} color="#3B82F6" />
            <Text style={styles.filterButtonText}>Sort</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reports List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item.id || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3B82F6"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="clipboard-text-off"
                size={64}
                color="#94A3B8"
              />
              <Text style={styles.emptyText}>No reports found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery || statusFilter || severityFilter
                  ? "Try changing your filters"
                  : "There are no reports in the system yet"}
              </Text>
            </View>
          }
        />
      )}

      {/* Status Filter Menu */}
      <Portal>
        <Menu
          visible={showStatusMenu}
          onDismiss={() => setShowStatusMenu(false)}
          anchor={{ x: 0, y: 0 }}
          style={[styles.menuContent, { top: 240, left: 80 }]}
        >
          <Menu.Item
            onPress={() => {
              setStatusFilter(null);
              setShowStatusMenu(false);
            }}
            title="All"
            leadingIcon="filter-variant-remove"
          />
          <Menu.Item
            onPress={() => {
              setStatusFilter(ReportStatus.SUBMITTED);
              setShowStatusMenu(false);
            }}
            title="Submitted"
            leadingIcon="clipboard-outline"
          />
          <Menu.Item
            onPress={() => {
              setStatusFilter(ReportStatus.IN_PROGRESS);
              setShowStatusMenu(false);
            }}
            title="In Progress"
            leadingIcon="progress-clock"
          />
          <Menu.Item
            onPress={() => {
              setStatusFilter(ReportStatus.FIXED);
              setShowStatusMenu(false);
            }}
            title="Fixed"
            leadingIcon="check-circle"
          />
          <Menu.Item
            onPress={() => {
              setStatusFilter(ReportStatus.REJECTED);
              setShowStatusMenu(false);
            }}
            title="Rejected"
            leadingIcon="close-circle"
          />
        </Menu>
      </Portal>

      {/* Severity Filter Menu */}
      <Portal>
        <Menu
          visible={showSeverityMenu}
          onDismiss={() => setShowSeverityMenu(false)}
          anchor={{ x: 0, y: 0 }}
          style={[styles.menuContent, { top: 240, left: 240 }]}
        >
          <Menu.Item
            onPress={() => {
              setSeverityFilter(null);
              setShowSeverityMenu(false);
            }}
            title="All"
            leadingIcon="filter-variant-remove"
          />
          <Menu.Item
            onPress={() => {
              setSeverityFilter(SeverityLevel.LOW);
              setShowSeverityMenu(false);
            }}
            title="Low"
            leadingIcon="alert-outline"
          />
          <Menu.Item
            onPress={() => {
              setSeverityFilter(SeverityLevel.MEDIUM);
              setShowSeverityMenu(false);
            }}
            title="Medium"
            leadingIcon="alert"
          />
          <Menu.Item
            onPress={() => {
              setSeverityFilter(SeverityLevel.DANGER);
              setShowSeverityMenu(false);
            }}
            title="Danger"
            leadingIcon="alert-octagon"
          />
        </Menu>
      </Portal>

      {/* Sort Menu */}
      <Portal>
        <Menu
          visible={showSortMenu}
          onDismiss={() => setShowSortMenu(false)}
          anchor={{ x: 0, y: 0 }}
          style={[styles.menuContent, { top: 240, left: 400 }]}
        >
          <Menu.Item
            onPress={() => {
              setSortBy("newest");
              setShowSortMenu(false);
            }}
            title="Newest First"
            leadingIcon="sort-calendar-descending"
          />
          <Menu.Item
            onPress={() => {
              setSortBy("oldest");
              setShowSortMenu(false);
            }}
            title="Oldest First"
            leadingIcon="sort-calendar-ascending"
          />
          <Menu.Item
            onPress={() => {
              setSortBy("severity_high");
              setShowSortMenu(false);
            }}
            title="Highest Severity"
            leadingIcon="sort-variant"
          />
          <Menu.Item
            onPress={() => {
              setSortBy("severity_low");
              setShowSortMenu(false);
            }}
            title="Lowest Severity"
            leadingIcon="sort-variant"
          />
        </Menu>
      </Portal>

      {/* Edit Report Dialog */}
      {renderEditDialog()}

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Delete Report</Dialog.Title>
          <Dialog.Content>
            <View style={styles.deleteDialogContent}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={32}
                color="#EF4444"
                style={styles.deleteIcon}
              />
              <Text style={styles.deleteText}>
                Are you sure you want to delete this report? This action cannot
                be undone.
              </Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowDeleteDialog(false)}
              textColor="#64748B"
            >
              Cancel
            </Button>
            <Button onPress={confirmDeleteReport} textColor="#EF4444">
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

// Helper functions
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case ReportStatus.SUBMITTED:
      return "clipboard-check-outline";
    case ReportStatus.IN_PROGRESS:
      return "progress-clock";
    case ReportStatus.FIXED:
      return "check-circle";
    case ReportStatus.REJECTED:
      return "close-circle";
    default:
      return "help-circle";
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

const STATUS_COLORS: { [key in ReportStatus]: string } = {
  [ReportStatus.SUBMITTED]: "#64748B",
  [ReportStatus.IN_PROGRESS]: "#3B82F6",
  [ReportStatus.FIXED]: "#10B981",
  [ReportStatus.REJECTED]: "#EF4444",
};

const STATUS_ICONS: Record<ReportStatus, string> = {
  [ReportStatus.SUBMITTED]: "clipboard-check-outline",
  [ReportStatus.IN_PROGRESS]: "progress-clock",
  [ReportStatus.FIXED]: "check-circle",
  [ReportStatus.REJECTED]: "close-circle",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4FF", // Updated to light blue background
  },
  content: {
    flex: 0,
  },
  headerBanner: {
    backgroundColor: "#3B82F6",
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    margin: 16,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  avatarHeader: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  searchContainer: {
    marginTop: 20,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    height: 48,
  },
  searchInput: {
    fontSize: 15,
  },
  filterButtonsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: "space-between",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 4, // Changed to square
    backgroundColor: "white",
    flex: 1,
    marginHorizontal: 4,
  },
  filterButtonText: {
    color: "#3B82F6",
    fontWeight: "500",
    marginLeft: 6,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Increase this value to ensure content isn't hidden behind the tab bar
    paddingTop: 0,
  },
  reportCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    elevation: 2,
  },
  reportContent: {
    padding: 16,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportCategory: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  reportDate: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  reportActions: {
    flexDirection: "row",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: "#3B82F6",
    marginLeft: 6,
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 12,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  severityChip: {
    height: 36,
    borderRadius: 4,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
    elevation: 0,
  },
  statusChip: {
    height: 36,
    borderRadius: 4,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
    elevation: 0,
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    padding: 0,
    margin: 0,
  },
  notesContainer: {
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
  reportDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  reportFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportedBy: {
    fontSize: 12,
    color: "#64748B",
  },
  username: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  reportId: {
    fontSize: 12,
    color: "#94A3B8",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
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
  },
  dialog: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  dialogLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 8,
  },
  statusOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4, // Changed to square
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flex: 1,
    minWidth: "48%",
  },
  selectedStatusOption: {
    backgroundColor: "#F8FAFC",
  },
  statusOptionIcon: {
    marginRight: 8,
  },
  statusOptionText: {
    fontSize: 14,
    color: "#64748B",
  },
  notesInput: {
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
  },
  deleteDialogContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteIcon: {
    marginRight: 12,
  },
  deleteText: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
  menuContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    minWidth: 200,
  },
});
