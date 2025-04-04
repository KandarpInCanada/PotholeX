// components/common/EmptyState.tsx
import type React from "react";
import type { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { MotiView } from "moti";

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
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 15 }}
      style={styles.container}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {buttonLabel ? (
        <Button
          mode="contained"
          style={styles.button}
          contentStyle={styles.buttonContent}
          onPress={onButtonPress}
          icon="plus"
        >
          {buttonLabel}
        </Button>
      ) : null}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#0284c7",
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  buttonContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

export default EmptyState;
