"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  StatusBar,
} from "react-native";
import {
  Button,
  TextInput,
  Chip,
  HelperText,
  ActivityIndicator,
  IconButton,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import MapView, { Marker } from "react-native-maps";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const POTHOLE_CATEGORIES = [
  "Surface Break",
  "Deep Hole",
  "Cracking",
  "Edge Damage",
  "Sinkhole",
];

const ROAD_CONDITIONS = ["Dry", "Wet", "Snow/Ice", "Construction"];

const SEVERITY_LEVELS = [
  { label: "Low", color: "#10B981", icon: "alert-circle-outline" },
  { label: "Medium", color: "#F59E0B", icon: "alert-circle" },
  { label: "Danger", color: "#DC2626", icon: "alert-octagon" },
];

export default function AddReportScreen() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [category, setCategory] = useState("");
  const [roadCondition, setRoadCondition] = useState("Dry");
  const [location, setLocation] = useState({
    latitude: 44.6488,
    longitude: -63.5752,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [pressed, setPressed] = useState(false);
  const mapRef = useRef<MapView>(null);

  const fetchLocation = useCallback(async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please enable location services to accurately report pothole locations."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setLocation(newLocation);

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...newLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch location. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  useFocusEffect(
    useCallback(() => {
      setPressed(false);
    }, [])
  );

  const handleImagePicker = useCallback(async () => {
    if (images.length >= 5) {
      Alert.alert("Maximum Images", "You can only upload up to 5 images.");
      return;
    }

    const options = ["Cancel", "Take Photo", "Choose from Library"];
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) await takePhoto();
          else if (buttonIndex === 2) await pickImage();
        }
      );
    } else {
      Alert.alert("Select Image", "Choose an option", [
        { text: "Cancel", style: "cancel" },
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickImage },
      ]);
    }
  }, [images.length]);

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera permission is required to take photos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setImages((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5 - images.length,
      });

      if (!result.canceled && result.assets.length > 0) {
        setImages((prev) => [
          ...prev,
          ...result.assets.map((asset) => asset.uri),
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick images. Please try again.");
    }
  };

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};

    if (images.length === 0) {
      newErrors.images = "Please add at least one image";
    }

    if (description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!category) {
      newErrors.category = "Please select a pothole category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [images.length, description, category]);

  const submitReport = useCallback(async () => {
    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please fill in all required fields correctly."
      );
      return;
    }

    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert(
        "Success",
        "Thank you for reporting this pothole. Your report has been submitted successfully.",
        [{ text: "OK", onPress: () => router.replace("/dashboard/home") }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [validateForm, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <MotiView
            from={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 10 }}
            style={styles.container}
          >
            <View style={styles.header}>
              <IconButton
                icon="arrow-left"
                size={24}
                onPress={() => router.back()}
                style={styles.backButton}
              />
              <Text style={styles.title}>Report a Pothole</Text>
              {loading && <ActivityIndicator color="#0284c7" size={24} />}
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "60%" }]} />
              </View>
              <Text style={styles.progressText}>Step 2 of 3</Text>
            </View>

            {/* Section: Photos */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="camera"
                  size={20}
                  color="#0284c7"
                />
                <Text style={styles.sectionTitle}>Photos</Text>
                <Text style={styles.required}>*Required</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imageGallery}
              >
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={handleImagePicker}
                >
                  <MaterialCommunityIcons
                    name="camera-plus"
                    size={28}
                    color="#0284c7"
                  />
                  <Text style={styles.addImageSubtext}>
                    Add Photo{"\n"}({images.length}/5)
                  </Text>
                </TouchableOpacity>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri }} style={styles.thumbnailImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={24}
                        color="#DC2626"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              {errors.images && (
                <HelperText
                  type="error"
                  visible={true}
                  style={styles.errorText}
                >
                  {errors.images}
                </HelperText>
              )}
            </View>

            {/* Section: Description */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="text" size={20} color="#0284c7" />
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.required}>*Required</Text>
              </View>

              <TextInput
                mode="outlined"
                placeholder="Describe the pothole size, depth, and any hazards..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                style={styles.input}
                outlineStyle={styles.inputOutline}
                outlineColor={errors.description ? "#DC2626" : "#E2E8F0"}
                activeOutlineColor="#0284c7"
                error={!!errors.description}
              />
              {errors.description && (
                <HelperText
                  type="error"
                  visible={true}
                  style={styles.errorText}
                >
                  {errors.description}
                </HelperText>
              )}
            </View>

            {/* Section: Pothole Type */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="shape"
                  size={20}
                  color="#0284c7"
                />
                <Text style={styles.sectionTitle}>Pothole Type</Text>
                <Text style={styles.required}>*Required</Text>
              </View>

              <View style={styles.categoryGrid}>
                {POTHOLE_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      category === cat && styles.selectedCategoryButton,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        category === cat && styles.selectedCategoryButtonText,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.category && (
                <HelperText
                  type="error"
                  visible={true}
                  style={styles.errorText}
                >
                  {errors.category}
                </HelperText>
              )}
            </View>

            {/* Section: Severity Level */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="alert"
                  size={20}
                  color="#0284c7"
                />
                <Text style={styles.sectionTitle}>Severity Level</Text>
              </View>

              <View style={styles.severityContainer}>
                {SEVERITY_LEVELS.map((level) => (
                  <MotiView
                    key={level.label}
                    from={{ scale: 1 }}
                    animate={{ scale: severity === level.label ? 1.05 : 1 }}
                    transition={{ type: "spring" }}
                    style={styles.severityItem}
                  >
                    <TouchableOpacity
                      style={[
                        styles.severityButton,
                        { borderColor: level.color },
                        severity === level.label && {
                          backgroundColor: level.color,
                        },
                      ]}
                      onPress={() => setSeverity(level.label)}
                    >
                      <MaterialCommunityIcons
                        name={level.icon as any}
                        size={24}
                        color={
                          severity === level.label ? "#FFFFFF" : level.color
                        }
                      />
                      <Text
                        style={[
                          styles.severityText,
                          {
                            color:
                              severity === level.label ? "#FFFFFF" : "#0F172A",
                          },
                        ]}
                      >
                        {level.label}
                      </Text>
                    </TouchableOpacity>
                  </MotiView>
                ))}
              </View>
            </View>

            {/* Section: Road Condition */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="road" size={20} color="#0284c7" />
                <Text style={styles.sectionTitle}>Road Condition</Text>
              </View>

              <View style={styles.conditionContainer}>
                {ROAD_CONDITIONS.map((condition) => (
                  <TouchableOpacity
                    key={condition}
                    style={[
                      styles.conditionButton,
                      roadCondition === condition &&
                        styles.selectedConditionButton,
                    ]}
                    onPress={() => setRoadCondition(condition)}
                  >
                    <Text
                      style={[
                        styles.conditionButtonText,
                        roadCondition === condition &&
                          styles.selectedConditionButtonText,
                      ]}
                    >
                      {condition}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Section: Location */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={20}
                  color="#0284c7"
                />
                <Text style={styles.sectionTitle}>Location</Text>
              </View>

              <View style={styles.mapContainer}>
                <MapView
                  ref={mapRef}
                  style={styles.map}
                  initialRegion={{
                    ...location,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  onPress={(e) => setLocation(e.nativeEvent.coordinate)}
                >
                  <Marker
                    coordinate={location}
                    title="Pothole Location"
                    description="Drag to adjust location"
                    draggable
                    onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
                  />
                </MapView>
                <TouchableOpacity
                  style={styles.recenterButton}
                  onPress={fetchLocation}
                  disabled={loading}
                >
                  <MaterialCommunityIcons
                    name="crosshairs-gps"
                    size={24}
                    color="#0284c7"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <Pressable
              onPressIn={() => setPressed(true)}
              onPressOut={() => setPressed(false)}
              onPress={submitReport}
              disabled={loading}
            >
              <MotiView
                animate={{ scale: pressed ? 0.97 : 1 }}
                transition={{ type: "spring" }}
              >
                <Button
                  mode="contained"
                  style={styles.submitButton}
                  labelStyle={styles.submitButtonLabel}
                  loading={loading}
                  disabled={loading}
                  onPress={submitReport}
                  icon={loading ? undefined : "send"}
                >
                  {loading ? "Submitting..." : "Submit Report"}
                </Button>
              </MotiView>
            </Pressable>
          </MotiView>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  container: {
    flex: 1,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backButton: {
    margin: 0,
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F172A",
    flex: 1,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0284c7",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "right",
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginLeft: 8,
    flex: 1,
  },
  required: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
  },
  imageGallery: {
    flexGrow: 0,
    marginBottom: 8,
  },
  addImageButton: {
    width: 110,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  addImageSubtext: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
  },
  imageContainer: {
    position: "relative",
    marginRight: 12,
  },
  thumbnailImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
  },
  input: {
    backgroundColor: "#FFFFFF",
    fontSize: 15,
  },
  inputOutline: {
    borderRadius: 12,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  selectedCategoryButton: {
    backgroundColor: "#0284c7",
    borderColor: "#0284c7",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },
  selectedCategoryButtonText: {
    color: "#FFFFFF",
  },
  severityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  severityItem: {
    flex: 1,
    maxWidth: "32%",
  },
  severityButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  severityText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },
  conditionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  conditionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  selectedConditionButton: {
    backgroundColor: "#0284c7",
    borderColor: "#0284c7",
  },
  conditionButtonText: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },
  selectedConditionButtonText: {
    color: "#FFFFFF",
  },
  mapContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  recenterButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  submitButton: {
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#0284c7",
    marginTop: 8,
    marginBottom: 24,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    paddingVertical: 4,
  },
});
