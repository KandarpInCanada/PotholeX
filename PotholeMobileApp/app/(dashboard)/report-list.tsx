import React, { useState } from "react";
import {
View,
Text,
StyleSheet,
Image,
TouchableOpacity,
Keyboard,
TouchableWithoutFeedback,
} from "react-native";
import { Button, TextInput, Chip } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import MapView, { Marker } from "react-native-maps";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddReportScreen() {
const router = useRouter();
const [image, setImage] = useState<string | null>(null);
const [description, setDescription] = useState<string>("");
const [severity, setSeverity] = useState<"Low" | "Medium" | "Danger">("Medium");
const [location, setLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: 44.6488,
    longitude: -63.5752,
});

// Handle Image Selection
const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
    setImage(result.assets[0].uri);
    }
};

// Handle Severity Selection
const setSeverityLevel = (level: "Low" | "Medium" | "Danger") => {
    setSeverity(level);
};

// Handle Report Submission
const submitReport = () => {
    if (!image || !description) {
    alert("Please add an image and description.");
    return;
    }
    alert("Pothole report submitted successfully!");
    router.replace("/dashboard/home");
};

return (
    <SafeAreaView style={styles.safeArea}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
        <Text style={styles.title}>Report a Pothole</Text>

        {/* Image Selection */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
            <Image source={{ uri: image }} style={styles.image} />
            ) : (
            <Text style={styles.imagePlaceholder}>Tap to select an image</Text>
            )}
        </TouchableOpacity>

        {/* Description Input */}
        <TextInput
            label="Description"
            mode="outlined"
            placeholder="Describe the pothole..."
            value={description}
            onChangeText={setDescription}
            multiline
            style={styles.input}
        />

        {/* Severity Selection */}
        <View style={styles.severityContainer}>
            <Text style={styles.label}>Severity Level:</Text>
            <View style={styles.chipContainer}>
            {["Low", "Medium", "Danger"].map((level) => (
                <Chip
                key={level}
                selected={severity === level}
                onPress={() => setSeverityLevel(level as "Low" | "Medium" | "Danger")}
                style={[
                    styles.chip,
                    { backgroundColor: severity === level ? "#007AFF" : "#ccc" },
                ]}
                textStyle={{ color: severity === level ? "#fff" : "#000" }}
                >
                {level}
                </Chip>
            ))}
            </View>
        </View>

        {/* Map for Location Pinning */}
        <MapView
            style={styles.map}
            initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
            }}
            onPress={(e) => setLocation(e.nativeEvent.coordinate)}
        >
            <Marker coordinate={location} title="Pinned Location" />
        </MapView>

        {/* Submit Button */}
        <Button mode="contained" onPress={submitReport} style={styles.submitButton}>
            Submit Report
        </Button>
        </View>
    </TouchableWithoutFeedback>
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
safeArea: {
    flex: 1,
    backgroundColor: "#fff",
},
container: {
    flex: 1,
    padding: 20,
},
title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
},
imagePicker: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 10,
    marginBottom: 15,
},
image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
},
imagePlaceholder: {
    fontSize: 16,
    color: "#666",
},
input: {
    marginBottom: 15,
    backgroundColor: "#fff",
},
severityContainer: {
    marginBottom: 15,
},
label: {
    fontSize: 16,
    fontWeight: "bold",
},
chipContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 5,
},
chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
},
map: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
},
submitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    borderRadius: 10,
},
backButton: {
    marginTop: 10,
},
});