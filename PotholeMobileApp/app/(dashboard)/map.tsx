import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity, Text } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function MapScreen() {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [destination, setDestination] = useState<string>("");
    const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
    const [potholes, setPotholes] = useState<{ latitude: number; longitude: number }[]>([]);
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        fetchLocation();
    }, []);

    // Fetch the user's current location and nearby potholes
    const fetchLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            alert("Permission to access location was denied");
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const newLocation = { latitude: location.coords.latitude, longitude: location.coords.longitude };
        setLocation(newLocation);

        // Move the map to the user's current location
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                ...newLocation,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
        }

        // Generate fake potholes near user
        setPotholes([
            { latitude: newLocation.latitude + 0.001, longitude: newLocation.longitude + 0.001 },
            { latitude: newLocation.latitude - 0.0015, longitude: newLocation.longitude + 0.002 },
            { latitude: newLocation.latitude + 0.002, longitude: newLocation.longitude - 0.001 },
        ]);
    };

    // Fetch Route from OSRM API
    const fetchRoute = async () => {
        if (!location || !destination) {
            alert("Please enter a destination.");
            return;
        }

        try {
            // Geocode the destination
            const geocodeResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`
            );
            const geocodeData = await geocodeResponse.json();
            if (!geocodeData || geocodeData.length === 0) {
                alert("Could not find the destination.");
                return;
            }

            const destinationLocation = {
                latitude: parseFloat(geocodeData[0].lat),
                longitude: parseFloat(geocodeData[0].lon),
            };

            // Fetch the route using OSRM
            const osrmResponse = await fetch(
                `http://router.project-osrm.org/route/v1/driving/${location.longitude},${location.latitude};${destinationLocation.longitude},${destinationLocation.latitude}?overview=full&geometries=geojson`
            );
            const osrmData = await osrmResponse.json();

            // Handle missing route data
            if (!osrmData || osrmData.code !== "Ok" || !osrmData.routes || osrmData.routes.length === 0) {
                alert("Could not fetch the route. Please try again.");
                return;
            }

            // Extract route coordinates
            const coordinates = osrmData.routes[0]?.geometry?.coordinates?.map(
                (coord: [number, number]) => ({
                    latitude: coord[1],
                    longitude: coord[0],
                })
            );

            if (!coordinates || coordinates.length === 0) {
                alert("Could not process the route data.");
                return;
            }

            setRouteCoordinates(coordinates);

            // Focus the map on the route
            if (mapRef.current) {
                mapRef.current.fitToCoordinates(coordinates, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                });
            }
        } catch (error) {
            console.error("Error fetching route:", error);
            alert("An error occurred while fetching the route.");
        }
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.container}>
                {/* Map View */}
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: location?.latitude || 44.6488,
                        longitude: location?.longitude || -63.5752,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    showsUserLocation={true}
                    followsUserLocation={true}
                >
                    {/* Current Location Marker */}
                    {location && <Marker coordinate={location} title="Your Location" pinColor="#007AFF" />}

                    {/* Nearby Potholes */}
                    {potholes.map((pothole, index) => (
                        <Marker
                            key={index}
                            coordinate={pothole}
                            title="Pothole Detected"
                            pinColor="red"
                        />
                    ))}

                    {/* Route Polyline */}
                    {routeCoordinates.length > 0 && (
                        <Polyline coordinates={routeCoordinates} strokeColor="#007AFF" strokeWidth={4} />
                    )}
                </MapView>

                {/* Destination Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter destination"
                        value={destination}
                        onChangeText={setDestination}
                    />
                    <TouchableOpacity style={styles.button} onPress={fetchRoute}>
                        <Text style={styles.buttonText}>Get Route</Text>
                    </TouchableOpacity>
                </View>

                {/* Recenter Button */}
                <TouchableOpacity style={styles.recenterButton} onPress={fetchLocation}>
                    <Ionicons name="locate" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        flex: 1,
    },
    map: {
        width: "100%",
        height: "100%",
    },
    inputContainer: {
        position: "absolute",
        top: 20,
        left: 20,
        right: 20,
        backgroundColor: "white",
        borderRadius: 10,
        padding: 10,
        flexDirection: "row",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    button: {
        marginLeft: 10,
        backgroundColor: "#007AFF",
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
    recenterButton: {
        position: "absolute",
        bottom: 80,
        right: 20,
        backgroundColor: "#007AFF",
        borderRadius: 50,
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
    },
});