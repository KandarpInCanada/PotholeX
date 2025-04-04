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
import { FAB, Avatar } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router";
import { getAllReports, likeReport } from "../../services/report-service";
import { getUserProfile } from "../../services/profile-service";
import type { PotholeReport } from "../../../lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
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
        style={styles.welcomeBanner}
      >
        <View style={styles.welcomeContent}>
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
      </MotiView>
    );
  };

  // Render the header with user profile
  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>PotholeX</Text>
          <View style={styles.headerSubtitle}>
            <MaterialCommunityIcons
              name="map-marker"
              size={14}
              color="#64748B"
            />
            <Text style={styles.locationText}>Your City</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push("(screens)/(dashboard)/profile")}
        >
          {userProfile?.avatar_url ? (
            <Avatar.Image
              size={40}
              source={{ uri: userProfile.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Text
              size={40}
              label={
                userProfile?.full_name
                  ? userProfile.full_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                  : "U"
              }
              style={styles.avatar}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // Render category filters
  const renderCategories = () => {
    return (
      <View style={styles.categoriesContainer}>
        <ScrollableCategories
          categories={CATEGORIES}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
      </View>
    );
  };

  // Render stats summary
  const renderStats = () => {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 500, delay: 300 }}
        style={styles.statsContainer}
      >
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{reports.length}</Text>
          <Text style={styles.statLabel}>Total Reports</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {reports.filter((r) => r.status === "fixed").length}
          </Text>
          <Text style={styles.statLabel}>Fixed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {reports.filter((r) => r.status === "in_progress").length}
          </Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
      </MotiView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Platform.OS === "android" ? "#F8FAFC" : undefined}
      />

      {/* Header with profile */}
      {renderHeader()}

      {/* Welcome banner */}
      {renderWelcomeBanner()}

      {/* Search bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search reports, locations..."
      />

      {/* Category filters */}
      {renderCategories()}

      {/* Stats summary */}
      {!loading && !refreshing && reports.length > 0 && renderStats()}

      {/* Conditional rendering based on loading and report availability */}
      {loading && !refreshing ? (
        <LoadingState />
      ) : filteredReports.length === 0 ? (
        <EmptyState
          message={
            searchQuery || activeCategory !== "all"
              ? "No matching reports found"
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
              colors={["#0284c7"]}
              tintColor="#0284c7"
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
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  locationText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 4,
  },
  profileButton: {
    marginLeft: 16,
  },
  avatar: {
    backgroundColor: "#0284c7",
  },
  welcomeBanner: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#0284c7",
  },
  welcomeContent: {
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
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeCategoryChip: {
    backgroundColor: "#0284c7",
    borderColor: "#0284c7",
  },
  categoryIcon: {
    marginRight: 6,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0284c7",
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
    paddingTop: 0,
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
