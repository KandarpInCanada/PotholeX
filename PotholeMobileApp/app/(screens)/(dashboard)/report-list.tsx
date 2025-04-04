"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView, // Added ScrollView import
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { getUserReports } from "../../services/report-service";
import { type PotholeReport, ReportStatus } from "../../../lib/supabase";
import { MotiView } from "moti";
import { FAB, Menu, Divider, Searchbar } from "react-native-paper";
import { Swipeable } from "react-native-gesture-handler";
import ReportItem from "../../components/dashboard-components/report-list/report-item";
import EmptyState from "../../components/dashboard-components/report-list/empty-state";

const { width } = Dimensions.get("window");

// Sort options
const SORT_OPTIONS = [
  { id: "newest", label: "Newest First", icon: "sort-calendar-descending" },
  { id: "oldest", label: "Oldest First", icon: "sort-calendar-ascending" },
  { id: "severity", label: "Severity", icon: "sort-variant" },
  { id: "status", label: "Status", icon: "sort-alphabetical-ascending" },
];

export default function ReportListScreen() {
  // Router for navigation
  const router = useRouter();

  // State management for reports and UI
  const [reports, setReports] = useState<PotholeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeSort, setActiveSort] = useState("newest");

  // Search and filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ReportStatus | "all">("all");
  const [showFilterBar, setShowFilterBar] = useState(true);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const filterBarHeight = useRef(new Animated.Value(1)).current;

  // Refs
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  // Memoized callback to fetch user reports
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      // Retrieve reports from service
      const data = await getUserReports();
      setReports(data);
    } catch (error) {
      // Log any errors during report fetching
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch reports on initial component mount
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Refetch reports when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchReports();
      // Close any open swipeable items
      swipeableRefs.current.forEach((ref) => {
        ref?.close();
      });
    }, [fetchReports])
  );

  // Toggle filter bar visibility
  const toggleFilterBar = () => {
    Animated.timing(filterBarHeight, {
      toValue: showFilterBar ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setShowFilterBar(!showFilterBar);
  };

  // Handler for search input
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle pull-to-refresh functionality
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  // Handle status filter changes
  const handleFilter = (filter: ReportStatus | "all") => {
    setActiveFilter(filter);
  };

  // Handle sort option selection
  const handleSort = (sortOption: string) => {
    setActiveSort(sortOption);
    setShowMenu(false);
  };

  // Navigate to add report screen
  const navigateToAddReport = () => {
    router.push("(screens)/(dashboard)/add-report");
  };

  // Navigate to report details
  const navigateToReportDetails = (reportId: string) => {
    router.push(`/dashboard/report-details/${reportId}`);
  };

  // Handle swipe actions
  const handleSwipeAction = (
    action: "view" | "share" | "delete",
    reportId: string
  ) => {
    if (action === "view" && reportId) {
      navigateToReportDetails(reportId);
    } else if (action === "share") {
      // Share functionality would go here
      console.log("Share report:", reportId);
    } else if (action === "delete") {
      // Delete confirmation would go here
      console.log("Delete report:", reportId);
    }
  };

  // Memoized filtered and sorted reports for performance optimization
  const processedReports = useMemo(() => {
    let filtered = reports;

    // Apply status filter
    if (activeFilter !== "all") {
      filtered = filtered.filter((report) => report.status === activeFilter);
    }

    // Apply search filter across location, description, and category
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.location?.toLowerCase().includes(query) ||
          report.description?.toLowerCase().includes(query) ||
          report.category?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (activeSort) {
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
        case "severity":
          const severityOrder = { Danger: 0, Medium: 1, Low: 2 };
          return (
            (severityOrder[a.severity as keyof typeof severityOrder] || 999) -
            (severityOrder[b.severity as keyof typeof severityOrder] || 999)
          );
        case "status":
          const statusOrder = {
            submitted: 0,
            in_progress: 1,
            fixed: 2,
            rejected: 3,
          };
          return (
            (statusOrder[a.status as keyof typeof statusOrder] || 999) -
            (statusOrder[b.status as keyof typeof statusOrder] || 999)
          );
        default:
          return 0;
      }
    });
  }, [reports, activeFilter, searchQuery, activeSort]);

  // Memoized calculation of status counts
  const statusCounts = useMemo(() => {
    const counts: Record<ReportStatus | "all", number> = {
      all: reports.length,
      [ReportStatus.SUBMITTED]: 0,
      [ReportStatus.IN_PROGRESS]: 0,
      [ReportStatus.FIXED]: 0,
      [ReportStatus.REJECTED]: 0,
    };

    // Count reports for each status
    reports.forEach((report) => {
      if (report.status && counts[report.status] !== undefined) {
        counts[report.status]++;
      }
    });

    return counts;
  }, [reports]);

  // Animation styles for header
  const headerAnimatedStyle = {
    opacity: scrollY.interpolate({
      inputRange: [0, 50, 100],
      outputRange: [1, 0.8, 0.6],
      extrapolate: "clamp",
    }),
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, 100],
          outputRange: [0, -10],
          extrapolate: "clamp",
        }),
      },
    ],
  };

  // Animation styles for filter bar
  const filterBarAnimatedStyle = {
    height: filterBarHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 60],
    }),
    opacity: filterBarHeight,
    overflow: "hidden" as const, // Add type assertion
  };

  // Render swipeable actions for report items
  const renderRightActions = (reportId: string) => {
    return (
      <View style={styles.swipeActionsContainer}>
        <TouchableOpacity
          style={[styles.swipeAction, styles.viewAction]}
          onPress={() => handleSwipeAction("view", reportId)}
        >
          <MaterialCommunityIcons name="eye" size={22} color="#FFFFFF" />
          <Text style={styles.swipeActionText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeAction, styles.shareAction]}
          onPress={() => handleSwipeAction("share", reportId)}
        >
          <MaterialCommunityIcons name="share" size={22} color="#FFFFFF" />
          <Text style={styles.swipeActionText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeAction, styles.deleteAction]}
          onPress={() => handleSwipeAction("delete", reportId)}
        >
          <MaterialCommunityIcons name="delete" size={22} color="#FFFFFF" />
          <Text style={styles.swipeActionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render different content based on loading and reports state
  const renderContent = () => {
    // Show loading state
    if (loading && !refreshing) {
      return (
        <EmptyState
          icon={<ActivityIndicator size="large" color="#0284c7" />}
          title="Loading your reports..."
          subtitle=""
          buttonLabel=""
          onButtonPress={() => {}}
        />
      );
    }

    // Show empty state when no reports match filter/search
    if (processedReports.length === 0) {
      return (
        <EmptyState
          icon={
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={64}
              color="#94A3B8"
            />
          }
          title="No reports found"
          subtitle={
            searchQuery || activeFilter !== "all"
              ? "Try changing your filters"
              : "You haven't reported any potholes yet"
          }
          buttonLabel="Create New Report"
          onButtonPress={navigateToAddReport}
        />
      );
    }

    // Render list of reports
    return (
      <Animated.FlatList
        data={processedReports}
        // Ensure unique key for each item
        keyExtractor={(item) => item.id || Math.random().toString()}
        // Render individual report item
        renderItem={({ item, index }) => (
          <Swipeable
            ref={(ref) => {
              if (ref && item.id) {
                swipeableRefs.current.set(item.id, ref);
              }
            }}
            renderRightActions={() => renderRightActions(item.id || "")}
            onSwipeableOpen={() => {
              // Close other open swipeables
              swipeableRefs.current.forEach((swipeable, id) => {
                if (id !== item.id) {
                  swipeable?.close();
                }
              });
            }}
          >
            <MotiView
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{
                type: "timing",
                duration: 300,
                delay: index * 50,
              }}
            >
              <ReportItem
                report={item}
                index={index}
                onPress={() => navigateToReportDetails(item.id || "")}
                onReportsChange={setReports}
                reports={reports}
              />
            </MotiView>
          </Swipeable>
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        // Pull-to-refresh control
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#0284c7"]}
            tintColor="#0284c7"
            progressBackgroundColor="#FFFFFF"
          />
        }
        // Handle scroll for animations
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
          }
        )}
        scrollEventThrottle={16}
        // List header
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderTitle}>
              {processedReports.length}{" "}
              {processedReports.length === 1 ? "Report" : "Reports"}
            </Text>
            <Text style={styles.listHeaderSubtitle}>
              {activeFilter !== "all"
                ? `Filtered by ${activeFilter.replace("_", " ")}`
                : searchQuery
                ? "Search results"
                : "All your reports"}
            </Text>
          </View>
        }
      />
    );
  };

  // Main component render
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header with search and filter */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>My Reports</Text>
          <View style={styles.headerActions}>
            <Menu
              visible={showMenu}
              onDismiss={() => setShowMenu(false)}
              anchor={
                <TouchableOpacity
                  style={styles.sortButton}
                  onPress={() => setShowMenu(true)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={
                      (SORT_OPTIONS.find((option) => option.id === activeSort)
                        ?.icon || "sort") as any
                    }
                    size={22}
                    color="#0284c7"
                  />
                </TouchableOpacity>
              }
              contentStyle={styles.menuContent}
            >
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Sort By</Text>
              </View>
              <Divider />
              {SORT_OPTIONS.map((option) => (
                <Menu.Item
                  key={option.id}
                  onPress={() => handleSort(option.id)}
                  title={option.label}
                  leadingIcon={option.icon}
                  titleStyle={[
                    styles.menuItemText,
                    activeSort === option.id && styles.activeMenuItemText,
                  ]}
                  style={[
                    styles.menuItem,
                    activeSort === option.id && styles.activeMenuItem,
                  ]}
                />
              ))}
            </Menu>
            <TouchableOpacity
              style={styles.filterToggleButton}
              onPress={toggleFilterBar}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={
                  showFilterBar ? "filter-variant-minus" : "filter-variant-plus"
                }
                size={22}
                color="#0284c7"
              />
            </TouchableOpacity>
          </View>
        </View>

        <Searchbar
          placeholder="Search reports..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor="#64748B"
          clearIcon="close-circle"
          placeholderTextColor="#94A3B8"
        />

        <Animated.View
          style={[styles.filterBarContainer, filterBarAnimatedStyle]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterBar}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === "all" && styles.activeFilterChip,
              ]}
              onPress={() => handleFilter("all")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === "all" && styles.activeFilterChipText,
                ]}
              >
                All ({statusCounts.all})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === ReportStatus.SUBMITTED &&
                  styles.activeFilterChip,
                activeFilter === ReportStatus.SUBMITTED && {
                  backgroundColor: "#64748B",
                },
              ]}
              onPress={() => handleFilter(ReportStatus.SUBMITTED)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === ReportStatus.SUBMITTED &&
                    styles.activeFilterChipText,
                ]}
              >
                Submitted ({statusCounts.submitted})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === ReportStatus.IN_PROGRESS &&
                  styles.activeFilterChip,
                activeFilter === ReportStatus.IN_PROGRESS && {
                  backgroundColor: "#2563EB",
                },
              ]}
              onPress={() => handleFilter(ReportStatus.IN_PROGRESS)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === ReportStatus.IN_PROGRESS &&
                    styles.activeFilterChipText,
                ]}
              >
                In Progress ({statusCounts.in_progress})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === ReportStatus.FIXED && styles.activeFilterChip,
                activeFilter === ReportStatus.FIXED && {
                  backgroundColor: "#059669",
                },
              ]}
              onPress={() => handleFilter(ReportStatus.FIXED)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === ReportStatus.FIXED &&
                    styles.activeFilterChipText,
                ]}
              >
                Fixed ({statusCounts.fixed})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === ReportStatus.REJECTED &&
                  styles.activeFilterChip,
                activeFilter === ReportStatus.REJECTED && {
                  backgroundColor: "#6B7280",
                },
              ]}
              onPress={() => handleFilter(ReportStatus.REJECTED)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === ReportStatus.REJECTED &&
                    styles.activeFilterChipText,
                ]}
              >
                Rejected ({statusCounts.rejected})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </Animated.View>

      {/* Main content */}
      <View style={styles.content}>{renderContent()}</View>

      {/* FAB for adding new report */}
      <FAB
        icon="plus"
        style={styles.fab}
        color="#FFFFFF"
        onPress={navigateToAddReport}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  filterToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  searchBar: {
    backgroundColor: "#F1F5F9",
    elevation: 0,
    borderRadius: 12,
    height: 48,
    marginBottom: 12,
  },
  searchInput: {
    fontSize: 15,
    color: "#0F172A",
  },
  filterBarContainer: {
    marginBottom: 4,
  },
  filterBar: {
    paddingRight: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: "#0284c7",
    borderColor: "#0284c7",
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
  },
  activeFilterChipText: {
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  listHeader: {
    marginBottom: 16,
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  listHeaderSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#0284c7",
    borderRadius: 28,
  },
  menuContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: 220,
    marginTop: 50,
  },
  menuHeader: {
    padding: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  menuItem: {
    height: 48,
  },
  activeMenuItem: {
    backgroundColor: "#F1F5F9",
  },
  menuItemText: {
    fontSize: 14,
    color: "#334155",
  },
  activeMenuItemText: {
    color: "#0284c7",
    fontWeight: "500",
  },
  swipeActionsContainer: {
    flexDirection: "row",
    width: width * 0.6, // 60% of screen width
    height: "100%",
  },
  swipeAction: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  viewAction: {
    backgroundColor: "#0284c7",
  },
  shareAction: {
    backgroundColor: "#0369a1",
  },
  deleteAction: {
    backgroundColor: "#DC2626",
  },
  swipeActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
});
