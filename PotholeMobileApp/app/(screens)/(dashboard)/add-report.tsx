"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  KeyboardAvoidingView,
} from "react-native";
import { Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import * as Location from "expo-location";
import { saveReport, uploadReportImages } from "../../services/report-service";
import { checkApiHealth } from "../../services/pothole-detection-service";
import {
  type PotholeReport,
  ReportStatus,
  SeverityLevel,
} from "../../../lib/supabase";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../../lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

// Add LinearGradient import
import { LinearGradient } from "expo-linear-gradient";

import ImageGallery from "../../components/dashboard-components/add-report/image-gallery";
import DescriptionInput from "../../components/dashboard-components/add-report/description-input";
import CategorySelector from "../../components/dashboard-components/add-report/category-selector";
import SeveritySelector from "../../components/dashboard-components/add-report/severity-selector";
import RoadConditionSelector from "../../components/dashboard-components/add-report/road-condition-selector";
import LocationPicker from "../../components/dashboard-components/add-report/location-picker";
import SectionHeader from "../../components/dashboard-components/add-report/section-header";

export default function AddReportScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // Form state
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

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [pressed, setPressed] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const [hasPotholeValidation, setHasPotholeValidation] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Animation values
  const submitScale = useSharedValue(1);
  const submitAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: submitScale.value }],
    };
  });

  // Initialize report ID
  useEffect(() => {
    if (!reportId) {
      setReportId(uuidv4());
    }
  }, [reportId]);

  // Check if the pothole detection API is available
  useEffect(() => {
    const checkApi = async () => {
      try {
        const isAvailable = await checkApiHealth();
        setApiAvailable(isAvailable);
      } catch (error) {
        console.error("Error checking API health:", error);
        setApiAvailable(false);
      }
    };

    checkApi();
  }, []);

  // Fetch location when component mounts
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

    // Add pothole validation error if API is available but no pothole detected
    if (apiAvailable && images.length > 0 && !hasPotholeValidation) {
      newErrors.images =
        "Please analyze your images to verify pothole detection";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    images.length,
    description,
    category,
    apiAvailable,
    hasPotholeValidation,
  ]);

  const submitReport = useCallback(async () => {
    if (!validateForm()) {
      // Animate button shake
      submitScale.value = withSpring(0.95, { damping: 2, stiffness: 200 });
      setTimeout(() => {
        submitScale.value = withSpring(1);
      }, 300);

      // Scroll to first error
      if (errors.images) {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } else if (errors.description) {
        scrollViewRef.current?.scrollTo({ y: 200, animated: true });
      } else if (errors.category) {
        scrollViewRef.current?.scrollTo({ y: 350, animated: true });
      }

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

      // Show success animation
      setShowSuccessAnimation(true);

      // Clear inputs after successful submission
      setTimeout(() => {
        setImages([]);
        setDescription("");
        setSeverity(SeverityLevel.MEDIUM);
        setCategory("");
        setRoadCondition("Dry");
        setReportId(null);
        setErrors({});
        setHasPotholeValidation(false);
        setShowSuccessAnimation(false);

        router.replace("(screens)/(dashboard)/home");
      }, 2000);
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
    hasPotholeValidation,
    errors,
    submitScale,
  ]);

  const handlePotholeValidationChange = useCallback((isValid: boolean) => {
    setHasPotholeValidation(isValid);
  }, []);

  // Success animation overlay
  const renderSuccessOverlay = () => {
    if (!showSuccessAnimation) return null;

    return (
      <View style={styles.successOverlay}>
        <MotiView
          from={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          style={styles.successContent}
        >
          <View style={styles.successIconContainer}>
            <MaterialCommunityIcons
              name="check-circle"
              size={80}
              color="#10B981"
            />
          </View>
          <Text style={styles.successTitle}>Report Submitted!</Text>
          <Text style={styles.successMessage}>
            Thank you for reporting this pothole. Your contribution helps make
            roads safer.
          </Text>
        </MotiView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <LinearGradient
          colors={["#374151", "#1F2937"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerBanner}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Report a Pothole</Text>
          </View>
        </LinearGradient>

        {/* Section tabs */}

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "spring", damping: 15 }}
              style={styles.content}
            >
              {apiAvailable === false && (
                <MotiView
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: "spring", damping: 15 }}
                  style={styles.apiWarning}
                >
                  <MaterialCommunityIcons
                    name="alert-outline"
                    size={20}
                    color="#92400E"
                  />
                  <Text style={styles.apiWarningText}>
                    Pothole detection service is unavailable. You can still
                    submit reports manually.
                  </Text>
                </MotiView>
              )}

              <View style={styles.section} id="photos">
                <SectionHeader icon="camera" title="Photos" required />
                <ImageGallery
                  images={images}
                  onAddImage={handleImagePicker}
                  onRemoveImage={removeImage}
                  error={errors.images}
                  onValidationChange={handlePotholeValidationChange}
                />
              </View>

              <View style={styles.section} id="description">
                <SectionHeader icon="text" title="Description" required />
                <DescriptionInput
                  value={description}
                  onChangeText={setDescription}
                  error={errors.description}
                />
              </View>

              <View style={styles.section} id="category">
                <SectionHeader icon="shape" title="Pothole Type" required />
                <CategorySelector
                  selectedCategory={category}
                  onSelectCategory={setCategory}
                  error={errors.category}
                />
              </View>

              <View style={styles.section} id="severity">
                <SectionHeader icon="alert" title="Severity Level" />
                <SeveritySelector
                  selectedSeverity={severity}
                  onSelectSeverity={setSeverity}
                />
              </View>

              <View style={styles.section} id="road">
                <SectionHeader icon="road" title="Road Condition" />
                <RoadConditionSelector
                  selectedCondition={roadCondition}
                  onSelectCondition={setRoadCondition}
                />
              </View>

              <View style={styles.section} id="location">
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
                  <Animated.View style={[submitAnimatedStyle]}>
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
                  </Animated.View>
                </Pressable>
              </View>
            </MotiView>
          </TouchableWithoutFeedback>
        </ScrollView>

        {/* Success overlay */}
        {renderSuccessOverlay()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Update form components to have curved edges
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  container: {
    flex: 1,
  },
  headerBanner: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 24, // Updated for more curved edges
    margin: 16,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  content: {
    paddingBottom: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16, // Updated for more curved edges
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
    borderRadius: 24, // Updated for more curved edges
    backgroundColor: "#374151",
    width: "100%",
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    paddingVertical: 4,
  },
  apiWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: 16, // Updated for more curved edges
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  apiWarningText: {
    color: "#92400E",
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  successContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24, // Updated for more curved edges
    padding: 24,
    alignItems: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
  },
});
