import type React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { HelperText } from "react-native-paper";

const POTHOLE_CATEGORIES = [
  "Surface Break",
  "Deep Hole",
  "Cracking",
  "Edge Damage",
  "Sinkhole",
];

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  error?: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  error,
}) => {
  return (
    <View>
      <View style={styles.categoryGrid}>
        {POTHOLE_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.selectedCategoryButton,
            ]}
            onPress={() => onSelectCategory(cat)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === cat && styles.selectedCategoryButtonText,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && (
        <HelperText type="error" visible={true} style={styles.errorText}>
          {error}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
  },
});

export default CategorySelector;
