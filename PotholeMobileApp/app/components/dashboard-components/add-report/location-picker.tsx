"use client";

import type React from "react";
import { useCallback, useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import type { MapPressEvent } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

interface LocationPickerProps {
  initialLocation?: { latitude: number; longitude: number };
  address?: string;
  onLocationChange: (location: { latitude: number; longitude: number }) => void;
  onAddressChange?: (address: string) => void;
}

const DEFAULT_LOCATION = {
  latitude: 37.7749,
  longitude: -122.4194,
};

const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLocation,
  address = "",
  onLocationChange,
  onAddressChange,
}) => {
  const mapRef = useRef<MapView>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(initialLocation || null);

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  }>(initialLocation || DEFAULT_LOCATION);

  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState(false);
  const [displayAddress, setDisplayAddress] = useState(address);

  const fetchAddress = useCallback(
    async (location: { latitude: number; longitude: number }) => {
      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: location.latitude,
          longitude: location.longitude,
        });

        if (geocode?.[0]) {
          const { street, city, region, postalCode, country } = geocode[0];
          const formattedAddress = [street, city, region, postalCode, country]
            .filter(Boolean)
            .join(", ");

          setDisplayAddress(formattedAddress);
          onAddressChange?.(formattedAddress);
        }
      } catch (error) {
        console.error("Error fetching address:", error);
      }
    },
    [onAddressChange]
  );

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        setLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === "granted") {
          setLocationPermission(true);

          if (initialLocation) {
            // Use provided initial location
            setCurrentLocation(initialLocation);
            setSelectedLocation(initialLocation);
            if (!address) fetchAddress(initialLocation);
          } else {
            // Fetch current location
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            });
            const newLocation = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };

            setCurrentLocation(newLocation);
            setSelectedLocation(newLocation);
            onLocationChange(newLocation);
            fetchAddress(newLocation);
          }
        }
      } catch (error) {
        console.error("Error initializing location:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeLocation();
  }, [initialLocation, address]);

  const handleMapPress = useCallback(
    (e: MapPressEvent) => {
      const newLocation = e.nativeEvent.coordinate;
      setSelectedLocation(newLocation);
      onLocationChange(newLocation);
      fetchAddress(newLocation);

      // Center map on selected location
      mapRef.current?.animateToRegion(
        {
          ...newLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    },
    [onLocationChange, fetchAddress]
  );

  const handleRecenter = useCallback(async () => {
    if (!locationPermission) return;

    setLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(newLocation);
      setSelectedLocation(newLocation);
      onLocationChange(newLocation);
      fetchAddress(newLocation);

      mapRef.current?.animateToRegion(
        {
          ...newLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    } catch (error) {
      console.error("Error recentering:", error);
    } finally {
      setLoading(false);
    }
  }, [locationPermission, onLocationChange, fetchAddress]);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      )}

      <Text style={styles.address} numberOfLines={2}>
        {displayAddress || "Tap on map to select location"}
      </Text>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          onPress={handleMapPress}
          onMapReady={() => setMapReady(true)}
          showsUserLocation={locationPermission}
          showsMyLocationButton={false}
          initialRegion={{
            ...currentLocation,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              draggable
              onDragEnd={(e) => {
                const newLocation = e.nativeEvent.coordinate;
                setSelectedLocation(newLocation);
                onLocationChange(newLocation);
                fetchAddress(newLocation);
              }}
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutText}>{displayAddress}</Text>
                </View>
              </Callout>
            </Marker>
          )}
        </MapView>

        <TouchableOpacity
          style={styles.recenterButton}
          onPress={handleRecenter}
          disabled={!locationPermission}
        >
          <MaterialIcons name="my-location" size={24} color="#007BFF" />
        </TouchableOpacity>
      </View>

      {!locationPermission && (
        <Text style={styles.permissionText}>
          Location permission required to access your current position
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  mapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    height: 400,
    margin: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  address: {
    fontSize: 14,
    margin: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: "white",
    borderRadius: 8,
    textAlign: "center",
    color: "#666",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  recenterButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "white",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  callout: {
    maxWidth: 200,
    padding: 8,
  },
  calloutText: {
    fontSize: 14,
    color: "#444",
  },
  permissionText: {
    textAlign: "center",
    color: "#ff4444",
    margin: 16,
    marginTop: 8,
    fontSize: 12,
  },
});

export default LocationPicker;
