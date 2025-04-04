import type React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { HelperText } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";

const POTHOLE_CATEGORIES = [
  { id: "surface_break", name: "Surface Break", icon: "road-variant" },
  { id: "deep_hole", name: "Deep Hole", icon: "arrow-collapse-down" },
  { id: "cracking", name: "Cracking", icon: "vector-line" },
  { id: "edge_damage", name: "Edge Damage", icon: "road" },
  { id: "sinkhole", name: "Sinkhole", icon: "arrow-collapse-down" },
  { id: "other", name: "Other", icon: "help-circle-outline" },
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
          <MotiView
            key={cat.id}
            from={{ scale: 1 }}
            animate={{ scale: selectedCategory === cat.name ? 1.05 : 1 }}
            transition={{ type: "spring", damping: 15 }}
            style={styles.categoryItem}
          >
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === cat.name && styles.selectedCategoryButton,
              ]}
              onPress={() => onSelectCategory(cat.name)}
            >
              <MaterialCommunityIcons
                name={cat.icon as any}
                size={24}
                color={selectedCategory === cat.name ? "#FFFFFF" : "#64748B"}
                style={styles.categoryIcon}
              />
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === cat.name &&
                    styles.selectedCategoryButtonText,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          </MotiView>
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
    justifyContent: "space-between",
    gap: 12,
  },
  categoryItem: {
    width: "48%",
    marginBottom: 8,
  },
  categoryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCategoryButton: {
    backgroundColor: "#0284c7",
    borderColor: "#0284c7",
  },
  categoryIcon: {
    marginBottom: 8,
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
