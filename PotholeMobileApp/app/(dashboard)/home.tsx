import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";
import {
  Text,
  Searchbar,
  Avatar,
  PaperProvider,
  Chip,
  FAB,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import { lightTheme } from "../theme";
import { MotiView, MotiImage } from "moti";

interface Pothole {
  id: string;
  images: any[];
  location: string;
  reportedBy: string;
  profilePic: any;
  date: string;
  severity: string;
  status: string;
  coordinates?: { latitude: number; longitude: number };
  description: string;
}

const potholes: Pothole[] = [
  {
    id: "1",
    images: [
      require("../assets/hole-1.jpeg"),
      require("../assets/hole-1.jpeg"),
    ],
    location: "5th Ave Main St, Halifax, Nova Scotia",
    reportedBy: "Kandarp Patel",
    profilePic: require("../assets/hole-1.jpeg"),
    date: "Mar 25, 2022",
    severity: "Danger",
    status: "In Progress",
    coordinates: { latitude: 44.6488, longitude: -63.5752 },
    description: "Large pothole causing major vehicle damage. Needs urgent repair!"
  },
  {
    id: "2",
    images: [
      require("../assets/hole-1.jpeg"),
      require("../assets/hole-1.jpeg"),
    ],
    location: "5th Ave Main St, Halifax, Nova Scotia",
    reportedBy: "Kandarp Patel",
    profilePic: require("../assets/hole-1.jpeg"),
    date: "Mar 25, 2022",
    severity: "Danger",
    status: "In Progress",
    coordinates: { latitude: 44.6488, longitude: -63.5752 },
    description: "Large pothole causing major vehicle damage. Needs urgent repair!"
  },
  {
    id: "3",
    images: [
      require("../assets/hole-1.jpeg"),
      require("../assets/hole-1.jpeg"),
    ],
    location: "5th Ave Main St, Halifax, Nova Scotia",
    reportedBy: "Kandarp Patel",
    profilePic: require("../assets/hole-1.jpeg"),
    date: "Mar 25, 2022",
    severity: "Danger",
    status: "In Progress",
    coordinates: { latitude: 44.6488, longitude: -63.5752 },
    description: "Large pothole causing major vehicle damage. Needs urgent repair!"
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "danger":
      return "#E63946";
    case "medium":
      return "#F4A261";
    case "low":
      return "#2A9D8F";
    default:
      return lightTheme.colors.primary;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "in progress":
      return "#1D4ED8";
    case "fixed":
      return "#22C55E";
    case "rejected":
      return "#6B7280";
    default:
      return lightTheme.colors.textSecondary;
  }
};

const HomeScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredPotholes, setFilteredPotholes] = useState<Pothole[]>(potholes);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = potholes.filter((pothole) =>
      pothole.location.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPotholes(filtered);
  };

  return (
    <PaperProvider theme={lightTheme}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Pothole Reports</Text>
        </View>

        <Searchbar
          placeholder="Search pothole reports..."
          placeholderTextColor={lightTheme.colors.placeholder}
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />

        <FlatList
          data={filteredPotholes}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <MotiView
              from={{ opacity: 0, translateY: 50 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "spring", delay: index * 100 }}
              style={styles.card}
            >
              <View style={styles.userInfo}>
                <Avatar.Image size={40} source={item.profilePic} />
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{item.reportedBy}</Text>
                  <Text style={styles.date}>{item.date}</Text>
                </View>
              </View>
              <Text style={styles.location}>{item.location}</Text>
              <View style={styles.contentRow}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: item.coordinates?.latitude || 0,
                    longitude: item.coordinates?.longitude || 0,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  {item.coordinates && (
                    <Marker coordinate={item.coordinates} title="Pothole Location" />
                  )}
                </MapView>
                <View style={styles.imageContainer}>
                  {item.images.map((img, index) => (
                    <MotiImage
                      key={index}
                      source={img}
                      style={styles.image}
                      from={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "timing", duration: 500 }}
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.description}>{item.description}</Text>
              <View style={styles.tagsContainer}>
                <Chip
                  style={[styles.chip, { backgroundColor: getSeverityColor(item.severity) }]}
                  textStyle={{ color: "white" }}
                >
                  {item.severity}
                </Chip>
                <Chip
                  style={[styles.chip, { backgroundColor: getStatusColor(item.status) }]}
                  textStyle={{ color: "white" }}
                >
                  {item.status}
                </Chip>
              </View>
            </MotiView>
          )}
        />
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: lightTheme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: lightTheme.colors.primary,
  },
  searchBar: {
    marginBottom: 16,
    borderRadius: 10,
  },
  card: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userDetails: {
    marginLeft: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: lightTheme.colors.text,
  },
  date: {
    fontSize: 12,
    color: lightTheme.colors.textSecondary,
  },
  location: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#5A67D8",
    marginTop: 5,
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  map: {
    flex: 1,
    height: 150,
    borderRadius: 10,
  },
  imageContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginLeft: 10,
  },
  image: {
    width: 100,
    height: 70,
    borderRadius: 10,
  },
  description: {
    fontSize: 14,
    marginTop: 10,
  },
  tagsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  chip: {
    alignSelf: "flex-start",
  },
  fab: {
    position: "absolute",
    marginBottom: 50,
    marginHorizontal: 20,
    right: 0,
    bottom: 0,
    backgroundColor: lightTheme.colors.primary,
  },
});

export default HomeScreen;