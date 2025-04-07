"use client";

import type React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FAB, Avatar, Card } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router";
import { getAllReports, likeReport } from "../../services/report-service";
import { getUserProfile } from "../../services/profile-service";
import type { PotholeReport } from "../../../lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import SearchBar from "../../components/dashboard-components/home/search-bar";
import ReportCard from "../../components/dashboard-components/home/report-card";
import EmptyState from "../../components/dashboard-components/home/empty-state";
import LoadingState from "../../components/dashboard-components/home/loading-state";

// Define category types for filtering
const CATEGORIES = [
  { id: "all", label: "All", icon: "view-dashboard-outline" },
  { id: "recent", label: "Recent", icon: "clock-outline" },
  { id: "nearby", label: "Nearby", icon: "map-marker-radius" },
  { id: "popular", label: "Popular", icon: "thumb-up-outline" },
  { id: "fixed", label: "Fixed", icon: "check-circle-outline" },
];

const HomeScreen: React.FC = () => {
  // Router for navigation between screens
  const router = useRouter();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState<PotholeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const profile = await getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, []);

  // Memoized function to fetch reports from the backend
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

  // Initial data fetch when component mounts
  useEffect(() => {
    fetchUserProfile();
    fetchReports();

    // Hide welcome message after 5 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [fetchReports, fetchUserProfile]);

  // Re-fetch reports when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );

  // Memoized filtering of reports based on search query and category
  const filteredReports = useMemo(() => {
    let filtered = reports;

    // Apply category filter
    if (activeCategory === "recent") {
      // Get timestamp for 24 hours ago
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);

      // Filter reports created in the last 24 hours
      filtered = filtered.filter((report) => {
        if (!report.created_at) return false;
        const reportDate = new Date(report.created_at);
        return reportDate >= oneDayAgo;
      });

      // Sort by newest first
      filtered = [...filtered].sort(
        (a, b) =>
          new Date(b.created_at || "").getTime() -
          new Date(a.created_at || "").getTime()
      );
    } else if (activeCategory === "popular") {
      filtered = [...filtered].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (activeCategory === "fixed") {
      filtered = filtered.filter((report) => report.status === "fixed");
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
  }, [reports, activeCategory, searchQuery]);

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

  // Render the welcome banner
  const renderWelcomeBanner = () => {
    if (!showWelcome || !userProfile) return null;

    return (
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500 }}
        exit={{ opacity: 0, translateY: -20 }}
      >
        <Card style={styles.welcomeBanner}>
          <Card.Content style={styles.welcomeContent}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeText}>
                Welcome back, {userProfile.username || "User"}!
              </Text>
              <Text style={styles.welcomeSubtext}>
                Help your community by reporting potholes
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowWelcome(false)}
            >
              <MaterialCommunityIcons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </MotiView>
    );
  };

  // Render stats summary

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Platform.OS === "android" ? "#1F2937" : undefined}
      />

      {/* Header with profile */}
      <LinearGradient
        colors={["#374151", "#1F2937"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerBanner}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>User Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Overview of your pothole reports
            </Text>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search reports..."
          />
        </View>
      </LinearGradient>

      {/* Welcome banner */}
      {renderWelcomeBanner()}

      {/* Category filters */}
      <View style={styles.filterButtonsContainer}>
        <ScrollableCategories
          categories={CATEGORIES}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
      </View>

      {/* Stats summary */}
      {!loading && !refreshing && reports.length > 0}

      {/* Conditional rendering based on loading and report availability */}
      {loading && !refreshing ? (
        <LoadingState />
      ) : filteredReports.length === 0 ? (
        <EmptyState
          message={
            searchQuery
              ? "No matching reports found"
              : activeCategory === "recent"
              ? "No reports in the last 24 hours"
              : activeCategory !== "all"
              ? `No ${activeCategory} reports found`
              : "No reports yet"
          }
          subMessage={
            searchQuery || activeCategory !== "all"
              ? "Try a different search term or filter"
              : "Be the first to report a pothole!"
          }
        />
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={({ item, index }) => (
            <ReportCard
              item={item}
              index={index}
              onLike={handleLike}
              onPress={() =>
                router.push(`/dashboard/report-details/${item.id}`)
              }
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#4B5563"]}
              tintColor="#4B5563"
              title="Pull to refresh"
              titleColor="#64748B"
            />
          }
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              {activeCategory === "all"
                ? "Recent Reports"
                : `${
                    CATEGORIES.find((c) => c.id === activeCategory)?.label
                  } Reports`}
            </Text>
          }
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

// Scrollable Categories Component
const ScrollableCategories = ({
  categories,
  activeCategory,
  onSelectCategory,
}: {
  categories: { id: string; label: string; icon: string }[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}) => {
  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.categoryChip,
            activeCategory === item.id && styles.activeCategoryChip,
          ]}
          onPress={() => onSelectCategory(item.id)}
        >
          <MaterialCommunityIcons
            name={item.icon as any}
            size={16}
            color={activeCategory === item.id ? "#FFFFFF" : "#64748B"}
            style={styles.categoryIcon}
          />
          <Text
            style={[
              styles.categoryLabel,
              activeCategory === item.id && styles.activeCategoryLabel,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.categoriesContent}
    />
  );
};

// Styles for the home screen component
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  headerBanner: {
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
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  profileButton: {
    marginLeft: 16,
  },
  avatar: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  searchContainer: {
    marginTop: 20,
    height: 48,
  },
  welcomeBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#4B5563",
  },
  welcomeContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 0,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  welcomeSubtext: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  filterButtonsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  categoriesContent: {
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#4B5563",
    borderRadius: 4,
    backgroundColor: "white",
    marginRight: 8,
  },
  activeCategoryChip: {
    backgroundColor: "#4B5563",
    borderColor: "#4B5563",
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  activeCategoryLabel: {
    color: "#FFFFFF",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 4,
    elevation: 2,
  },
  statCardContent: {
    alignItems: "center",
    padding: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4B5563",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    backgroundColor: "#374151",
    borderRadius: 28,
    height: 56,
    width: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1F2937",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
});

export default HomeScreen;
