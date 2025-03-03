import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { IconButton } from "react-native-paper";
import { ReportStatus } from "../../../../lib/supabase";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ReportListHeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  activeFilter: ReportStatus | "all";
  onFilterChange: (filter: ReportStatus | "all") => void;
  onAddPress: () => void;
  counts?: Record<ReportStatus | "all", number>;
}

const ReportListHeader: React.FC<ReportListHeaderProps> = ({
  searchQuery,
  onSearch,
  activeFilter,
  onFilterChange,
  onAddPress,
  counts = {},
}) => {
  const insets = useSafeAreaInsets();

  const clearSearch = () => {
    onSearch("");
  };

  const renderFilterButton = (filter: ReportStatus | "all", label: string) => {
    const count = counts[filter] || 0;

    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilter === filter && styles.activeFilterButton,
        ]}
        onPress={() => onFilterChange(filter)}
        accessibilityRole="button"
        accessibilityState={{ selected: activeFilter === filter }}
        accessibilityLabel={`${label} filter ${
          count > 0 ? `, ${count} items` : ""
        }`}
      >
        <Text
          style={[
            styles.filterButtonText,
            activeFilter === filter && styles.activeFilterButtonText,
          ]}
        >
          {label}
        </Text>
        {count > 0 && (
          <View
            style={[
              styles.countBadge,
              activeFilter === filter && styles.activeCountBadge,
            ]}
          >
            <Text
              style={[
                styles.countText,
                activeFilter === filter && styles.activeCountText,
              ]}
            >
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerControls}>
        <View style={styles.searchContainer}>
          {/* Custom Searchbar with no background */}
          <View style={styles.searchBar}>
            <MaterialCommunityIcons
              name="magnify"
              size={22}
              color="#64748B"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search reports..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={onSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.clearButton}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={18}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <IconButton
          icon="plus"
          size={24}
          onPress={onAddPress}
          style={styles.addButton}
          iconColor="#FFFFFF"
          accessibilityLabel="Add new report"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {renderFilterButton("all", "All")}
        {renderFilterButton(ReportStatus.SUBMITTED, "Submitted")}
        {renderFilterButton(ReportStatus.IN_PROGRESS, "In Progress")}
        {renderFilterButton(ReportStatus.FIXED, "Fixed")}
        {renderFilterButton(ReportStatus.REJECTED, "Rejected")}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: 5,
    paddingTop: 5,
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: "#0284c7",
    borderRadius: 12,
    margin: 0,
    width: 48,
    height: 48,
  },
  searchContainer: {
    flex: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    height: 48,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    color: "#1E293B",
    padding: 0,
    backgroundColor: "transparent",
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    marginBottom: 0,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: "#0284c7",
    borderColor: "#0284c7",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
  },
  activeFilterButtonText: {
    color: "#FFFFFF",
  },
  countBadge: {
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: "center",
  },
  activeCountBadge: {
    backgroundColor: "#0369a1",
  },
  countText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  activeCountText: {
    color: "#F1F5F9",
  },
});

export default ReportListHeader;
