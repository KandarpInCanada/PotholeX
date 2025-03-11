import type React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const ROAD_CONDITIONS = ["Dry", "Wet", "Snow/Ice", "Construction"];

interface RoadConditionSelectorProps {
  selectedCondition: string;
  onSelectCondition: (condition: string) => void;
}

const RoadConditionSelector: React.FC<RoadConditionSelectorProps> = ({
  selectedCondition,
  onSelectCondition,
}) => {
  return (
    <View style={styles.conditionContainer}>
      {ROAD_CONDITIONS.map((condition) => (
        <TouchableOpacity
          key={condition}
          style={[
            styles.conditionButton,
            selectedCondition === condition && styles.selectedConditionButton,
          ]}
          onPress={() => onSelectCondition(condition)}
        >
          <Text
            style={[
              styles.conditionButtonText,
              selectedCondition === condition &&
                styles.selectedConditionButtonText,
            ]}
          >
            {condition}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default RoadConditionSelector;
