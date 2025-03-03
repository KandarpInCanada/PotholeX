"use client";

import React, { useCallback, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import type { MapPressEvent } from "react-native-maps";
import * as Location from "expo-location";

interface LocationPickerProps {
  initialLocation?: { latitude: number; longitude: number };
  address?: string;
  onLocationChange: (location: { latitude: number; longitude: number }) => void;
  onAddressChange?: (address: string) => void;
}

const DEFAULT_LOCATION = {
  latitude: 37.7749,
  longitude: -122.4194,
}; // San Francisco as fallback

const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLocation,
  address = "",
  onLocationChange,
  onAddressChange,
}) => {
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

  // Request location permission and get current location on mount
  useEffect(() => {
    const getLocationPermission = async () => {
      try {
        setLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === "granted") {
          setLocationPermission(true);
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          setCurrentLocation(newLocation);

          // If no initial location was provided, also set as selected
          if (!initialLocation) {
            setSelectedLocation(newLocation);
            onLocationChange(newLocation);

            // Get address for the current location
            if (onAddressChange) {
              fetchAddress(newLocation);
            }
          }
        }
      } catch (error) {
        console.error("Error getting location:", error);
      } finally {
        setLoading(false);
      }
    };

    getLocationPermission();
  }, [initialLocation, onLocationChange, onAddressChange]);

  // Fetch address from coordinates
  const fetchAddress = async (location: {
    latitude: number;
    longitude: number;
  }) => {
    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (geocode && geocode.length > 0) {
        const { street, city, region, postalCode, country } = geocode[0];
        const formattedAddress = [street, city, region, postalCode, country]
          .filter(Boolean)
          .join(", ");

        setDisplayAddress(formattedAddress);
        if (onAddressChange) {
          onAddressChange(formattedAddress);
        }
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const handleMapPress = useCallback(
    (e: MapPressEvent) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      const newLocation = { latitude, longitude };
      setSelectedLocation(newLocation);

      // Immediately update parent component with new coordinates
      onLocationChange(newLocation);

      // Get address for the selected location
      if (onAddressChange) {
        fetchAddress(newLocation);
      }
    },
    [onLocationChange, onAddressChange]
  );

  const handleRecenter = useCallback(async () => {
    if (locationPermission) {
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

        if (onAddressChange) {
          fetchAddress(newLocation);
        }
      } catch (error) {
        console.error("Error getting current location:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [locationPermission, onLocationChange, onAddressChange]);

  const onMapReady = useCallback(() => {
    setMapReady(true);
  }, []);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      )}

      <Text style={styles.address}>
        {displayAddress || "Select a location on the map"}
      </Text>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          onPress={handleMapPress}
          onMapReady={onMapReady}
          showsUserLocation={locationPermission}
          showsMyLocationButton={false}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          region={
            !mapReady
              ? {
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }
              : undefined
          }
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              draggable
              onDragEnd={(e) => {
                const newLocation = e.nativeEvent.coordinate;
                setSelectedLocation(newLocation);
                onLocationChange(newLocation);
                if (onAddressChange) fetchAddress(newLocation);
              }}
            >
              <Callout>
                <Text>Selected Location</Text>
                {displayAddress ? (
                  <Text style={styles.calloutText}>{displayAddress}</Text>
                ) : null}
              </Callout>
            </Marker>
          )}
        </MapView>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleRecenter}
          disabled={loading || !locationPermission}
        >
          <Text style={styles.buttonText}>Use Current Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            (!selectedLocation || loading) && styles.disabledButton,
          ]}
          onPress={() => {
            if (selectedLocation) {
              onLocationChange(selectedLocation);
            }
          }}
          disabled={!selectedLocation || loading}
        >
          <Text style={styles.buttonText}>Confirm Selection</Text>
        </TouchableOpacity>
      </View>

      {!locationPermission && (
        <Text style={styles.permissionText}>
          Location permission denied. Please enable location services to use
          your current location.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  mapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  address: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    flex: 0.48,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  calloutText: {
    fontSize: 12,
    maxWidth: 150,
  },
  permissionText: {
    color: "#ff3b30",
    textAlign: "center",
    marginTop: 8,
    fontSize: 12,
  },
});

export default LocationPicker;
