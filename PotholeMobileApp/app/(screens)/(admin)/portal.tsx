/**
 * Admin Portal Dashboard Screen
 *
 * This screen serves as the main dashboard for administrators, displaying
 * analytics and statistics about pothole reports and users. It includes
 * pie charts for report status and severity, and quick action buttons.
 *
 * Key features:
 * - Visual analytics with pie charts
 * - Report status and severity distribution
 * - Quick action buttons for common admin tasks
 * - Animated UI elements for better user experience
 */

"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Button, Divider, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/auth-context";
import { PieChart } from "react-native-chart-kit";
import { ReportStatus, SeverityLevel } from "../../../lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";

// Define the screen width for responsive charts
const screenWidth = Dimensions.get("window").width - 32; // Full width minus padding

/**
 * Interface for dashboard statistics data
 */
interface DashboardStats {
  totalReports: number;
  totalUsers: number;
  reportsByStatus: {
    submitted: number;
    in_progress: number;
    fixed: number;
    rejected: number;
  };
  reportsBySeverity: {
    low: number;
    medium: number;
    danger: number;
  };
  reportsPerDay: {
    date: string;
    count: number;
  }[];
  userGrowth: {
    date: string;
    count: number;
  }[];
}

export default function AdminPortal() {
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();

  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    totalUsers: 0,
    reportsByStatus: {
      submitted: 0,
      in_progress: 0,
      fixed: 0,
      rejected: 0,
    },
    reportsBySeverity: {
      low: 0,
      medium: 0,
      danger: 0,
    },
    reportsPerDay: [],
    userGrowth: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const chartOpacity = useSharedValue(0);
  const chartScale = useSharedValue(0.95);
  const actionsOpacity = useSharedValue(0);
  const actionsTranslateY = useSharedValue(20);

  /**
   * Fetch dashboard data and start animations when component mounts
   */
  useEffect(() => {
    fetchDashboardData();

    // Start animations
    headerOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    headerTranslateY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });

    chartOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
    chartScale.value = withDelay(
      300,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
    );

    actionsOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
    actionsTranslateY.value = withDelay(
      600,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  /**
   * Fetches and processes dashboard data from the database
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      // Fetch all reports
      const { data: reportsData, error: reportsError } = await supabase
        .from("pothole_reports")
        .select("*");
      if (reportsError) throw reportsError;

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*");
      if (usersError) throw usersError;

      // Process reports by status
      const reportsByStatus = {
        submitted: reportsData.filter(
          (r) => r.status === ReportStatus.SUBMITTED
        ).length,
        in_progress: reportsData.filter(
          (r) => r.status === ReportStatus.IN_PROGRESS
        ).length,
        fixed: reportsData.filter((r) => r.status === ReportStatus.FIXED)
          .length,
        rejected: reportsData.filter((r) => r.status === ReportStatus.REJECTED)
          .length,
      };

      // Process reports by severity
      const reportsBySeverity = {
        low: reportsData.filter((r) => r.severity === SeverityLevel.LOW).length,
        medium: reportsData.filter((r) => r.severity === SeverityLevel.MEDIUM)
          .length,
        danger: reportsData.filter((r) => r.severity === SeverityLevel.DANGER)
          .length,
      };

      // Process reports per day (last 7 days)
      const reportsPerDay = processReportsPerDay(reportsData);

      // Process user growth (last 7 days)
      const userGrowth = processUserGrowth(usersData);

      setStats({
        totalReports: reportsData.length,
        totalUsers: usersData.length,
        reportsByStatus,
        reportsBySeverity,
        reportsPerDay,
        userGrowth,
      });

      // Animate charts when data is loaded
      chartOpacity.value = withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
      chartScale.value = withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Helper function to process reports per day for the last 7 days
   */
  const processReportsPerDay = (reports: any[]) => {
    // Get dates for the last 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    // Count reports for each day
    return dates.map((date) => {
      const count = reports.filter((r) =>
        r.created_at?.startsWith(date)
      ).length;
      return { date, count };
    });
  };

  /**
   * Helper function to process user growth for the last 7 days
   */
  const processUserGrowth = (users: any[]) => {
    // Get dates for the last 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    // Count users created on each day
    return dates.map((date) => {
      const count = users.filter((u) => u.created_at?.startsWith(date)).length;
      return { date, count };
    });
  };

  // Prepare data for status pie chart
  const statusChartData = [
    {
      name: "Submitted",
      population: stats.reportsByStatus.submitted,
      color: "#64748B",
      legendFontColor: "#64748B",
      legendFontSize: 12,
    },
    {
      name: "In Progress",
      population: stats.reportsByStatus.in_progress,
      color: "#3B82F6",
      legendFontColor: "#64748B",
      legendFontSize: 12,
    },
    {
      name: "Fixed",
      population: stats.reportsByStatus.fixed,
      color: "#10B981",
      legendFontColor: "#64748B",
      legendFontSize: 12,
    },
    {
      name: "Rejected",
      population: stats.reportsByStatus.rejected,
      color: "#EF4444",
      legendFontColor: "#64748B",
      legendFontSize: 12,
    },
  ];

  // Prepare data for severity pie chart
  const severityChartData = [
    {
      name: "Low",
      population: stats.reportsBySeverity.low,
      color: "#10B981",
      legendFontColor: "#64748B",
      legendFontSize: 12,
    },
    {
      name: "Medium",
      population: stats.reportsBySeverity.medium,
      color: "#F59E0B",
      legendFontColor: "#64748B",
      legendFontSize: 12,
    },
    {
      name: "Danger",
      population: stats.reportsBySeverity.danger,
      color: "#EF4444",
      legendFontColor: "#64748B",
      legendFontSize: 12,
    },
  ];

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [{ translateY: headerTranslateY.value }],
    };
  });

  const chartAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: chartOpacity.value,
      transform: [{ scale: chartScale.value }],
    };
  });

  const actionsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: actionsOpacity.value,
      transform: [{ translateY: actionsTranslateY.value }],
    };
  });

  /**
   * Handle pull-to-refresh functionality
   */
  const handleRefresh = () => {
    setRefreshing(true);

    // Reset animations
    chartOpacity.value = 0;
    chartScale.value = 0.95;

    // Animate loading
    chartOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    chartScale.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });

    fetchDashboardData();
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <ActivityIndicator size="large" color="#3B82F6" />
          </MotiView>
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay: 200 }}
          >
            <Text style={styles.loadingText}>Loading dashboard data...</Text>
          </MotiView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
      >
        {/* Combined Header Section */}
        <Animated.View style={[styles.welcomeSection, headerAnimatedStyle]}>
          <LinearGradient
            colors={["#374151", "#1F2937"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.welcomeGradient}
          >
            <View style={styles.welcomeHeader}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.welcomeTitle}>Admin Dashboard</Text>
                <Text style={styles.welcomeSubtitle}>
                  Overview of pothole reports and user activity
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Reports by Status Pie Chart */}
        <Animated.View style={[chartAnimatedStyle]}>
          <Card style={styles.chartCard} mode="elevated">
            <View style={{ overflow: "hidden", borderRadius: 16 }}>
              <Card.Title
                title="Reports by Status"
                titleStyle={styles.cardTitle}
                left={() => (
                  <MaterialCommunityIcons
                    name="chart-pie"
                    size={24}
                    color="#3B82F6"
                  />
                )}
              />
              <Divider style={styles.cardDivider} />
              <Card.Content style={styles.cardContent}>
                <View style={styles.chartContainer}>
                  {stats.totalReports > 0 ? (
                    <PieChart
                      data={statusChartData}
                      width={screenWidth - 32}
                      height={220}
                      chartConfig={chartConfig}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="15"
                      absolute
                    />
                  ) : (
                    <View style={styles.noDataContainer}>
                      <MaterialCommunityIcons
                        name="chart-pie"
                        size={48}
                        color="#CBD5E1"
                      />
                      <Text style={styles.noDataText}>
                        No report data available
                      </Text>
                    </View>
                  )}
                </View>
              </Card.Content>
            </View>
          </Card>
        </Animated.View>

        {/* Reports by Severity Pie Chart */}
        <Animated.View style={[chartAnimatedStyle]}>
          <Card style={styles.chartCard} mode="elevated">
            <View style={{ overflow: "hidden", borderRadius: 16 }}>
              <Card.Title
                title="Reports by Severity"
                titleStyle={styles.cardTitle}
                left={() => (
                  <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={24}
                    color="#3B82F6"
                  />
                )}
              />
              <Divider style={styles.cardDivider} />
              <Card.Content style={styles.cardContent}>
                <View style={styles.chartContainer}>
                  {stats.totalReports > 0 ? (
                    <PieChart
                      data={severityChartData}
                      width={screenWidth - 32}
                      height={220}
                      chartConfig={chartConfig}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="15"
                      absolute
                    />
                  ) : (
                    <View style={styles.noDataContainer}>
                      <MaterialCommunityIcons
                        name="chart-pie"
                        size={48}
                        color="#CBD5E1"
                      />
                      <Text style={styles.noDataText}>
                        No severity data available
                      </Text>
                    </View>
                  )}
                </View>
              </Card.Content>
            </View>
          </Card>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[actionsAnimatedStyle]}>
          <Card style={styles.actionsCard} mode="elevated">
            <View style={{ overflow: "hidden", borderRadius: 16 }}>
              <Card.Title
                title="Quick Actions"
                titleStyle={styles.cardTitle}
                left={() => (
                  <MaterialCommunityIcons
                    name="lightning-bolt"
                    size={24}
                    color="#3B82F6"
                  />
                )}
              />
              <Divider style={styles.cardDivider} />
              <Card.Content style={styles.cardContent}>
                <View style={styles.actionButtonsContainer}>
                  <Button
                    mode="contained"
                    icon="clipboard-list"
                    onPress={() => {
                      // Add button press animation
                      actionsTranslateY.value = withSequence(
                        withTiming(-5, { duration: 100 }),
                        withTiming(0, { duration: 100 })
                      );
                      router.push("/(screens)/(admin)/report-list");
                    }}
                    style={styles.actionButton}
                    contentStyle={styles.actionButtonContent}
                    buttonColor="#3B82F6"
                  >
                    Manage Reports
                  </Button>
                  <Button
                    mode="contained"
                    icon="account-group"
                    onPress={() => {
                      // Add button press animation
                      actionsTranslateY.value = withSequence(
                        withTiming(-5, { duration: 100 }),
                        withTiming(0, { duration: 100 })
                      );
                      router.push("/(screens)/(admin)/users");
                    }}
                    style={styles.actionButton}
                    contentStyle={styles.actionButtonContent}
                    buttonColor="#8B5CF6"
                  >
                    Manage Users
                  </Button>
                </View>
              </Card.Content>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4FF", // Updated to light blue background
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Increase this value to ensure content isn't hidden behind the tab bar
  },
  welcomeSection: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeGradient: {
    padding: 20,
  },
  welcomeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  avatar: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  avatarLabel: {
    color: "#FFFFFF",
  },
  chartCard: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  cardContent: {
    paddingVertical: 16,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  noDataContainer: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  noDataText: {
    marginTop: 12,
    fontSize: 16,
    color: "#94A3B8",
  },
  actionsCard: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 4, // Changed to square
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  profileButton: {
    borderRadius: 50,
    overflow: "hidden",
  },
});
