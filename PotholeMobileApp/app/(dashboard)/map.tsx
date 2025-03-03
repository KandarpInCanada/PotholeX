"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, {
  Marker,
  Polyline,
  type Region,
  Callout,
} from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { lightTheme } from "../theme";
import { getAllReports } from "../services/report-service";
import type { PotholeReport } from "../../lib/supabase";

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
}

const DEFAULT_LOCATION = {
  latitude: 37.7749, // San Francisco
  longitude: -122.4194,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function MapScreen() {
  const [state, setState] = useState<MapScreenState>({
    location: null,
    destination: "",
    routeCoordinates: [],
    potholes: [],
    isLoading: true,
    isRouteFetching: false,
    errorMessage: null,
  });

  const mapRef = useRef<MapView | null>(null);

  // Destructure state for convenience
  const {
    location,
    destination,
    routeCoordinates,
    potholes,
    isLoading,
    isRouteFetching,
    errorMessage,
  } = state;

  // Initialize map data on component mount
  useEffect(() => {
    initMapData();
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
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  // Handle destination input change
  const handleDestinationChange = (text: string) => {
    setState((prev) => ({ ...prev, destination: text }));
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
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          destination
        )}&limit=1`
      );

      const geocodeData = await geocodeResponse.json();

      if (!geocodeData || geocodeData.length === 0) {
        setState((prev) => ({
          ...prev,
          isRouteFetching: false,
          errorMessage: "Destination not found",
        }));
        return;
      }

      const destinationLocation = {
        latitude: Number.parseFloat(geocodeData[0].lat),
        longitude: Number.parseFloat(geocodeData[0].lon),
      };

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
        setState((prev) => ({
          ...prev,
          isRouteFetching: false,
          errorMessage: "Route calculation failed",
        }));
        return;
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
      setState((prev) => ({
        ...prev,
        isRouteFetching: false,
        errorMessage: "Failed to calculate route",
      }));
      console.error("Route fetch error:", error);
    }
  };

  // Get marker color based on pothole severity
  const getPotholeMarkerColor = (severity: string) => {
    switch (severity) {
      case "Danger":
        return lightTheme.colors.error;
      case "Medium":
        return "#F59E0B"; // Amber
      default:
        return lightTheme.colors.success;
    }
  };

  // Clear the current route
  const clearRoute = () => {
    setState((prev) => ({
      ...prev,
      routeCoordinates: [],
      destination: "",
    }));
  };

  // Memoized render function for pothole markers to optimize rendering
  const renderPotholeMarkers = useCallback(() => {
    return potholes.map((pothole, index) => (
      <Marker
        key={`pothole-${pothole.id || index}`}
        coordinate={{
          latitude: pothole.latitude,
          longitude: pothole.longitude,
        }}
        pinColor={getPotholeMarkerColor(pothole.severity)}
      >
        <Callout>
          <View style={styles.callout}>
            <Text style={styles.calloutTitle}>{pothole.category}</Text>
            <Text style={styles.calloutDescription}>{pothole.description}</Text>
            <Text style={styles.calloutSeverity}>
              Severity: {pothole.severity}
            </Text>
          </View>
        </Callout>
      </Marker>
    ));
  }, [potholes]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["right", "left"]}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={DEFAULT_LOCATION}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          showsTraffic={false}
          loadingEnabled
        >
          {location && (
            <Marker
              coordinate={location}
              title="Your Location"
              pinColor={lightTheme.colors.primary}
            />
          )}

          {renderPotholeMarkers()}

          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={lightTheme.colors.primary}
              strokeWidth={4}
              lineDashPattern={[0]}
            />
          )}
        </MapView>

        {/* Search Bar and Navigation Controls */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter destination"
            placeholderTextColor={lightTheme.colors.placeholder}
            value={destination}
            onChangeText={handleDestinationChange}
            returnKeyType="search"
            onSubmitEditing={fetchRoute}
            editable={!isRouteFetching}
          />
          {destination.length > 0 && !isRouteFetching && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setState((prev) => ({ ...prev, destination: "" }))}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={lightTheme.colors.text}
              />
            </TouchableOpacity>
          )}
          {isRouteFetching ? (
            <ActivityIndicator
              size="small"
              color={lightTheme.colors.primary}
              style={styles.routeButton}
            />
          ) : (
            <TouchableOpacity
              style={[styles.routeButton]}
              onPress={fetchRoute}
              disabled={!location || !destination.trim()}
            >
              <Text style={styles.buttonText}>Route</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={fetchUserLocation}
          >
            <Ionicons
              name="locate"
              size={22}
              color={lightTheme.colors.background}
            />
          </TouchableOpacity>

          {routeCoordinates.length > 0 && (
            <TouchableOpacity style={styles.actionButton} onPress={clearRoute}>
              <MaterialIcons
                name="clear"
                size={22}
                color={lightTheme.colors.background}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={lightTheme.colors.primary} />
          </View>
        )}

        {/* Error Message */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() =>
                setState((prev) => ({ ...prev, errorMessage: null }))
              }
            >
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  inputContainer: {
    position: "absolute",
    top: 10,
    left: 15,
    right: 15,
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.roundness,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
    shadowColor: lightTheme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginTop: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: lightTheme.colors.outline,
    borderWidth: 1,
    borderRadius: lightTheme.roundness / 2,
    paddingHorizontal: 12,
    paddingRight: 35,
    backgroundColor: lightTheme.colors.inputBackground,
    color: lightTheme.colors.text,
  },
  clearButton: {
    position: "absolute",
    right: 85,
    top: 22,
    zIndex: 1,
  },
  routeButton: {
    marginLeft: 10,
    backgroundColor: lightTheme.colors.primary,
    borderRadius: lightTheme.roundness / 2,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  buttonText: {
    color: lightTheme.colors.buttonText,
    fontWeight: "bold",
  },
  actionButtonsContainer: {
    position: "absolute",
    bottom: 30,
    right: 15,
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  actionButton: {
    backgroundColor: lightTheme.colors.primary,
    borderRadius: 30,
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: lightTheme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  errorContainer: {
    position: "absolute",
    bottom: 90,
    left: 15,
    right: 15,
    backgroundColor: "rgba(255, 59, 48, 0.9)",
    padding: 12,
    borderRadius: lightTheme.roundness,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: "white",
    flex: 1,
  },
  dismissButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dismissText: {
    color: "white",
    fontWeight: "bold",
  },
  callout: {
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 14,
    marginBottom: 5,
  },
  calloutSeverity: {
    fontSize: 12,
    fontWeight: "500",
  },
});
