import type React from "react";
// Add this to ensure the component doesn't block touch events
import { StyleSheet, View, Text } from "react-native";
import { Button } from "react-native-paper";
import { MotiView } from "moti";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  buttonLabel?: string;
  onButtonPress?: () => void;
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
      pointerEvents="box-none" // Add this to ensure touch events pass through
    >
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {buttonLabel && onButtonPress && (
        <Button mode="contained" onPress={onButtonPress} style={styles.button}>
          {buttonLabel}
        </Button>
      )}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    // Add marginTop to push the content up from the bottom half
    marginTop: -100,
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
    marginTop: 16,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
  },
});

export default EmptyState;
