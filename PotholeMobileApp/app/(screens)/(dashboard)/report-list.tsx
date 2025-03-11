// Main ReportListScreen.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { getUserReports } from "../../services/report-service";
import { PotholeReport, ReportStatus } from "../../../lib/supabase";
import ReportListHeader from "../../components/dashboard-components/report-list/report-list-header";
import ReportItem from "../../components/dashboard-components/report-list/report-item";
import EmptyState from "../../components/dashboard-components/report-list/empty-state";

export default function ReportListScreen() {
  // Router for navigation
  const router = useRouter();

  // State management for reports and UI
  const [reports, setReports] = useState<PotholeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search and filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ReportStatus | "all">("all");

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
  // Ensures data is up-to-date when returning to the screen
  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );

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

  // Memoized filtered reports for performance optimization
  // Recalculates only when reports, filter, or search query changes
  const filteredReports = useMemo(() => {
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

    return filtered;
  }, [reports, activeFilter, searchQuery]);

  // Memoized calculation of status counts
  // Provides count of reports for each status
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

  // Handle updating reports list (e.g., after deletion or modification)
  const handleReportUpdate = (updatedReports: PotholeReport[]) => {
    setReports(updatedReports);
  };

  // Navigate to add report screen
  const navigateToAddReport = () => {
    router.push("(screens)/(dashboard)/add-report");
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
    if (filteredReports.length === 0) {
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
      <FlatList
        data={filteredReports}
        // Ensure unique key for each item
        keyExtractor={(item) => item.id || Math.random().toString()}
        // Render individual report item
        renderItem={({ item, index }) => (
          <ReportItem
            report={item}
            index={index}
            // Navigate to report details
            onPress={() => router.push(`/dashboard/report-details/${item.id}`)}
            onReportsChange={handleReportUpdate}
            reports={reports}
          />
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
          />
        }
      />
    );
  };

  // Main component render
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header with search, filter, and add report functionality */}
      <ReportListHeader
        searchQuery={searchQuery}
        onSearch={handleSearch}
        activeFilter={activeFilter}
        onFilterChange={handleFilter}
        onAddPress={navigateToAddReport}
        counts={statusCounts}
      />

      {/* Dynamically render content based on reports state */}
      {renderContent()}
    </SafeAreaView>
  );
}

// Styles for the report list screen
const styles = StyleSheet.create({
  // Full-screen safe area with light background
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingBottom: 0,
  },
  // Padding for the list container
  listContainer: {
    padding: 16,
  },
});
