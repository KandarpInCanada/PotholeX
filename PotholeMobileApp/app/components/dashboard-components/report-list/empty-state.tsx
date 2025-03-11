// components/common/EmptyState.tsx
import React, { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  buttonLabel: string;
  onButtonPress: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  buttonLabel,
  onButtonPress,
}) => {
  return (
    <View style={styles.container}>
      {icon}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {buttonLabel ? (
        <Button
          mode="contained"
          style={styles.button}
          contentStyle={styles.buttonContent}
          onPress={onButtonPress}
        >
          {buttonLabel}
        </Button>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#0284c7",
  },
  buttonContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
});

export default EmptyState;
