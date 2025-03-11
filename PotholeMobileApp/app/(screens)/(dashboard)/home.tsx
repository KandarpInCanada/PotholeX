"use client";

import type React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FAB } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router";
import { getAllReports, likeReport } from "../../services/report-service";
import type { PotholeReport } from "../../../lib/supabase";
import SearchBar from "../../components/dashboard-components/home/search-bar";
import ReportCard from "../../components/dashboard-components/home/report-card";
import EmptyState from "../../components/dashboard-components/home/empty-state";
import LoadingState from "../../components/dashboard-components/home/loading-state";

const HomeScreen: React.FC = () => {
  // Router for navigation between screens
  const router = useRouter();

  // State management for search, reports, loading, and refreshing
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState<PotholeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Memoized function to fetch reports from the backend
  // Uses useCallback to prevent unnecessary re-renders
  const fetchReports = useCallback(async () => {
    try {
      // Set loading state to true while fetching
      setLoading(true);
      // Retrieve all reports from the service
      const data = await getAllReports();
      // Update reports state with fetched data
      setReports(data);
    } catch (error) {
      // Log any errors during fetching
      console.error("Error fetching reports:", error);
    } finally {
      // Ensure loading state is set to false after fetch attempt
      setLoading(false);
    }
  }, []);

  // Initial reports fetch when component mounts
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Re-fetch reports when screen comes into focus
  // Ensures data is up-to-date when returning to the screen
  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );

  // Memoized filtering of reports based on search query
  // Reduces unnecessary re-computations
  const filteredReports = useMemo(() => {
    // If no search query, return all reports
    if (searchQuery.trim() === "") {
      return reports;
    }
    // Filter reports based on location, description, or category
    return reports.filter(
      (report) =>
        report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reports, searchQuery]);

  // Handler for search input changes
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handler for pull-to-refresh functionality
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  // Handler for liking a report
  // Updates the likes count locally after successful like
  const handleLike = async (reportId: string) => {
    const success = await likeReport(reportId);
    if (success) {
      // Optimistically update the likes count
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId
            ? {
                ...report,
                likes: (report.likes || 0) + 1,
              }
            : report
        )
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Search bar for filtering reports */}
      <SearchBar value={searchQuery} onChangeText={handleSearch} />

      {/* Conditional rendering based on loading and report availability */}
      {loading && !refreshing ? (
        // Show loading state when initially fetching reports
        <LoadingState />
      ) : filteredReports.length === 0 ? (
        // Show empty state when no reports are found
        <EmptyState
          message="No reports found"
          subMessage={
            searchQuery
              ? "Try a different search term"
              : "Be the first to report a pothole!"
          }
        />
      ) : (
        // Render list of reports with optimized FlatList
        <FlatList
          data={filteredReports}
          // Ensure unique key for each report
          keyExtractor={(item) => item.id || Math.random().toString()}
          // Render individual report cards
          renderItem={({ item, index }) => (
            <ReportCard item={item} index={index} onLike={handleLike} />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          // Pull-to-refresh functionality
          refreshing={refreshing}
          onRefresh={handleRefresh}
          // Performance optimizations for long lists
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}

      {/* Floating Action Button to add new report */}
      <FAB
        icon="plus"
        style={styles.fab}
        color="#FFFFFF"
        onPress={() => router.push("(screens)/(dashboard)/add-report")}
      />
    </SafeAreaView>
  );
};

// Styles for the home screen component
const styles = StyleSheet.create({
  // Full flex to ensure SafeAreaView takes entire screen
  // Added background color
  safeArea: {
    flex: 1,
    paddingBottom: 0,
    backgroundColor: "#f0f4f8", // Light blue-gray background
  },
  // Padding for the list container
  listContainer: {
    padding: 16,
    backgroundColor: "#f0f4f8", // Consistent background color
  },
  // Styled Floating Action Button for adding reports
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    backgroundColor: "#0284c7",
    borderRadius: 16,
    height: 56,
    width: 56,
    alignItems: "center",
    justifyContent: "center",
    // Shadow and elevation for 3D effect
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
});

export default HomeScreen;
