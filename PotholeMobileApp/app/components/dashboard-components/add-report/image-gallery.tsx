import type React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { HelperText } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ImageGalleryProps {
  images: string[];
  onAddImage: () => void;
  onRemoveImage: (index: number) => void;
  error?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onAddImage,
  onRemoveImage,
  error,
}) => {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.imageGallery}
      >
        <TouchableOpacity style={styles.addImageButton} onPress={onAddImage}>
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
              onPress={() => onRemoveImage(index)}
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
      {error && (
        <HelperText type="error" visible={true} style={styles.errorText}>
          {error}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default ImageGallery;
