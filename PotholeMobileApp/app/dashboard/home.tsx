import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Modal,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  FAB,
  Card,
  Button,
  Chip,
  Searchbar,
  Portal,
  Provider,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "../theme";
import MapView, { Marker } from "react-native-maps";

interface Pothole {
  id: string;
  images: string[];
  location: string;
  reportedBy: string;
  date: string;
  severity: string;
  status: string;
  coordinates: { latitude: number; longitude: number };
}

const potholes: Pothole[] = [
  {
    id: "1",
    images: [
      "https://source.unsplash.com/400x300/?pothole,road",
      "https://source.unsplash.com/400x300/?pothole,street",
    ],
    location: "Downtown Street, CityX",
    reportedBy: "User123",
    date: "Feb 10, 2025",
    severity: "High",
    status: "In Progress",
    coordinates: { latitude: 37.78825, longitude: -122.4324 },
  },
];

const HomeScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredPotholes, setFilteredPotholes] = useState<Pothole[]>(potholes);
  const [selectedPothole, setSelectedPothole] = useState<Pothole | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = potholes.filter((pothole) =>
      pothole.location.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPotholes(filtered);
  };

  const handleFilter = (severity: string) => {
    const filtered = severity === "All"
      ? potholes
      : potholes.filter((pothole) => pothole.severity === severity);
    setFilteredPotholes(filtered);
  };

  const handleViewDetails = (pothole: Pothole) => {
    setSelectedPothole(pothole);
    setModalVisible(true);
  };

  return (
    <Provider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>PotholeX - Report & Track</Text>
          <Searchbar
            placeholder="Search by location"
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={{ color: "#fff" }}
            iconColor="#fff"
          />
          <View style={styles.filterContainer}>
            {["All", "High", "Medium", "Low"].map((severity) => (
              <Chip
                key={severity}
                onPress={() => handleFilter(severity)}
                style={[
                  styles.chip,
                  severity === "All" && styles.selectedChip,
                ]}
                textStyle={styles.chipText}
              >
                {severity} Severity
              </Chip>
            ))}
          </View>
          <FlatList
            data={filteredPotholes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <FlatList
                  horizontal
                  data={item.images}
                  keyExtractor={(image, index) => index.toString()}
                  renderItem={({ item: image }) => (
                    <Image source={{ uri: image }} style={styles.image} />
                  )}
                />
                <Card.Content>
                  <Text style={styles.location}>{item.location}</Text>
                  <Text style={styles.details}>Reported by: {item.reportedBy}</Text>
                  <Text style={styles.details}>Date: {item.date}</Text>
                  <Text style={[styles.severityTag, getSeverityStyle(item.severity)]}>
                    {item.severity} Severity
                  </Text>
                  <Text style={[styles.statusTag, getStatusStyle(item.status)]}>
                    {item.status}
                  </Text>
                </Card.Content>
                <Card.Actions>
                  <Button
                    mode="outlined"
                    icon="map-marker"
                    onPress={() => handleViewDetails(item)}
                    style={styles.viewButton}
                  >
                    View Details
                  </Button>
                </Card.Actions>
              </Card>
            )}
          />
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={() => router.push("/report")}
            label="Report Pothole"
          />
          <Portal>
            <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)}>
              <View style={styles.modalContainer}>
                {selectedPothole && (
                  <>
                    <Text style={styles.modalTitle}>{selectedPothole.location}</Text>
                    <FlatList
                      horizontal
                      data={selectedPothole.images}
                      keyExtractor={(image, index) => index.toString()}
                      renderItem={({ item: image }) => (
                        <Image source={{ uri: image }} style={styles.modalImage} />
                      )}
                    />
                    <Text style={styles.modalText}>Reported by: {selectedPothole.reportedBy}</Text>
                    <Text style={styles.modalText}>Date: {selectedPothole.date}</Text>
                    <Text style={styles.modalText}>Severity: {selectedPothole.severity}</Text>
                    <Text style={styles.modalText}>Status: {selectedPothole.status}</Text>
                    <MapView
                      style={styles.map}
                      initialRegion={{
                        latitude: selectedPothole.coordinates.latitude,
                        longitude: selectedPothole.coordinates.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                    >
                      <Marker coordinate={selectedPothole.coordinates} title={selectedPothole.location} />
                    </MapView>
                    <Button mode="contained" onPress={() => setModalVisible(false)}>Close</Button>
                  </>
                )}
              </View>
            </Modal>
          </Portal>
        </View>
      </SafeAreaView>
    </Provider>
  );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#121212" },
    container: { flex: 1, padding: 20 },
    title: { fontSize: 22, fontWeight: "bold", color: "#42a5f5", textAlign: "center" },
    searchBar: { marginVertical: 10, backgroundColor: "#333", borderRadius: 20 },
    filterContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 10 },
    chip: { marginHorizontal: 5, backgroundColor: "#444" },
    selectedChip: { backgroundColor: "#42a5f5" },
    chipText: { color: "#fff" },
    card: { marginBottom: 15, backgroundColor: "#222", borderRadius: 10 },
    image: { width: 300, height: 180, borderRadius: 10, margin: 5 },
    location: { fontSize: 18, fontWeight: "bold", color: "#fff" },
    details: { fontSize: 14, color: "#bbb" },
    severityTag: { fontWeight: "bold", marginTop: 5 },
    tagHigh: { color: "#ff3d00" },
    tagMedium: { color: "#ff9800" },
    tagLow: { color: "#4caf50" },
    statusTag: { fontWeight: "bold", marginTop: 5 },
    statusPending: { color: "#ffeb3b" },
    statusInProgress: { color: "#03a9f4" },
    statusFixed: { color: "#8bc34a" },
    viewButton: { marginTop: 10 },
    fab: { position: "absolute", right: 20, bottom: 20, backgroundColor: "#42a5f5" },
    modalContainer: { backgroundColor: "#222", padding: 20, borderRadius: 10 },
    modalTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },
    modalImage: { width: 300, height: 180, marginBottom: 10 },
    modalText: { fontSize: 16, color: "#fff", marginBottom: 5 },
    map: { width: "100%", height: 200, marginVertical: 10 },
  });

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "High":
        return styles.tagHigh;
      case "Medium":
        return styles.tagMedium;
      case "Low":
        return styles.tagLow;
      default:
        return styles.tagLow;
    }
  };
  
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Pending":
        return styles.statusPending;
      case "In Progress":
        return styles.statusInProgress;
      case "Fixed":
        return styles.statusFixed;
      default:
        return styles.statusPending;
    }
  };

export default HomeScreen;