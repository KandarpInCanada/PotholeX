"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import MapView, {
  Marker,
  Polyline,
  type Region,
  Callout,
  PROVIDER_GOOGLE,
  Heatmap,
} from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Button, Chip, FAB, Portal, Dialog, Divider } from "react-native-paper";
import { MotiView } from "moti";
import { BlurView } from "expo-blur";
import { getAllReports } from "../../services/report-service";
import type {
  PotholeReport,
  SeverityLevel,
  ReportStatus,
} from "../../../lib/supabase";
import { useRouter } from "expo-router";
import ReportDetailsSheet, {
  type ReportDetailsSheetRef,
} from "../../components/dashboard-components/report-details-sheet";

// Define types
interface LocationType {
  latitude: number;
  longitude: number;
}

interface MapScreenState {
  location: LocationType | null;
  destination: string;
  routeCoordinates: LocationType[];
  potholes: PotholeReport[];
  isLoading: boolean;
  isRouteFetching: boolean;
  errorMessage: string | null;
  mapType: "standard" | "satellite" | "hybrid";
  showFilters: boolean;
  activeFilters: {
    severity: SeverityLevel | "all";
    status: ReportStatus | "all";
  };
  viewMode: "markers" | "heatmap";
  showLegend: boolean;
  geocodedDestination: LocationType | null;
}

const DEFAULT_LOCATION = {
  latitude: 37.7749, // San Francisco
  longitude: -122.4194,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function MapScreen() {
  const router = useRouter();
  const [state, setState] = useState<MapScreenState>({
    location: null,
    destination: "",
    routeCoordinates: [],
    potholes: [],
    isLoading: true,
    isRouteFetching: false,
    errorMessage: null,
    mapType: "standard",
    showFilters: false,
    activeFilters: {
      severity: "all",
      status: "all",
    },
    viewMode: "markers",
    showLegend: false,
    geocodedDestination: null,
  });

  const mapRef = useRef<MapView | null>(null);
  const searchBarAnimation = useRef(new Animated.Value(0)).current;
  const fabAnimation = useRef(new Animated.Value(0)).current;
  const reportDetailsRef = useRef<ReportDetailsSheetRef>(null);

  // Destructure state for convenience
  const {
    location,
    destination,
    routeCoordinates,
    potholes,
    isLoading,
    isRouteFetching,
    errorMessage,
    mapType,
    showFilters,
    activeFilters,
    viewMode,
    showLegend,
    geocodedDestination,
  } = state;

  // Initialize map data on component mount
  useEffect(() => {
    initMapData();

    // Animate search bar and FAB on mount
    Animated.parallel([
      Animated.timing(searchBarAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fabAnimation, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Initialize map with location and pothole data
  const initMapData = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, errorMessage: null }));

      // Get location permission and current position
      await fetchUserLocation();

      // Fetch pothole data
      const reports = await getAllReports();
      setState((prev) => ({
        ...prev,
        potholes: reports,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        errorMessage: "Failed to initialize map data",
      }));
      console.error("Map initialization error:", error);
    }
  };

  // Get user's current location
  const fetchUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setState((prev) => ({
          ...prev,
          errorMessage: "Location permission denied",
        }));
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setState((prev) => ({ ...prev, location: newLocation }));

      // Move map to current location
      animateToRegion(newLocation);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        errorMessage: "Failed to get current location",
      }));
      console.error("Location fetch error:", error);
    }
  };

  // Animate map to a specific region
  const animateToRegion = (coords: LocationType, padding = 0) => {
    if (mapRef.current) {
      const region: Region = {
        ...coords,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  // Handle destination input change
  const handleDestinationChange = (text: string) => {
    setState((prev) => ({ ...prev, destination: text }));
  };

  // Geocode the destination address to coordinates
  const geocodeDestination = async (
    address: string
  ): Promise<LocationType | null> => {
    try {
      // First try with Nominatim (OpenStreetMap)
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}&limit=1`
      );

      const nominatimData = await nominatimResponse.json();

      if (nominatimData && nominatimData.length > 0) {
        return {
          latitude: Number.parseFloat(nominatimData[0].lat),
          longitude: Number.parseFloat(nominatimData[0].lon),
        };
      }

      // If Nominatim fails, try with Location.geocodeAsync
      const locations = await Location.geocodeAsync(address);

      if (locations && locations.length > 0) {
        return {
          latitude: locations[0].latitude,
          longitude: locations[0].longitude,
        };
      }

      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  // Fetch route between current location and destination
  const fetchRoute = async () => {
    if (!location) {
      Alert.alert("Error", "Current location unavailable. Please try again.");
      return;
    }

    if (!destination.trim()) {
      Alert.alert("Error", "Please enter a destination");
      return;
    }

    try {
      setState((prev) => ({
        ...prev,
        isRouteFetching: true,
        errorMessage: null,
      }));

      // Geocode destination address to coordinates
      const destinationLocation = await geocodeDestination(destination);

      if (!destinationLocation) {
        setState((prev) => ({
          ...prev,
          isRouteFetching: false,
          errorMessage:
            "Destination not found. Please try a different address.",
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        geocodedDestination: destinationLocation,
      }));

      // Get route from OSRM
      const osrmResponse = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${location.longitude},${location.latitude};${destinationLocation.longitude},${destinationLocation.latitude}?overview=full&geometries=geojson`
      );

      const osrmData = await osrmResponse.json();

      if (
        !osrmData ||
        osrmData.code !== "Ok" ||
        !osrmData.routes ||
        osrmData.routes.length === 0
      ) {
        // Try alternative route API if OSRM fails
        try {
          // Create a simple straight line route as fallback
          const straightLineRoute = createStraightLineRoute(
            location,
            destinationLocation,
            10
          );

          setState((prev) => ({
            ...prev,
            routeCoordinates: straightLineRoute,
            isRouteFetching: false,
          }));

          // Fit map to show the entire route
          if (mapRef.current && straightLineRoute.length > 0) {
            mapRef.current.fitToCoordinates([location, destinationLocation], {
              edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
              animated: true,
            });
          }

          return;
        } catch (fallbackError) {
          setState((prev) => ({
            ...prev,
            isRouteFetching: false,
            errorMessage:
              "Route calculation failed. Please try a different destination.",
          }));
          return;
        }
      }

      // Process route coordinates
      const coordinates = osrmData.routes[0].geometry.coordinates.map(
        (coord: [number, number]) => ({
          latitude: coord[1],
          longitude: coord[0],
        })
      );

      setState((prev) => ({
        ...prev,
        routeCoordinates: coordinates,
        isRouteFetching: false,
      }));

      // Fit map to show the entire route
      if (mapRef.current && coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
          animated: true,
        });
      }
    } catch (error) {
      console.error("Route fetch error:", error);

      // Create a fallback route if API fails
      if (location && geocodedDestination) {
        const straightLineRoute = createStraightLineRoute(
          location,
          geocodedDestination,
          10
        );

        setState((prev) => ({
          ...prev,
          routeCoordinates: straightLineRoute,
          isRouteFetching: false,
          errorMessage: "Using simplified route due to service limitations.",
        }));

        // Fit map to show the entire route
        if (mapRef.current) {
          mapRef.current.fitToCoordinates([location, geocodedDestination], {
            edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
            animated: true,
          });
        }
      } else {
        setState((prev) => ({
          ...prev,
          isRouteFetching: false,
          errorMessage: "Failed to calculate route. Please try again.",
        }));
      }
    }
  };

  // Create a straight line route between two points with a specified number of points
  const createStraightLineRoute = (
    start: LocationType,
    end: LocationType,
    numPoints: number
  ): LocationType[] => {
    const route: LocationType[] = [];

    for (let i = 0; i <= numPoints; i++) {
      const fraction = i / numPoints;
      route.push({
        latitude: start.latitude + (end.latitude - start.latitude) * fraction,
        longitude:
          start.longitude + (end.longitude - start.longitude) * fraction,
      });
    }

    return route;
  };

  // Get marker color based on pothole severity
  const getPotholeMarkerColor = (severity: string) => {
    switch (severity) {
      case "Danger":
        return "#F43F5E"; // Rose from our theme
      case "Medium":
        return "#F59E0B"; // Amber from our theme
      default:
        return "#14B8A6"; // Teal from our theme
    }
  };

  // Clear the current route
  const clearRoute = () => {
    setState((prev) => ({
      ...prev,
      routeCoordinates: [],
      destination: "",
      geocodedDestination: null,
      errorMessage: null,
    }));
  };

  // Toggle map type
  const toggleMapType = () => {
    setState((prev) => ({
      ...prev,
      mapType:
        prev.mapType === "standard"
          ? "satellite"
          : prev.mapType === "satellite"
          ? "hybrid"
          : "standard",
    }));
  };

  // Toggle filter dialog
  const toggleFilters = () => {
    setState((prev) => ({
      ...prev,
      showFilters: !prev.showFilters,
    }));
  };

  // Toggle view mode between markers and heatmap
  const toggleViewMode = () => {
    setState((prev) => ({
      ...prev,
      viewMode: prev.viewMode === "markers" ? "heatmap" : "markers",
    }));
  };

  // Toggle legend visibility
  const toggleLegend = () => {
    setState((prev) => ({
      ...prev,
      showLegend: !prev.showLegend,
    }));
  };

  // Update filters
  const updateFilters = (filterType: "severity" | "status", value: string) => {
    setState((prev) => ({
      ...prev,
      activeFilters: {
        ...prev.activeFilters,
        [filterType]: value,
      },
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setState((prev) => ({
      ...prev,
      activeFilters: {
        severity: "all",
        status: "all",
      },
    }));
  };

  // Navigate to report details
  const navigateToReportDetailsCallback = useCallback(
    (reportId: string) => {
      router.push(`/dashboard/report-details/${reportId}`);
    },
    [router]
  );

  // Filter potholes based on active filters
  const filteredPotholes = useMemo(() => {
    return potholes.filter((pothole) => {
      const severityMatch =
        activeFilters.severity === "all" ||
        pothole.severity === activeFilters.severity;
      const statusMatch =
        activeFilters.status === "all" ||
        pothole.status === activeFilters.status;
      return severityMatch && statusMatch;
    });
  }, [potholes, activeFilters]);

  // Prepare heatmap data
  const heatmapPoints = useMemo(() => {
    return filteredPotholes.map((pothole) => ({
      latitude: pothole.latitude,
      longitude: pothole.longitude,
      weight:
        pothole.severity === "Danger"
          ? 1
          : pothole.severity === "Medium"
          ? 0.7
          : 0.4,
    }));
  }, [filteredPotholes]);

  // Memoized render function for pothole markers to optimize rendering
  const renderPotholeMarkers = useCallback(() => {
    if (viewMode === "heatmap") return null;

    return filteredPotholes.map((pothole, index) => (
      <Marker
        key={`pothole-${pothole.id || index}`}
        coordinate={{
          latitude: pothole.latitude,
          longitude: pothole.longitude,
        }}
        pinColor={getPotholeMarkerColor(pothole.severity)}
        onCalloutPress={() =>
          pothole.id && reportDetailsRef.current?.open(pothole.id)
        }
        tracksViewChanges={false} // Add this to improve performance
      >
        <View style={styles.customMarker}>
          <View
            style={[
              styles.markerDot,
              {
                backgroundColor: getPotholeMarkerColor(pothole.severity),
              },
            ]}
          />
        </View>
        <Callout tooltip>
          <View style={styles.callout}>
            <Text style={styles.calloutTitle}>
              {pothole.category || "Unknown"}
            </Text>
            <Text style={styles.calloutDescription} numberOfLines={2}>
              {pothole.description
                ? pothole.description.length > 60
                  ? pothole.description.substring(0, 60) + "..."
                  : pothole.description
                : "No description provided"}
            </Text>
            <View style={styles.calloutFooter}>
              <View style={styles.calloutChipContainer}>
                <Chip
                  style={[
                    styles.calloutChip,
                    {
                      backgroundColor: getPotholeMarkerColor(pothole.severity),
                    },
                  ]}
                  textStyle={styles.calloutChipText}
                >
                  {pothole.severity}
                </Chip>
              </View>
              <Text style={styles.calloutTapText}>Tap for details</Text>
            </View>
          </View>
        </Callout>
      </Marker>
    ));
  }, [filteredPotholes, viewMode, navigateToReportDetailsCallback]);

  // Search bar animation styles
  const searchBarAnimatedStyle = {
    opacity: searchBarAnimation,
    transform: [
      {
        translateY: searchBarAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [-50, 0],
        }),
      },
    ],
  };

  // FAB animation styles
  const fabAnimatedStyle = {
    opacity: fabAnimation,
    transform: [
      {
        scale: fabAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        }),
      },
    ],
  };

  // Add a higher z-index to the ReportDetailsSheet reference
  return (
    <SafeAreaView style={styles.safeArea} edges={["right", "left"]}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          initialRegion={DEFAULT_LOCATION}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          showsTraffic={false}
          loadingEnabled
          mapType={mapType}
        >
          {location && (
            <Marker coordinate={location} title="Your Location">
              <View style={styles.userLocationMarker}>
                <View style={styles.userLocationDot} />
                <View style={styles.userLocationRing} />
              </View>
            </Marker>
          )}

          {geocodedDestination && (
            <Marker
              coordinate={geocodedDestination}
              title="Destination"
              pinColor="#3B82F6" // Updated to blue
            >
              <View style={styles.destinationMarker}>
                <MaterialCommunityIcons
                  name="flag-checkered"
                  size={24}
                  color="#3B82F6"
                />
              </View>
            </Marker>
          )}

          {renderPotholeMarkers()}

          {viewMode === "heatmap" && heatmapPoints.length > 0 && (
            <Heatmap
              points={heatmapPoints}
              radius={20}
              opacity={0.7}
              gradient={{
                colors: ["#14B8A6", "#F59E0B", "#F43F5E"], // Teal, Amber, Rose from our theme
                startPoints: [0.2, 0.5, 0.8],
                colorMapSize: 256,
              }}
            />
          )}

          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#3B82F6" // Updated to blue
              strokeWidth={4}
              lineDashPattern={[0]}
              lineJoin="round"
            />
          )}
        </MapView>

        {/* Search Bar */}
        <Animated.View style={[styles.inputContainer, searchBarAnimatedStyle]}>
          <BlurView intensity={80} tint="light" style={styles.blurContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter destination"
              placeholderTextColor="#94A3B8"
              value={destination}
              onChangeText={handleDestinationChange}
              returnKeyType="search"
              onSubmitEditing={fetchRoute}
              editable={!isRouteFetching}
            />
            {destination.length > 0 && !isRouteFetching && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() =>
                  setState((prev) => ({ ...prev, destination: "" }))
                }
              >
                <Ionicons name="close-circle" size={20} color="#64748B" />
              </TouchableOpacity>
            )}
            {isRouteFetching ? (
              <ActivityIndicator
                size="small"
                color="#6366F1"
                style={styles.routeButton}
              />
            ) : (
              <TouchableOpacity
                style={[
                  styles.routeButton,
                  !destination.trim() && styles.routeButtonDisabled,
                ]}
                onPress={fetchRoute}
                disabled={!location || !destination.trim()}
              >
                <MaterialIcons
                  name="directions"
                  size={20}
                  color={
                    destination.trim() ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)"
                  }
                />
              </TouchableOpacity>
            )}
          </BlurView>
        </Animated.View>

        {/* Map Controls */}
        <View style={styles.mapControlsContainer}>
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300, delay: 200 }}
          >
            <TouchableOpacity
              style={styles.mapControlButton}
              onPress={fetchUserLocation}
            >
              <MaterialIcons name="my-location" size={22} color="#3B82F6" />
            </TouchableOpacity>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300, delay: 300 }}
          >
            <TouchableOpacity
              style={styles.mapControlButton}
              onPress={toggleMapType}
            >
              <MaterialIcons
                name={
                  mapType === "standard"
                    ? "layers"
                    : mapType === "satellite"
                    ? "terrain"
                    : "map"
                }
                size={22}
                color="#3B82F6"
              />
            </TouchableOpacity>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300, delay: 400 }}
          >
            <TouchableOpacity
              style={styles.mapControlButton}
              onPress={toggleViewMode}
            >
              <MaterialCommunityIcons
                name={
                  viewMode === "markers" ? "map-marker-radius" : "map-marker"
                }
                size={22}
                color="#3B82F6"
              />
            </TouchableOpacity>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300, delay: 500 }}
          >
            <TouchableOpacity
              style={styles.mapControlButton}
              onPress={toggleFilters}
            >
              <MaterialCommunityIcons
                name="filter-variant"
                size={22}
                color={
                  activeFilters.severity !== "all" ||
                  activeFilters.status !== "all"
                    ? "#F59E0B" // Amber from our theme
                    : "#3B82F6" // Updated to blue
                }
              />
              {(activeFilters.severity !== "all" ||
                activeFilters.status !== "all") && (
                <View style={styles.filterActiveDot} />
              )}
            </TouchableOpacity>
          </MotiView>

          {routeCoordinates.length > 0 && (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 300 }}
            >
              <TouchableOpacity
                style={styles.mapControlButton}
                onPress={clearRoute}
              >
                <MaterialIcons name="close" size={22} color="#F43F5E" />
              </TouchableOpacity>
            </MotiView>
          )}
        </View>

        {/* Legend */}
        {showLegend && (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "timing", duration: 300 }}
            style={styles.legendContainer}
          >
            <BlurView intensity={80} tint="light" style={styles.legendBlur}>
              <Text style={styles.legendTitle}>Pothole Severity</Text>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#F43F5E" }]}
                />
                <Text style={styles.legendText}>Danger</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#F59E0B" }]}
                />
                <Text style={styles.legendText}>Medium</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#14B8A6" }]}
                />
                <Text style={styles.legendText}>Low</Text>
              </View>
              <TouchableOpacity
                style={styles.legendCloseButton}
                onPress={toggleLegend}
              >
                <MaterialIcons name="close" size={16} color="#64748B" />
              </TouchableOpacity>
            </BlurView>
          </MotiView>
        )}

        {/* FAB */}
        <Animated.View style={[styles.fabContainer, fabAnimatedStyle]}>
          <FAB
            icon={showLegend ? "information-off" : "information"}
            style={styles.fab}
            color="#FFFFFF"
            onPress={toggleLegend}
          />
        </Animated.View>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        )}

        {/* Error Message */}
        {errorMessage && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300 }}
            style={styles.errorContainer}
          >
            <MaterialIcons name="error-outline" size={20} color="#FFFFFF" />
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() =>
                setState((prev) => ({ ...prev, errorMessage: null }))
              }
            >
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          </MotiView>
        )}

        {/* Filter Dialog */}
        <Portal>
          <Dialog
            visible={showFilters}
            onDismiss={toggleFilters}
            style={styles.filterDialog}
          >
            <Dialog.Title style={styles.filterDialogTitle}>
              Filter Potholes
            </Dialog.Title>
            <Dialog.Content>
              <Text style={styles.filterSectionTitle}>Severity</Text>
              <View style={styles.filterChipsContainer}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    activeFilters.severity === "all" && styles.activeFilterChip,
                  ]}
                  onPress={() => updateFilters("severity", "all")}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeFilters.severity === "all" &&
                        styles.activeFilterChipText,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    activeFilters.severity === "Danger" &&
                      styles.activeFilterChip,
                    activeFilters.severity === "Danger" && {
                      backgroundColor: "#F43F5E",
                    },
                  ]}
                  onPress={() => updateFilters("severity", "Danger")}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeFilters.severity === "Danger" &&
                        styles.activeFilterChipText,
                    ]}
                  >
                    Danger
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    activeFilters.severity === "Medium" &&
                      styles.activeFilterChip,
                    activeFilters.severity === "Medium" && {
                      backgroundColor: "#F59E0B",
                    },
                  ]}
                  onPress={() => updateFilters("severity", "Medium")}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeFilters.severity === "Medium" &&
                        styles.activeFilterChipText,
                    ]}
                  >
                    Medium
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    activeFilters.severity === "Low" && styles.activeFilterChip,
                    activeFilters.severity === "Low" && {
                      backgroundColor: "#14B8A6",
                    },
                  ]}
                  onPress={() => updateFilters("severity", "Low")}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeFilters.severity === "Low" &&
                        styles.activeFilterChipText,
                    ]}
                  >
                    Low
                  </Text>
                </TouchableOpacity>
              </View>

              <Divider style={styles.filterDivider} />

              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterChipsContainer}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    activeFilters.status === "all" && styles.activeFilterChip,
                  ]}
                  onPress={() => updateFilters("status", "all")}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeFilters.status === "all" &&
                        styles.activeFilterChipText,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    activeFilters.status === "submitted" &&
                      styles.activeFilterChip,
                    activeFilters.status === "submitted" && {
                      backgroundColor: "#64748B",
                    },
                  ]}
                  onPress={() => updateFilters("status", "submitted")}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeFilters.status === "submitted" &&
                        styles.activeFilterChipText,
                    ]}
                  >
                    Submitted
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    activeFilters.status === "in_progress" &&
                      styles.activeFilterChip,
                    activeFilters.status === "in_progress" && {
                      backgroundColor: "#3B82F6",
                    },
                  ]}
                  onPress={() => updateFilters("status", "in_progress")}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeFilters.status === "in_progress" &&
                        styles.activeFilterChipText,
                    ]}
                  >
                    In Progress
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    activeFilters.status === "fixed" && styles.activeFilterChip,
                    activeFilters.status === "fixed" && {
                      backgroundColor: "#10B981",
                    },
                  ]}
                  onPress={() => updateFilters("status", "fixed")}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeFilters.status === "fixed" &&
                        styles.activeFilterChipText,
                    ]}
                  >
                    Fixed
                  </Text>
                </TouchableOpacity>
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={resetFilters} textColor="#64748B">
                Reset
              </Button>
              <Button onPress={toggleFilters} textColor="#3B82F6">
                Apply
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        {/* Make sure the ReportDetailsSheet is the last element in the return statement */}
        <ReportDetailsSheet ref={reportDetailsRef} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F4FF", // Updated to match new theme
  },
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  inputContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 16, // Increased top margin for iOS to account for Dynamic Island
    left: 16,
    right: 16,
    zIndex: 5,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 0.8)",
    backgroundColor: "rgba(255, 255, 255, 0.85)", // Add background color for better visibility
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    color: "#1E293B",
    fontSize: 16,
    fontWeight: "500",
  },
  clearButton: {
    padding: 8,
  },
  routeButton: {
    backgroundColor: "#3B82F6", // Updated to blue
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  routeButtonDisabled: {
    backgroundColor: "rgba(59, 130, 246, 0.5)", // Semi-transparent blue
  },
  mapControlsContainer: {
    position: "absolute",
    right: 16,
    top: Platform.OS === "ios" ? 130 : 90, // Increased top margin to avoid overlap with search bar
    zIndex: 5,
  },
  mapControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterActiveDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F59E0B", // Amber from our theme
  },
  fabContainer: {
    position: "absolute",
    right: 16,
    bottom: 24,
    zIndex: 5,
  },
  fab: {
    backgroundColor: "#3B82F6", // Updated to blue
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 10,
  },
  errorContainer: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: "rgba(244, 63, 94, 0.9)", // Rose from our theme
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 5,
  },
  errorText: {
    color: "white",
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  dismissButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dismissText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  callout: {
    width: 220,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    color: "#1E293B",
  },
  calloutDescription: {
    fontSize: 14,
    marginBottom: 10,
    color: "#64748B",
    lineHeight: 18,
  },
  calloutFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  calloutChipContainer: {
    flex: 1,
    marginRight: 8,
  },
  calloutChip: {
    height: 28,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    justifyContent: "center", // Add this to center text vertically
    alignItems: "center", // Add this to center content
  },
  calloutChipText: {
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
    textAlign: "center", // Add this to center text horizontally
    textAlignVertical: "center", // Add this for Android vertical alignment
    includeFontPadding: false, // Remove extra padding around text
    lineHeight: 12, // Match to fontSize for better vertical centering
  },
  calloutTapText: {
    fontSize: 12,
    color: "#64748B",
    fontStyle: "italic",
    textAlign: "right",
  },
  filterDialog: {
    backgroundColor: "white",
    borderRadius: 16,
  },
  filterDialogTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 12,
  },
  filterChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  activeFilterChip: {
    backgroundColor: "#3B82F6", // Updated to blue
    borderColor: "#3B82F6",
  },
  filterChipText: {
    fontSize: 14,
    color: "#1E293B",
  },
  activeFilterChipText: {
    color: "white",
    fontWeight: "500",
  },
  filterDivider: {
    marginVertical: 16,
    backgroundColor: "#E2E8F0",
  },
  legendContainer: {
    position: "absolute",
    left: 16,
    bottom: 24,
    zIndex: 5,
  },
  legendBlur: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 0.5)",
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: "#64748B",
  },
  legendCloseButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  customMarker: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "white",
  },
  userLocationMarker: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  userLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3B82F6", // Updated to blue
    borderWidth: 2,
    borderColor: "white",
  },
  userLocationRing: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.3)", // Semi-transparent blue
  },
  destinationMarker: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
