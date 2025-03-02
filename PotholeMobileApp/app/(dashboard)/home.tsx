"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Searchbar, FAB, Avatar, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Pothole {
  id: string;
  images: any[];
  location: string;
  reportedBy: string;
  profilePic: any;
  date: string;
  severity: string;
  status: string;
  description: string;
  likes: number;
  comments: number;
}

const potholes: Pothole[] = [
  {
    id: "1",
    images: [require("../assets/hole-1.jpeg")],
    location: "5th Ave Main St, Halifax, Nova Scotia",
    reportedBy: "Kandarp Patel",
    profilePic: require("../assets/hole-1.jpeg"),
    date: "Mar 25, 2022",
    severity: "Danger",
    status: "In Progress",
    description:
      "Large pothole causing major vehicle damage. Needs urgent repair!",
    likes: 24,
    comments: 12,
  },
  // ... add more sample data as needed
];

const SEVERITY_COLORS = {
  Danger: "#DC2626",
  Medium: "#F59E0B",
  Low: "#10B981",
};

const STATUS_COLORS = {
  "In Progress": "#2563EB",
  Fixed: "#059669",
  Rejected: "#6B7280",
};

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPotholes, setFilteredPotholes] = useState(potholes);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = potholes.filter((pothole) =>
      pothole.location.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPotholes(filtered);
  };

  const renderCard = ({ item }: { item: Pothole }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Avatar.Image
            size={40}
            source={item.profilePic}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.reportedBy}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <MaterialCommunityIcons
            name="dots-vertical"
            size={20}
            color="#64748B"
          />
        </TouchableOpacity>
      </View>

      <Image source={item.images[0]} style={styles.image} />

      <View style={styles.contentContainer}>
        <View style={styles.locationContainer}>
          <MaterialCommunityIcons name="map-marker" size={16} color="#0284c7" />
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
                  SEVERITY_COLORS[
                    item.severity as keyof typeof SEVERITY_COLORS
                  ] || "#6B7280",
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
                  STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] ||
                  "#6B7280",
              },
            ]}
            textStyle={styles.chipText}
          >
            {item.status}
          </Chip>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.interactionButton}>
            <MaterialCommunityIcons
              name="thumb-up-outline"
              size={20}
              color="#64748B"
            />
            <Text style={styles.interactionText}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.interactionButton}>
            <MaterialCommunityIcons
              name="comment-outline"
              size={20}
              color="#64748B"
            />
            <Text style={styles.interactionText}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.interactionButton}>
            <MaterialCommunityIcons
              name="share-outline"
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.header}>
        <Text style={styles.title}>Pothole Reports</Text>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialCommunityIcons
            name="filter-variant"
            size={24}
            color="#0284c7"
          />
        </TouchableOpacity>
      </View>

      <Searchbar
        placeholder="Search by location..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
        iconColor="#64748B"
        placeholderTextColor="#94A3B8"
      />

      <FlatList
        data={filteredPotholes}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        color="#FFFFFF"
        onPress={() => console.log("Add new report")}
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
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  filterButton: {
    padding: 8,
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    height: 50,
  },
  searchInput: {
    fontSize: 15,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  date: {
    fontSize: 13,
    color: "#64748B",
  },
  moreButton: {
    padding: 4,
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  contentContainer: {
    padding: 16,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: "#0284c7",
    marginLeft: 4,
    fontWeight: "500",
    flex: 1,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  severityChip: {
    marginRight: 8,
    height: 28,
  },
  statusChip: {
    height: 28,
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginVertical: 0,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  interactionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  interactionText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#0284c7",
    borderRadius: 28,
  },
});

export default HomeScreen;
