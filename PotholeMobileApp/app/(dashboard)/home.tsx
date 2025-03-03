"use client";

import type React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FAB } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router";
import { getAllReports, likeReport } from "../services/report-service";
import type { PotholeReport } from "../../lib/supabase";
import Header from "../components/dashboard-components/home/header";
import SearchBar from "../components/dashboard-components/home/search-bar";
import ReportCard from "../components/dashboard-components/home/report-card";
import EmptyState from "../components/dashboard-components/home/empty-state";
import LoadingState from "../components/dashboard-components/home/loading-state";

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState<PotholeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllReports();
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

  const filteredReports = useMemo(() => {
    if (searchQuery.trim() === "") {
      return reports;
    }
    return reports.filter(
      (report) =>
        report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reports, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  const handleLike = async (reportId: string) => {
    const success = await likeReport(reportId);
    if (success) {
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
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={styles.header}>
        <Header title="Pothole Reports" />
        <SearchBar value={searchQuery} onChangeText={handleSearch} />
      </View>
      {loading && !refreshing ? (
        <LoadingState />
      ) : filteredReports.length === 0 ? (
        <EmptyState
          message="No reports found"
          subMessage={
            searchQuery
              ? "Try a different search term"
              : "Be the first to report a pothole!"
          }
        />
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={({ item, index }) => (
            <ReportCard item={item} index={index} onLike={handleLike} />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        color="#FFFFFF"
        onPress={() => router.push("/(dashboard)/AddReport")}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingBottom: 0,
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 1,
  },
  listContainer: {
    padding: 16,
  },
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
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
});

export default HomeScreen;
