"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Pressable,
} from "react-native";
import { HelperText, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  detectPothole,
  type DetectionResult,
} from "../../../services/pothole-detection-service";
import DetectionResultView from "./detection-result";
import { MotiView } from "moti";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface ImageGalleryProps {
  images: string[];
  onAddImage: () => void;
  onRemoveImage: (index: number) => void;
  error?: string;
  onValidationChange?: (isValid: boolean) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onAddImage,
  onRemoveImage,
  error,
  onValidationChange,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [detectionResults, setDetectionResults] = useState<
    (DetectionResult | null)[]
  >([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);

  // Animation values
  const addButtonScale = useSharedValue(1);
  const addButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: addButtonScale.value }],
    };
  });

  // Update detection results array when images change
  useEffect(() => {
    setDetectionResults((prev) => {
      const newResults = [...prev];
      // Add null entries for new images
      while (newResults.length < images.length) {
        newResults.push(null);
      }
      // Remove entries for deleted images
      while (newResults.length > images.length) {
        newResults.pop();
      }

      return newResults;
    });
  }, [images.length]);

  // Update parent component about validation status
  useEffect(() => {
    if (onValidationChange && images.length > 0) {
      // Check if at least one image has a valid pothole
      const hasValidPothole = detectionResults.some(
        (result) => result && result.isValidPothole
      );
      onValidationChange(hasValidPothole);
    }
  }, [detectionResults, images.length, onValidationChange]);

  const analyzeImage = async (index: number) => {
    if (index < 0 || index >= images.length) return;

    setSelectedImageIndex(index);
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await detectPothole(images[index]);

      // Update the detection results
      setDetectionResults((prev) => {
        const newResults = [...prev];
        newResults[index] = result;
        return newResults;
      });

      // Show feedback based on detection
      if (!result.isValidPothole) {
        Alert.alert(
          "No Pothole Detected",
          "Our system couldn't detect a pothole in this image with sufficient confidence. Please try another image or continue if you're sure this is a pothole.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      setAnalysisError(
        "Failed to analyze image. Please check your connection and try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddImagePress = () => {
    addButtonScale.value = withSpring(0.9, { damping: 10 });
    setTimeout(() => {
      addButtonScale.value = withSpring(1);
      onAddImage();
    }, 100);
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.imageGallery}
      >
        <Animated.View
          style={[styles.addImageButtonContainer, addButtonAnimatedStyle]}
        >
          <Pressable
            style={styles.addImageButton}
            onPress={handleAddImagePress}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
          >
            <MaterialCommunityIcons
              name="camera-plus"
              size={28}
              color="#0284c7"
            />
            <Text style={styles.addImageSubtext}>
              Add Photo{"\n"}({images.length}/5)
            </Text>
          </Pressable>
        </Animated.View>

        {images.map((uri, index) => (
          <MotiView
            key={index}
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 15 }}
            style={styles.imageContainer}
          >
            <TouchableOpacity onPress={() => setSelectedImageIndex(index)}>
              <Image source={{ uri }} style={styles.thumbnailImage} />
              {detectionResults[index] && (
                <View
                  style={[
                    styles.validationBadge,
                    detectionResults[index]?.isValidPothole
                      ? styles.validBadge
                      : styles.invalidBadge,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      detectionResults[index]?.isValidPothole
                        ? "check"
                        : "close"
                    }
                    size={16}
                    color="#FFFFFF"
                  />
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => onRemoveImage(index)}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={24}
                color="#DC2626"
              />
            </TouchableOpacity>
          </MotiView>
        ))}
      </ScrollView>

      {error && (
        <HelperText type="error" visible={true} style={styles.errorText}>
          {error}
        </HelperText>
      )}

      {selectedImageIndex !== null && selectedImageIndex < images.length && (
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 15 }}
          style={styles.detectionContainer}
        >
          <DetectionResultView
            imageUri={images[selectedImageIndex]}
            detectionResult={detectionResults[selectedImageIndex]}
            isAnalyzing={isAnalyzing}
            error={analysisError}
          />

          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => analyzeImage(selectedImageIndex)}
              disabled={isAnalyzing}
              style={styles.analyzeButton}
              icon="magnify"
              loading={isAnalyzing}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Image"}
            </Button>

            <Button
              mode="outlined"
              onPress={() => setSelectedImageIndex(null)}
              style={styles.closeButton}
            >
              Close
            </Button>
          </View>
        </MotiView>
      )}

      {images.length > 0 && selectedImageIndex === null && (
        <Button
          mode="outlined"
          onPress={() => setSelectedImageIndex(0)}
          style={styles.viewImagesButton}
          icon="image-search"
        >
          View & Analyze Images
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageGallery: {
    flexGrow: 0,
    marginBottom: 8,
  },
  addImageButtonContainer: {
    marginRight: 12,
  },
  addImageButton: {
    width: 110,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
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
    top: 2,
    right: 2,
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
  detectionContainer: {
    marginTop: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 12,
  },
  analyzeButton: {
    flex: 1,
    backgroundColor: "#374151",
  },
  closeButton: {
    flex: 1,
  },
  viewImagesButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  validationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  validBadge: {
    backgroundColor: "#10B981",
  },
  invalidBadge: {
    backgroundColor: "#DC2626",
  },
});

export default ImageGallery;
