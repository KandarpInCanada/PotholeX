import type React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { SeverityLevel } from "../../../../lib/supabase";

const SEVERITY_LEVELS = [
  { label: SeverityLevel.LOW, color: "#10B981", icon: "alert-circle-outline" },
  { label: SeverityLevel.MEDIUM, color: "#F59E0B", icon: "alert-circle" },
  { label: SeverityLevel.DANGER, color: "#DC2626", icon: "alert-octagon" },
];

interface SeveritySelectorProps {
  selectedSeverity: SeverityLevel;
  onSelectSeverity: (severity: SeverityLevel) => void;
}

const SeveritySelector: React.FC<SeveritySelectorProps> = ({
  selectedSeverity,
  onSelectSeverity,
}) => {
  return (
    <View style={styles.severityContainer}>
      {SEVERITY_LEVELS.map((level) => (
        <MotiView
          key={level.label}
          from={{ scale: 1 }}
          animate={{ scale: selectedSeverity === level.label ? 1.05 : 1 }}
          transition={{ type: "spring" }}
          style={styles.severityItem}
        >
          <TouchableOpacity
            style={[
              styles.severityButton,
              { borderColor: level.color },
              selectedSeverity === level.label && {
                backgroundColor: level.color,
              },
            ]}
            onPress={() => onSelectSeverity(level.label as SeverityLevel)}
          >
            <MaterialCommunityIcons
              name={level.icon as any}
              size={24}
              color={selectedSeverity === level.label ? "#FFFFFF" : level.color}
            />
            <Text
              style={[
                styles.severityText,
                {
                  color:
                    selectedSeverity === level.label ? "#FFFFFF" : "#0F172A",
                },
              ]}
            >
              {level.label}
            </Text>
          </TouchableOpacity>
        </MotiView>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  severityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  severityItem: {
    flex: 1,
    maxWidth: "32%",
  },
  severityButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  severityText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },
});

export default SeveritySelector;
