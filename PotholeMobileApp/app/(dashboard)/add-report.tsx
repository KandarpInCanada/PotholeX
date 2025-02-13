import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Pressable,
  ActionSheetIOS,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { Button, TextInput, Chip, PaperProvider } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import MapView, { Marker } from "react-native-maps";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { lightTheme } from "../theme";
import { MotiView } from "moti";
import * as Location from 'expo-location';

export default function AddReportScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [severity, setSeverity] = useState<"Low" | "Medium" | "Danger">("Medium");
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: 44.6488,
    longitude: -63.5752,
  });
  const [pressed, setPressed] = useState(false);
  const [isLocationLoaded, setIsLocationLoaded] = useState(false);
  const mapRef = useRef<MapView>(null); // Ref for the MapView

  // Fetch the user's current location
  const fetchLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const newLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setLocation(newLocation);
    setIsLocationLoaded(true);

    // Focus the map on the new location
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...newLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  // Automatically fetch location when the component mounts
  useEffect(() => {
    fetchLocation();
  }, []);

  // Reset animations or state when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setPressed(false); // Example: Reset button press animation
    }, [])
  );

  // Function to handle image selection (camera or gallery)
  const handleImagePicker = async () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library"],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await takePhoto();
          } else if (buttonIndex === 2) {
            await pickImage();
          }
        }
      );
    } else {
      Alert.alert(
        "Select Image",
        "Choose an option",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Take Photo", onPress: () => takePhoto() },
          { text: "Choose from Library", onPress: () => pickImage() },
        ],
        { cancelable: true }
      );
    }
  };

  // Function to launch the camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  // Function to pick an image from the gallery
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

  const setSeverityLevel = (level: "Low" | "Medium" | "Danger") => {
    setSeverity(level);
  };

  const submitReport = () => {
    if (!image || !description) {
      alert("Please add an image and description.");
      return;
    }
    alert("Pothole report submitted successfully!");
    router.replace("/dashboard/home");
  };

  return (
    <PaperProvider theme={lightTheme}>
      <SafeAreaView style={styles.safeArea}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <MotiView
              from={{ opacity: 0, translateY: 50 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "spring", damping: 10 }}
              style={styles.container}
            >
              <View style={styles.header}>
                <Text style={styles.title}>Report a Pothole</Text>
              </View>

              {/* Image Picker with Action Sheet */}
              <TouchableOpacity style={styles.imagePicker} onPress={handleImagePicker}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.image} />
                ) : (
                  <Text style={styles.imagePlaceholder}>Tap to select an image</Text>
                )}
              </TouchableOpacity>

              <TextInput
                label="Description"
                mode="outlined"
                placeholder="Describe the pothole..."
                value={description}
                onChangeText={setDescription}
                multiline
                style={styles.input}
                theme={{ colors: { primary: lightTheme.colors.primary } }}
              />

              <View style={styles.severityContainer}>
                <Text style={styles.label}>Severity Level:</Text>
                <View style={styles.chipContainer}>
                  {["Low", "Medium", "Danger"].map((level) => (
                    <MotiView
                      key={level}
                      from={{ scale: 1 }}
                      animate={{ scale: severity === level ? 1.1 : 1 }}
                      transition={{ type: "spring" }}
                      style={{ marginHorizontal: 5 }}
                    >
                      <Chip
                        selected={severity === level}
                        onPress={() => setSeverityLevel(level as "Low" | "Medium" | "Danger")}
                        style={[
                          styles.chip,
                          { backgroundColor: severity === level ? lightTheme.colors.primary : "#ccc" },
                        ]}
                        textStyle={{ color: severity === level ? "#fff" : "#000" }}
                      >
                        {level}
                      </Chip>
                    </MotiView>
                  ))}
                </View>
              </View>

              {/* Map for Location Pinning */}
              <View style={styles.mapContainer}>
                <MapView
                  ref={mapRef}
                  style={styles.map}
                  initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  onPress={(e) => {
                    setLocation(e.nativeEvent.coordinate);
                    if (mapRef.current) {
                      mapRef.current.animateToRegion({
                        ...e.nativeEvent.coordinate,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      });
                    }
                  }}
                >
                  <Marker coordinate={location} title="Pinned Location" />
                </MapView>
                {/* Recenter Button */}
                <TouchableOpacity style={styles.recenterButton} onPress={fetchLocation}>
                  <Text style={styles.recenterButtonText}>📍</Text>
                </TouchableOpacity>
              </View>

              {/* Submit Button with Press Animation */}
              <Pressable
                onPressIn={() => setPressed(true)}
                onPressOut={() => setPressed(false)}
                onPress={submitReport}
              >
                <MotiView animate={{ scale: pressed ? 0.95 : 1 }} transition={{ type: "spring" }}>
                  <Button
                    mode="contained"
                    style={styles.submitButton}
                    labelStyle={{ color: lightTheme.colors.buttonText }}
                    buttonColor={lightTheme.colors.buttonBackground}
                  >
                    Submit Report
                  </Button>
                </MotiView>
              </Pressable>
            </MotiView>
          </ScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: lightTheme.colors.primary,
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
    backgroundColor: lightTheme.colors.surface,
  },
  severityContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: lightTheme.colors.text,
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
  mapContainer: {
    position: "relative",
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  map: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  recenterButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    elevation: 3,
  },
  recenterButtonText: {
    fontSize: 20,
  },
  submitButton: {
    paddingVertical: 8,
    borderRadius: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 10,
  },
});