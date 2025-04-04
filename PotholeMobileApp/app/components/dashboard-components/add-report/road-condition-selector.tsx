import type React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";

const ROAD_CONDITIONS = [
  { id: "dry", name: "Dry", icon: "weather-sunny" },
  { id: "wet", name: "Wet", icon: "weather-rainy" },
  { id: "snow_ice", name: "Snow/Ice", icon: "weather-snowy" },
  { id: "construction", name: "Construction", icon: "hammer-wrench" },
];

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
        <MotiView
          key={condition.id}
          from={{ scale: 1 }}
          animate={{ scale: selectedCondition === condition.name ? 1.05 : 1 }}
          transition={{ type: "spring", damping: 15 }}
          style={styles.conditionItem}
        >
          <TouchableOpacity
            style={[
              styles.conditionButton,
              selectedCondition === condition.name &&
                styles.selectedConditionButton,
            ]}
            onPress={() => onSelectCondition(condition.name)}
          >
            <MaterialCommunityIcons
              name={condition.icon as any}
              size={24}
              color={
                selectedCondition === condition.name ? "#FFFFFF" : "#64748B"
              }
              style={styles.conditionIcon}
            />
            <Text
              style={[
                styles.conditionButtonText,
                selectedCondition === condition.name &&
                  styles.selectedConditionButtonText,
              ]}
            >
              {condition.name}
            </Text>
          </TouchableOpacity>
        </MotiView>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  conditionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  conditionItem: {
    width: "48%",
  },
  conditionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  selectedConditionButton: {
    backgroundColor: "#0284c7",
    borderColor: "#0284c7",
  },
  conditionIcon: {
    marginRight: 8,
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
