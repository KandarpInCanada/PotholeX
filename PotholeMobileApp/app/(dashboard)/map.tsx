import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Alert } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { lightTheme } from "../theme";

// Define types
type LocationType = {
    latitude: number;
    longitude: number;
};

type PotholeType = {
    latitude: number;
    longitude: number;
};

export default function MapScreen() {
    const [location, setLocation] = useState<LocationType | null>(null);
    const [destination, setDestination] = useState<string>("");
    const [routeCoordinates, setRouteCoordinates] = useState<LocationType[]>([]);
    const [potholes, setPotholes] = useState<PotholeType[]>([]);
    const mapRef = useRef<MapView | null>(null);

    useEffect(() => {
        fetchLocation();
    }, []);

    const fetchLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission Denied", "Location permission is required for this feature.");
                return;
            }

            const currentLocation = await Location.getCurrentPositionAsync({});
            const newLocation = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            };
            setLocation(newLocation);

            // Move map to current location
            if (mapRef.current) {
                const region: Region = {
                    ...newLocation,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                };
                mapRef.current.animateToRegion(region);
            }

            // Generate sample potholes
            const samplePotholes = [
                { latitude: newLocation.latitude + 0.001, longitude: newLocation.longitude + 0.001 },
                { latitude: newLocation.latitude - 0.0015, longitude: newLocation.longitude + 0.002 },
                { latitude: newLocation.latitude + 0.002, longitude: newLocation.longitude - 0.001 },
            ];
            setPotholes(samplePotholes);
        } catch (error) {
            Alert.alert("Error", "Failed to get current location");
            console.error(error);
        }
    };

    const fetchRoute = async () => {
        if (!location || !destination) {
            Alert.alert("Error", "Please enter a destination");
            return;
        }

        try {
            const geocodeResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`
            );
            const geocodeData = await geocodeResponse.json();
            
            if (!geocodeData || geocodeData.length === 0) {
                Alert.alert("Error", "Could not find the destination");
                return;
            }

            const destinationLocation = {
                latitude: parseFloat(geocodeData[0].lat),
                longitude: parseFloat(geocodeData[0].lon),
            };

            const osrmResponse = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${location.longitude},${location.latitude};${destinationLocation.longitude},${destinationLocation.latitude}?overview=full&geometries=geojson`
            );
            const osrmData = await osrmResponse.json();

            if (!osrmData || osrmData.code !== "Ok" || !osrmData.routes || osrmData.routes.length === 0) {
                Alert.alert("Error", "Could not fetch the route");
                return;
            }

            const coordinates = osrmData.routes[0].geometry.coordinates.map(
                (coord: [number, number]) => ({
                    latitude: coord[1],
                    longitude: coord[0],
                })
            );

            setRouteCoordinates(coordinates);

            if (mapRef.current && coordinates.length > 0) {
                mapRef.current.fitToCoordinates(coordinates, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                });
            }
        } catch (error) {
            Alert.alert("Error", "Failed to fetch route");
            console.error(error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
            <View style={styles.container}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: 37.7749, // San Francisco coordinates as default
                        longitude: -122.4194,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    showsUserLocation
                    followsUserLocation
                >
                    {location && (
                        <Marker
                            coordinate={location}
                            title="Your Location"
                            pinColor={lightTheme.colors.primary}
                        />
                    )}

                    {potholes.map((pothole, index) => (
                        <Marker
                            key={index}
                            coordinate={pothole}
                            title="Pothole Detected"
                            pinColor={lightTheme.colors.error}
                        />
                    ))}

                    {routeCoordinates.length > 0 && (
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeColor={lightTheme.colors.primary}
                            strokeWidth={4}
                        />
                    )}
                </MapView>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter destination"
                        placeholderTextColor={lightTheme.colors.placeholder}
                        value={destination}
                        onChangeText={setDestination}
                    />
                    <TouchableOpacity style={styles.button} onPress={fetchRoute}>
                        <Text style={styles.buttonText}>Get Route</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.recenterButton} onPress={fetchLocation}>
                    <Ionicons name="locate" size={24} color={lightTheme.colors.background} />
                </TouchableOpacity>
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
        left: 20,
        right: 20,
        backgroundColor: lightTheme.colors.surface,
        borderRadius: lightTheme.roundness,
        padding: 10,
        flexDirection: "row",
        alignItems: "center",
        elevation: 5,
        shadowColor: lightTheme.colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        marginTop: 70
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: lightTheme.colors.outline,
        borderWidth: 1,
        borderRadius: lightTheme.roundness / 2,
        paddingHorizontal: 10,
        backgroundColor: lightTheme.colors.inputBackground,
        color: lightTheme.colors.text,
    },
    button: {
        marginLeft: 10,
        backgroundColor: lightTheme.colors.buttonBackground,
        borderRadius: lightTheme.roundness / 2,
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    buttonText: {
        color: lightTheme.colors.buttonText,
        fontWeight: "bold",
    },
    recenterButton: {
        position: "absolute",
        bottom: 30,
        right: 20,
        backgroundColor: lightTheme.colors.primary,
        borderRadius: 50,
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: lightTheme.colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
});