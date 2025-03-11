"use client";

import { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  ActionSheetIOS,
  Platform,
  Alert,
  ScrollView,
  Text,
  StatusBar,
} from "react-native";
import { Button, ActivityIndicator, IconButton } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import * as Location from "expo-location";
import { saveReport, uploadReportImages } from "../../services/report-service";
import {
  type PotholeReport,
  ReportStatus,
  SeverityLevel,
} from "../../../lib/supabase";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../../lib/supabase";

import ImageGallery from "../../components/dashboard-components/add-report/image-gallery";
import DescriptionInput from "../../components/dashboard-components/add-report/description-input";
import CategorySelector from "../../components/dashboard-components/add-report/category-selector";
import SeveritySelector from "../../components/dashboard-components/add-report/severity-selector";
import RoadConditionSelector from "../../components/dashboard-components/add-report/road-condition-selector";
import LocationPicker from "../../components/dashboard-components/add-report/location-picker";
import SectionHeader from "../../components/dashboard-components/add-report/section-header";

export default function AddReportScreen() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<SeverityLevel>(SeverityLevel.MEDIUM);
  const [category, setCategory] = useState("");
  const [roadCondition, setRoadCondition] = useState("Dry");
  const [location, setLocation] = useState({
    latitude: 44.6488,
    longitude: -63.5752,
  });
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [pressed, setPressed] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) {
      setReportId(uuidv4());
    }
  }, [reportId]);

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
      const geocode = await Location.reverseGeocodeAsync(newLocation);
      if (geocode && geocode.length > 0) {
        const { street, city, region, postalCode, country } = geocode[0];
        const formattedAddress = `${street || ""}, ${city || ""}, ${
          region || ""
        } ${postalCode || ""}, ${country || ""}`;
        setAddress(formattedAddress);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch location. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchInitialLocation = async () => {
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
        const geocode = await Location.reverseGeocodeAsync(newLocation);
        if (geocode && geocode.length > 0) {
          const { street, city, region, postalCode, country } = geocode[0];
          const formattedAddress = `${street || ""}, ${city || ""}, ${
            region || ""
          } ${postalCode || ""}, ${country || ""}`;
          setAddress(formattedAddress);
        }
      } catch (error) {
        console.error("Error fetching location:", error);
        Alert.alert("Error", "Failed to fetch location. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialLocation();
  }, []);

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

      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser();
      if (sessionError || !user) {
        Alert.alert("Session Expired", "Please log in again to continue.", [
          {
            text: "OK",
            onPress: () => {
              router.replace("/auth/login");
            },
          },
        ]);
        return;
      }

      const safeReportId = reportId || uuidv4();
      const imageUrls = await uploadReportImages(images, safeReportId);

      const report: PotholeReport = {
        id: safeReportId,
        images: imageUrls.length > 0 ? imageUrls : images,
        location: address || "Unknown location",
        latitude: location.latitude,
        longitude: location.longitude,
        description: description || "No description provided",
        category: category || "Surface Break",
        severity: severity || SeverityLevel.MEDIUM,
        road_condition: roadCondition || "Dry",
        status: ReportStatus.SUBMITTED,
      };

      const { success, error, data } = await saveReport(report);
      if (!success || !data) {
        if (error?.includes("permission") || error?.includes("not found")) {
          Alert.alert(
            "Permission Error",
            "You don't have permission to submit this report. Please try creating a new report.",
            [
              {
                text: "Create New",
                onPress: () => {
                  setReportId(null);
                },
              },
              { text: "Cancel", style: "cancel" },
            ]
          );
        } else {
          throw new Error(error || "Failed to submit report");
        }
        return;
      }

      // Clear inputs after successful submission
      setImages([]);
      setDescription("");
      setSeverity(SeverityLevel.MEDIUM);
      setCategory("");
      setRoadCondition("Dry");
      setReportId(null);
      setErrors({});

      Alert.alert(
        "Success",
        "Thank you for reporting this pothole. Your report has been submitted successfully.",
        [
          {
            text: "OK",
            onPress: () => router.replace("(screens)/(dashboard)/home"),
          },
        ]
      );
    } catch (error: any) {
      console.error("Submit report error:", error);
      Alert.alert(
        "Error",
        "Failed to submit report. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [
    validateForm,
    reportId,
    images,
    address,
    location,
    description,
    category,
    severity,
    roadCondition,
    router,
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <MotiView
            from={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 10 }}
            style={styles.container}
          >
            <View style={styles.content}>
              <View style={styles.section}>
                <SectionHeader icon="camera" title="Photos" required />
                <ImageGallery
                  images={images}
                  onAddImage={handleImagePicker}
                  onRemoveImage={removeImage}
                  error={errors.images}
                />
              </View>

              <View style={styles.section}>
                <SectionHeader icon="text" title="Description" required />
                <DescriptionInput
                  value={description}
                  onChangeText={setDescription}
                  error={errors.description}
                />
              </View>

              <View style={styles.section}>
                <SectionHeader icon="shape" title="Pothole Type" required />
                <CategorySelector
                  selectedCategory={category}
                  onSelectCategory={setCategory}
                  error={errors.category}
                />
              </View>

              <View style={styles.section}>
                <SectionHeader icon="alert" title="Severity Level" />
                <SeveritySelector
                  selectedSeverity={severity}
                  onSelectSeverity={setSeverity}
                />
              </View>

              <View style={styles.section}>
                <SectionHeader icon="road" title="Road Condition" />
                <RoadConditionSelector
                  selectedCondition={roadCondition}
                  onSelectCondition={setRoadCondition}
                />
              </View>

              <View style={styles.section}>
                <SectionHeader icon="map-marker" title="Location" />
                <LocationPicker
                  initialLocation={location}
                  address={address}
                  onLocationChange={(newLocation) => {
                    setLocation(newLocation);
                  }}
                  onAddressChange={(newAddress) => {
                    setAddress(newAddress);
                  }}
                />
              </View>

              <View style={styles.actionButtons}>
                <Pressable
                  onPressIn={() => setPressed(true)}
                  onPressOut={() => setPressed(false)}
                  onPress={submitReport}
                  disabled={loading}
                  style={styles.submitButtonContainer}
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
                      icon="send"
                    >
                      {loading ? "Submitting..." : "Submit Report"}
                    </Button>
                  </MotiView>
                </Pressable>
              </View>
            </View>
          </MotiView>
        </TouchableWithoutFeedback>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  stickyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 100, // Ensure header is above scroll content
  },
  backButton: {
    margin: 0,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
    marginLeft: 8,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 16, // Add some padding at the top
  },
  container: {
    flex: 1,
    gap: 20,
  },
  content: {
    paddingBottom: 16,
    paddingHorizontal: 5, // Additional padding at the bottom
  },
  section: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  actionButtons: {
    marginBottom: 24,
  },
  submitButtonContainer: {
    width: "100%",
  },
  submitButton: {
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#0284c7",
    width: "100%",
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    paddingVertical: 4,
  },
});
