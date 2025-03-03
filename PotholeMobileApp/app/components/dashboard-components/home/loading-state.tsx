import type React from "react";
import { Text, StyleSheet, ActivityIndicator } from "react-native";
import { MotiView } from "moti";

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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
  },
});

export default LoadingState;
