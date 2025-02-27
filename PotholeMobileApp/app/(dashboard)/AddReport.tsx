"use client"

import { useState, useCallback, useEffect, useRef } from "react"
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
} from "react-native"
import { Button, TextInput, Chip, PaperProvider, HelperText, ActivityIndicator } from "react-native-paper"
import * as ImagePicker from "expo-image-picker"
import MapView, { Marker } from "react-native-maps"
import { useRouter, useFocusEffect } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { lightTheme } from "../theme"
import { MotiView } from "moti"
import * as Location from "expo-location"
import { MaterialCommunityIcons } from "@expo/vector-icons"

const POTHOLE_CATEGORIES = ["Surface Break", "Deep Hole", "Cracking", "Edge Damage", "Sinkhole"]

const ROAD_CONDITIONS = ["Dry", "Wet", "Snow/Ice", "Construction"]

const SEVERITY_LEVELS = [
  { label: "Low", color: "#00C851" },
  { label: "Medium", color: "#ffbb33" },
  { label: "Danger", color: "#ff4444" },
]

export default function AddReportScreen() {
  const router = useRouter()
  const [images, setImages] = useState<string[]>([])
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState("Medium")
  const [category, setCategory] = useState("")
  const [roadCondition, setRoadCondition] = useState("Dry")
  const [location, setLocation] = useState({ latitude: 44.6488, longitude: -63.5752 })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [pressed, setPressed] = useState(false)
  const mapRef = useRef<MapView>(null)

  const fetchLocation = useCallback(async () => {
    try {
      setLoading(true)
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please enable location services to accurately report pothole locations.",
        )
        return
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }
      setLocation(newLocation)

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...newLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        })
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch location. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLocation()
  }, [fetchLocation])

  useFocusEffect(
    useCallback(() => {
      setPressed(false)
    }, []),
  )

  const handleImagePicker = useCallback(async () => {
    if (images.length >= 5) {
      Alert.alert("Maximum Images", "You can only upload up to 5 images.")
      return
    }

    const options = ["Cancel", "Take Photo", "Choose from Library"]
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) await takePhoto()
          else if (buttonIndex === 2) await pickImage()
        },
      )
    } else {
      Alert.alert("Select Image", "Choose an option", [
        { text: "Cancel", style: "cancel" },
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickImage },
      ])
    }
  }, [images.length])

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera permission is required to take photos.")
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets.length > 0) {
        setImages((prev) => [...prev, result.assets[0].uri])
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo. Please try again.")
    }
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5 - images.length,
      })

      if (!result.canceled && result.assets.length > 0) {
        setImages((prev) => [...prev, ...result.assets.map((asset) => asset.uri)])
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick images. Please try again.")
    }
  }

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {}

    if (images.length === 0) {
      newErrors.images = "Please add at least one image"
    }

    if (description.length < 10) {
      newErrors.description = "Description must be at least 10 characters"
    }

    if (!category) {
      newErrors.category = "Please select a pothole category"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [images.length, description, category])

  const submitReport = useCallback(async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill in all required fields correctly.")
      return
    }

    try {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      Alert.alert("Success", "Thank you for reporting this pothole. Your report has been submitted successfully.", [
        { text: "OK", onPress: () => router.replace("/dashboard/home") },
      ])
    } catch (error) {
      Alert.alert("Error", "Failed to submit report. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [validateForm, router])

  return (
    <PaperProvider theme={lightTheme}>
      <SafeAreaView style={styles.safeArea}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <MotiView
              from={{ opacity: 0, translateY: 50 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "spring", damping: 10 }}
              style={styles.container}
            >
              <View style={styles.header}>
                <Text style={styles.title}>Report a Pothole</Text>
                {loading && <ActivityIndicator color={lightTheme.colors.primary} />}
              </View>

              {/* Image Gallery */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
                <TouchableOpacity style={styles.addImageButton} onPress={handleImagePicker}>
                  <MaterialCommunityIcons name="camera-plus" size={24} color={lightTheme.colors.primary} />
                  <Text style={styles.addImageSubtext}>
                    Add Photo{"\n"}({images.length}/5)
                  </Text>
                </TouchableOpacity>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri }} style={styles.thumbnailImage} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                      <MaterialCommunityIcons name="close-circle" size={24} color={lightTheme.colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              {errors.images && (
                <HelperText type="error" visible={true}>
                  {errors.images}
                </HelperText>
              )}

              {/* Description Input */}
              <TextInput
                label="Description"
                mode="outlined"
                placeholder="Describe the pothole size, depth, and any hazards..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                style={styles.input}
                error={!!errors.description}
              />
              {errors.description && (
                <HelperText type="error" visible={true}>
                  {errors.description}
                </HelperText>
              )}

              {/* Pothole Categories */}
              <Text style={styles.sectionTitle}>Pothole Type:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                {POTHOLE_CATEGORIES.map((cat) => (
                  <Chip
                    key={cat}
                    selected={category === cat}
                    onPress={() => setCategory(cat)}
                    style={[styles.categoryChip, category === cat && styles.selectedChip]}
                    textStyle={{
                      color: category === cat ? "#fff" : lightTheme.colors.text,
                    }}
                  >
                    {cat}
                  </Chip>
                ))}
              </ScrollView>
              {errors.category && (
                <HelperText type="error" visible={true}>
                  {errors.category}
                </HelperText>
              )}

              {/* Severity Level */}
              <Text style={styles.sectionTitle}>Severity Level:</Text>
              <View style={styles.severityContainer}>
                {SEVERITY_LEVELS.map((level) => (
                  <MotiView
                    key={level.label}
                    from={{ scale: 1 }}
                    animate={{ scale: severity === level.label ? 1.1 : 1 }}
                    transition={{ type: "spring" }}
                  >
                    <Chip
                      selected={severity === level.label}
                      onPress={() => setSeverity(level.label)}
                      style={[
                        styles.severityChip,
                        { backgroundColor: severity === level.label ? level.color : "#f0f0f0" },
                      ]}
                      textStyle={{
                        color: severity === level.label ? "#fff" : "#000",
                        fontWeight: "600",
                      }}
                    >
                      {level.label}
                    </Chip>
                  </MotiView>
                ))}
              </View>

              {/* Road Conditions */}
              <Text style={styles.sectionTitle}>Road Condition:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.conditionContainer}>
                {ROAD_CONDITIONS.map((condition) => (
                  <Chip
                    key={condition}
                    selected={roadCondition === condition}
                    onPress={() => setRoadCondition(condition)}
                    style={[styles.conditionChip, roadCondition === condition && styles.selectedChip]}
                    textStyle={{
                      color: roadCondition === condition ? "#fff" : lightTheme.colors.text,
                    }}
                  >
                    {condition}
                  </Chip>
                ))}
              </ScrollView>

              {/* Location Map */}
              <Text style={styles.sectionTitle}>Location:</Text>
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
                <TouchableOpacity style={styles.recenterButton} onPress={fetchLocation} disabled={loading}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={24} color={lightTheme.colors.primary} />
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <Pressable
                onPressIn={() => setPressed(true)}
                onPressOut={() => setPressed(false)}
                onPress={submitReport}
                disabled={loading}
              >
                <MotiView animate={{ scale: pressed ? 0.95 : 1 }} transition={{ type: "spring" }}>
                  <Button
                    mode="contained"
                    style={styles.submitButton}
                    labelStyle={styles.submitButtonLabel}
                    loading={loading}
                    disabled={loading}
                    onPress={submitReport}
                  >
                    {loading ? "Submitting..." : "Submit Report"}
                  </Button>
                </MotiView>
              </Pressable>
            </MotiView>
          </ScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  container: {
    flex: 1,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: lightTheme.colors.primary,
  },
  imageGallery: {
    flexGrow: 0,
    marginBottom: 8,
  },
  addImageButton: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: lightTheme.colors.inputBackground,
    borderRadius: lightTheme.roundness,
    marginRight: 8,
    borderWidth: 1,
    borderColor: lightTheme.colors.outline,
    borderStyle: "dashed",
  },
  addImageSubtext: {
    fontSize: 12,
    color: lightTheme.colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  imageContainer: {
    position: "relative",
    marginRight: 8,
  },
  thumbnailImage: {
    width: 100,
    height: 100,
    borderRadius: lightTheme.roundness,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "transparent",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: lightTheme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: lightTheme.colors.inputBackground,
  },
  categoryContainer: {
    flexGrow: 0,
    marginBottom: 8,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: lightTheme.colors.inputBackground,
  },
  selectedChip: {
    backgroundColor: lightTheme.colors.primary,
  },
  severityContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  severityChip: {
    minWidth: 100,
    justifyContent: "center",
  },
  conditionContainer: {
    flexGrow: 0,
    marginBottom: 16,
  },
  conditionChip: {
    marginRight: 8,
    backgroundColor: lightTheme.colors.inputBackground,
  },
  mapContainer: {
    width: "100%",
    height: 200,
    borderRadius: lightTheme.roundness,
    overflow: "hidden",
    marginBottom: 16,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  recenterButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: lightTheme.colors.surface,
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
    borderRadius: lightTheme.roundness,
    backgroundColor: lightTheme.colors.buttonBackground,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: lightTheme.colors.buttonText,
  },
})

