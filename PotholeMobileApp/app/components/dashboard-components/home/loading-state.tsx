import type React from "react";
import { Text, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { ActivityIndicator } from "react-native-paper";

const LoadingState: React.FC = () => {
  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={styles.loadingContainer}
    >
      <ActivityIndicator size="large" color="#0284c7" />
      <Text style={styles.loadingText}>Loading reports...</Text>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
});

export default LoadingState;
