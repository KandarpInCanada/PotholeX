"use client";

import type React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useRouter } from "expo-router";

interface EmptyStateProps {
  message: string;
  subMessage: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, subMessage }) => {
  const router = useRouter();

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={styles.emptyContainer}
    >
      <MaterialCommunityIcons
        name="clipboard-text-outline"
        size={80}
        color="#94A3B8"
      />
      <Text style={styles.emptyText}>{message}</Text>
      <Text style={styles.emptySubtext}>{subMessage}</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("(screens)/(dashboard)/add-report")}
      >
        <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add New Report</Text>
      </TouchableOpacity>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0284c7",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default EmptyState;
