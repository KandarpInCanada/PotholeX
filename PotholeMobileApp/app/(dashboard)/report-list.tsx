import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TextInput,
} from "react-native";
import { Chip, Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { lightTheme } from "../theme"; // Import light theme

interface Report {
  id: string;
  image: any; // For static images
  description: string;
  status: "Fixed" | "In Progress" | "Rejected";
  location: string;
}

// Sample Reports Data
const sampleReports: Report[] = [
  {
    id: "1",
    image: require("../assets/hole-1.jpeg"),
    description: "Large pothole on Main Street.",
    status: "In Progress",
    location: "Halifax, Nova Scotia",
  },
  {
    id: "2",
    image: require("../assets/hole-2.jpeg"),
    description: "Deep pothole causing car damage.",
    status: "Fixed",
    location: "Toronto, Ontario",
  },
  {
    id: "3",
    image: require("../assets/hole-2.jpeg"),
    description: "Dangerous pothole near school area.",
    status: "Rejected",
    location: "Vancouver, British Columbia",
  },
];

export default function MyReportsScreen() {
  const [reports, setReports] = useState<Report[]>(sampleReports);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter reports based on search
  const filteredReports = reports.filter(
    (report) =>
      report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render each report item
  const renderReport = ({ item }: { item: Report }) => (
    <Card style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <Card.Content>
        <Text style={styles.location}>{item.location}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.statusContainer}>
          <Chip
            style={[
              styles.chip,
              item.status === "Fixed" ? styles.fixed :
              item.status === "In Progress" ? styles.inProgress :
              styles.rejected,
            ]}
            textStyle={{ color: "white" }}
          >
            {item.status}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>My Reports</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search reports..."
        placeholderTextColor={lightTheme.colors.placeholder}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {filteredReports.length === 0 ? (
        <Text style={styles.noReports}>No reports found.</Text>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id}
          renderItem={renderReport}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: lightTheme.colors.primary,
    textAlign: "left",
    marginBottom: 10,
  },
  searchBar: {
    backgroundColor: "#ECECEC",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: lightTheme.colors.surface,
    marginBottom: 15,
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  location: {
    fontSize: 14,
    fontWeight: "bold",
    color: lightTheme.colors.textSecondary,
    marginTop: 5,
  },
  description: {
    fontSize: 16,
    color: lightTheme.colors.text,
    marginVertical: 5,
  },
  statusContainer: {
    marginTop: 5,
  },
  chip: {
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  fixed: {
    backgroundColor: "green",
  },
  inProgress: {
    backgroundColor: "orange",
  },
  rejected: {
    backgroundColor: "red",
  },
  noReports: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: lightTheme.colors.textSecondary,
  },
});