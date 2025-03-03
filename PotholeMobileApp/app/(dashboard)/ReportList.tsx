// Main ReportListScreen.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { getUserReports } from "../services/report-service";
import { PotholeReport, ReportStatus } from "../../lib/supabase";
import ReportListHeader from "../components/dashboard-components/report-list/report-list-header";
import ReportItem from "../components/dashboard-components/report-list/report-item";
import EmptyState from "../components/dashboard-components/report-list/empty-state";

export default function ReportListScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<PotholeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ReportStatus | "all">("all");

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserReports();
      setReports(data);
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
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  const handleFilter = (filter: ReportStatus | "all") => {
    setActiveFilter(filter);
  };

  // Calculate filtered reports using useMemo for better performance
  const filteredReports = useMemo(() => {
    let filtered = reports;

    // Apply status filter
    if (activeFilter !== "all") {
      filtered = filtered.filter((report) => report.status === activeFilter);
    }

    // Apply search filter
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

  // Calculate counts for each status
  const statusCounts = useMemo(() => {
    const counts: Record<ReportStatus | "all", number> = {
      all: reports.length,
      [ReportStatus.SUBMITTED]: 0,
      [ReportStatus.IN_PROGRESS]: 0,
      [ReportStatus.FIXED]: 0,
      [ReportStatus.REJECTED]: 0,
    };

    reports.forEach((report) => {
      if (report.status && counts[report.status] !== undefined) {
        counts[report.status]++;
      }
    });

    return counts;
  }, [reports]);

  const handleReportUpdate = (updatedReports: PotholeReport[]) => {
    setReports(updatedReports);
  };

  const navigateToAddReport = () => {
    // Use consistent path format
    router.push("/(dashboard)/AddReport");
  };

  const renderContent = () => {
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

    return (
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={({ item, index }) => (
          <ReportItem
            report={item}
            index={index}
            onPress={() => router.push(`/dashboard/report-details/${item.id}`)}
            onReportsChange={handleReportUpdate}
            reports={reports}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ReportListHeader
        searchQuery={searchQuery}
        onSearch={handleSearch}
        activeFilter={activeFilter}
        onFilterChange={handleFilter}
        onAddPress={navigateToAddReport}
        counts={statusCounts}
      />

      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingBottom: 0,
  },
  listContainer: {
    padding: 16,
  },
});
