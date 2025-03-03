import type React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface SectionHeaderProps {
  icon: string;
  title: string;
  required?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  required,
}) => {
  return (
    <View style={styles.sectionHeader}>
      <MaterialCommunityIcons name={icon as any} size={20} color="#0284c7" />
      <Text style={styles.sectionTitle}>{title}</Text>
      {required && <Text style={styles.required}>*Required</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginLeft: 8,
    flex: 1,
  },
  required: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
  },
});

export default SectionHeader;
