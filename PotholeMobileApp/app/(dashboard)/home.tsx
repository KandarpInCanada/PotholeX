"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Searchbar, FAB, Avatar } from "react-native-paper"
import { MaterialCommunityIcons } from "@expo/vector-icons"

interface Pothole {
  id: string
  images: any[]
  location: string
  reportedBy: string
  profilePic: any
  date: string
  severity: string
  status: string
  description: string
  likes: number
  comments: number
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
    description: "Large pothole causing major vehicle damage. Needs urgent repair!",
    likes: 24,
    comments: 12,
  },
  // ... add more sample data as needed
]

const SEVERITY_COLORS = {
  Danger: "#DC2626",
  Medium: "#F59E0B",
  Low: "#10B981",
}

const STATUS_COLORS = {
  "In Progress": "#2563EB",
  Fixed: "#059669",
  Rejected: "#6B7280",
}

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredPotholes, setFilteredPotholes] = useState(potholes)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const filtered = potholes.filter((pothole) => pothole.location.toLowerCase().includes(query.toLowerCase()))
    setFilteredPotholes(filtered)
  }

  const renderCard = ({ item }: { item: Pothole }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Avatar.Image size={40} source={item.profilePic} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.reportedBy}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </View>
        </View>
      </View>

      <Image source={item.images[0]} style={styles.image} />

      <View style={styles.locationContainer}>
        <MaterialCommunityIcons name="map-marker" size={16} color="#0284c7" />
        <Text style={styles.location}>{item.location}</Text>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.tagsContainer}>
        <View
          style={[
            styles.tag,
            { backgroundColor: SEVERITY_COLORS[item.severity as keyof typeof SEVERITY_COLORS] || "#6B7280" },
          ]}
        >
          <Text style={styles.tagText}>{item.severity}</Text>
        </View>
        <View
          style={[
            styles.tag,
            { backgroundColor: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || "#6B7280" },
          ]}
        >
          <Text style={styles.tagText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.interactionButton}>
          <MaterialCommunityIcons name="thumb-up-outline" size={20} color="#6B7280" />
          <Text style={styles.interactionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.interactionButton}>
          <MaterialCommunityIcons name="comment-outline" size={20} color="#6B7280" />
          <Text style={styles.interactionText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.interactionButton}>
          <MaterialCommunityIcons name="share-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Pothole Reports</Text>
      </View>

      <Searchbar
        placeholder="Search by location..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
        icon="map-search"
      />

      <FlatList
        data={filteredPotholes}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.listContainer}
      />

      <FAB icon="plus" style={styles.fab} onPress={() => console.log("Add new report")} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  date: {
    fontSize: 13,
    color: "#6B7280",
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  location: {
    fontSize: 14,
    color: "#0284c7",
    marginLeft: 4,
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#374151",
    padding: 16,
    paddingTop: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 0,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  interactionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  interactionText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#6B7280",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#0284c7",
  },
})

export default HomeScreen

