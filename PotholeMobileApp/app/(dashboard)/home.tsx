"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Searchbar, FAB, Avatar, Chip, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { getAllReports, likeReport } from "../services/report-service";
import {
  type PotholeReport,
  ReportStatus,
  SeverityLevel,
} from "../../lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { MotiView, AnimatePresence } from "moti";

const { width } = Dimensions.get("window");
const CARD_PADDING = 16;
const CARD_MARGIN = 8;
const CARD_WIDTH = width - CARD_PADDING * 2 - 4;
const ITEM_HEIGHT = 240;

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
  [ReportStatus.DRAFT]: "#9CA3AF",
};

const HomeScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState<PotholeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId] = useState("user123"); // Replace with actual user ID

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

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "pothole":
        return "road";
      case "manhole":
        return "circle-slice-8";
      case "crack":
        return "alert-octagon";
      default:
        return "alert-circle";
    }
  };

  const renderCard = useCallback(
    ({ item, index }: { item: PotholeReport; index: number }) => {
      const profile = item.profiles;

      return (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: "timing",
            duration: 500,
            delay: index * 100,
          }}
          style={styles.card}
        >
          <TouchableOpacity
            onPress={() => router.push(`/dashboard/report-details/${item.id}`)}
            activeOpacity={0.7}
          >
            {item.images && item.images.length > 0 && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.images[0] }}
                  style={styles.image}
                  defaultSource={require("../assets/placeholder-image.svg")}
                />
                <View style={styles.gradientOverlay} />

                <View style={styles.floatingCategory}>
                  <MaterialCommunityIcons
                    name={getCategoryIcon(item.category)}
                    size={14}
                    color="#475569"
                  />
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>

                {item.images.length > 1 && (
                  <View style={styles.imageCountBadge}>
                    <MaterialCommunityIcons
                      name="image-multiple"
                      size={14}
                      color="white"
                    />
                    <Text style={[styles.imageCountText, { marginLeft: 4 }]}>
                      +{item.images.length - 1}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.contentContainer}>
              <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                  <Avatar.Image
                    size={40}
                    source={
                      profile?.avatar_url
                        ? { uri: profile.avatar_url }
                        : require("../assets/default-avatar.png")
                    }
                    style={styles.avatar}
                  />
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {profile?.username || "Anonymous"}
                    </Text>
                    <Text style={styles.date}>
                      {formatDate(item.created_at)}
                    </Text>
                  </View>
                </View>
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  iconColor="#64748B"
                  onPress={() => {}}
                />
              </View>

              <View style={styles.locationContainer}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={16}
                  color="#0284c7"
                />
                <Text style={styles.location} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>

              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.tagsContainer}>
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
                <Chip
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor:
                        STATUS_COLORS[item.status as ReportStatus] || "#6B7280",
                    },
                  ]}
                  textStyle={styles.chipText}
                >
                  {item.status}
                </Chip>
              </View>

              <View style={styles.footer}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    style={styles.interactionButton}
                    onPress={() => item.id && handleLike(item.id)}
                  >
                    <Text style={styles.interactionText}>
                      {item.likes || 0}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.interactionButton, { marginLeft: 8 }]}
                  >
                    <MaterialCommunityIcons
                      name="comment-outline"
                      size={18}
                      color="#64748B"
                    />
                    <Text style={styles.interactionText}>
                      {item.comments || 0}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.interactionButton}>
                  <MaterialCommunityIcons
                    name="share-outline"
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </MotiView>
      );
    },
    [formatDate, router, userId]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Pothole Reports</Text>
          <View style={styles.headerActions}>
            <IconButton
              icon="tune-vertical"
              size={24}
              iconColor="#0284c7"
              onPress={() => router.push("/dashboard/filters")}
            />
            <IconButton
              icon="map"
              size={24}
              iconColor="#0284c7"
              onPress={() => router.push("/dashboard/map")}
            />
          </View>
        </View>

        <Searchbar
          placeholder="Search by location or description..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor="#64748B"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <AnimatePresence>
        {loading && !refreshing ? (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.loadingContainer}
          >
            <ActivityIndicator size="large" color="#0284c7" />
            <Text style={styles.loadingText}>Loading reports...</Text>
          </MotiView>
        ) : filteredReports.length === 0 ? (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={styles.emptyContainer}
          >
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={64}
              color="#94A3B8"
            />
            <Text style={styles.emptyText}>No reports found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? "Try a different search term"
                : "Be the first to report a pothole!"}
            </Text>
          </MotiView>
        ) : (
          <FlatList
            data={filteredReports}
            keyExtractor={(item) => item.id || Math.random().toString()}
            renderItem={renderCard}
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
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        )}
      </AnimatePresence>

      <FAB
        icon="plus"
        style={styles.fab}
        color="#FFFFFF"
        onPress={() => router.push("/dashboard/add-report")}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 1,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    height: 48,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 8,
  },
  searchInput: {
    fontSize: 15,
    color: "#334155",
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
  },
  listContainer: {
    padding: CARD_PADDING,
    paddingTop: 8,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    lineHeight: 20,
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: ITEM_HEIGHT * 0.6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  floatingCategory: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  imageCountBadge: {
    position: "absolute",
    right: 12,
    top: 12,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  imageCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  contentContainer: {
    padding: 18,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#F8FAFC",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  location: {
    fontSize: 14,
    color: "#0284c7",
    marginLeft: 6,
    fontWeight: "600",
    lineHeight: 20,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
    marginBottom: 14,
    fontWeight: "400",
    letterSpacing: -0.2,
  },
  tagsContainer: {
    flexDirection: "row",
    marginBottom: 16,
    flexWrap: "wrap",
    margin: -4,
    gap: 6,
  },
  severityChip: {
    height: 30,
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  statusChip: {
    height: 30,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  categoryChip: {
    height: 30,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    includeFontPadding: false,
    textTransform: "capitalize",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 14,
    borderTopWidth: 1.5,
    borderTopColor: "#F1F5F9",
    marginTop: 8,
  },
  interactionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  interactionText: {
    marginLeft: 6,
    fontSize: 13.5,
    color: "#475569",
    fontWeight: "600",
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
