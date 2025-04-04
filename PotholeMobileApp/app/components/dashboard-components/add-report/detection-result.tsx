import type React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import type { DetectionResult } from "../../../services/pothole-detection-service";

interface DetectionResultProps {
  imageUri: string;
  detectionResult: DetectionResult | null;
  isAnalyzing: boolean;
  error: string | null;
}

const DetectionResultView: React.FC<DetectionResultProps> = ({
  imageUri,
  detectionResult,
  isAnalyzing,
  error,
}) => {
  if (isAnalyzing) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        <View style={styles.overlay}>
          <MotiView
            from={{ opacity: 0.5, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "timing",
              duration: 1000,
              loop: true,
              repeatReverse: true,
            }}
          >
            <ActivityIndicator size="large" color="#FFFFFF" />
          </MotiView>
          <Text style={styles.analyzingText}>Analyzing image...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        <View style={[styles.overlay, styles.errorOverlay]}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={40}
            color="#FFFFFF"
          />
          <Text style={styles.errorText}>Analysis failed</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!detectionResult) {
    return null;
  }

  const { isValidPothole, highestConfidence, detections } = detectionResult;

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", damping: 15 }}
        style={[
          styles.resultOverlay,
          isValidPothole ? styles.validOverlay : styles.invalidOverlay,
        ]}
      >
        <MaterialCommunityIcons
          name={isValidPothole ? "check-circle" : "alert-circle"}
          size={32}
          color="#FFFFFF"
        />
        <Text style={styles.resultText}>
          {isValidPothole ? "Pothole detected" : "No pothole detected"}
        </Text>
        {detections.length > 0 && (
          <Text style={styles.confidenceText}>
            Confidence: {(highestConfidence * 100).toFixed(1)}%
          </Text>
        )}
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 8,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorOverlay: {
    backgroundColor: "rgba(220, 38, 38, 0.7)",
  },
  resultOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  validOverlay: {
    backgroundColor: "rgba(16, 185, 129, 0.8)",
  },
  invalidOverlay: {
    backgroundColor: "rgba(220, 38, 38, 0.8)",
  },
  analyzingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  errorSubtext: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  resultText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  confidenceText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default DetectionResultView;
