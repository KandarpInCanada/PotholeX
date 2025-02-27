"use client"

import { useState, useCallback } from "react"
import { View, Text, StyleSheet, Image, FlatList, Alert } from "react-native"
import { Chip, Card, Searchbar, IconButton, Button, Dialog, Portal } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { lightTheme } from "../theme"
import { MaterialCommunityIcons } from "@expo/vector-icons"

interface Report {
  id: string
  image: any
  description: string
  status: "Fixed" | "In Progress" | "Rejected" | "Pending"
  location: string
  date: string
}

const sampleReports: Report[] = [
  {
    id: "1",
    image: require("../assets/hole-1.jpeg"),
    description: "Large pothole on Main Street.",
    status: "In Progress",
    location: "Halifax, Nova Scotia",
    date: "2023-05-15",
  },
  {
    id: "2",
    image: require("../assets/hole-2.jpeg"),
    description: "Deep pothole causing car damage.",
    status: "Fixed",
    location: "Toronto, Ontario",
    date: "2023-05-10",
  },
  {
    id: "3",
    image: require("../assets/hole-2.jpeg"),
    description: "Dangerous pothole near school area.",
    status: "Rejected",
    location: "Vancouver, British Columbia",
    date: "2023-05-05",
  },
  {
    id: "4",
    image: require("../assets/hole-1.jpeg"),
    description: "Small pothole on residential street.",
    status: "Pending",
    location: "Montreal, Quebec",
    date: "2023-05-20",
  },
]

export default function ReportList() {
  const [reports, setReports] = useState<Report[]>(sampleReports)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isDialogVisible, setIsDialogVisible] = useState(false)

  const filteredReports = reports.filter(
    (report) =>
      report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSearch = (query: string) => setSearchQuery(query)

  const handleRevertReport = useCallback((report: Report) => {
    setSelectedReport(report)
    setIsDialogVisible(true)
  }, [])

  const confirmRevert = useCallback(() => {
    if (selectedReport) {
      setReports((prevReports) => prevReports.filter((report) => report.id !== selectedReport.id))
      Alert.alert("Report Reverted", "Your report has been successfully reverted.")
    }
    setIsDialogVisible(false)
  }, [selectedReport])

  const getStatusColor = (status: Report["status"]) => {
    switch (status) {
      case "Fixed":
        return "#10B981"
      case "In Progress":
        return "#F59E0B"
      case "Rejected":
        return "#EF4444"
      case "Pending":
        return "#6B7280"
      default:
        return lightTheme.colors.primary
    }
  }

  const renderReport = ({ item }: { item: Report }) => (
    <Card style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <Card.Content>
        <View style={styles.headerContainer}>
          <Text style={styles.location}>{item.location}</Text>
          <Chip style={[styles.chip, { backgroundColor: getStatusColor(item.status) }]} textStyle={styles.chipText}>
            {item.status}
          </Chip>
        </View>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.date}>Reported on: {item.date}</Text>
      </Card.Content>
      <Card.Actions>
        <Button
          icon="undo"
          mode="outlined"
          onPress={() => handleRevertReport(item)}
          disabled={item.status === "Fixed" || item.status === "Rejected"}
        >
          Revert Report
        </Button>
      </Card.Actions>
    </Card>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>My Reports</Text>
        <IconButton
          icon="filter-variant"
          size={24}
          onPress={() => {
            /* Implement filter functionality */
          }}
        />
      </View>

      <Searchbar
        placeholder="Search reports..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />

      {filteredReports.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="clipboard-text-off" size={64} color={lightTheme.colors.textSecondary} />
          <Text style={styles.noReports}>No reports found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id}
          renderItem={renderReport}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
          <Dialog.Title>Revert Report</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to revert this report? This action cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmRevert}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: lightTheme.colors.primary,
  },
  searchBar: {
    margin: 16,
    elevation: 0,
    backgroundColor: lightTheme.colors.inputBackground,
    borderWidth: 1,
    borderColor: lightTheme.colors.outline,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: lightTheme.roundness,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    fontWeight: "bold",
    color: lightTheme.colors.text,
  },
  description: {
    fontSize: 14,
    color: lightTheme.colors.textSecondary,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: lightTheme.colors.textSecondary,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noReports: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    color: lightTheme.colors.textSecondary,
  },
})

