import type React from "react";
import { StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { MotiView } from "moti";
import { lightTheme } from "../../app/theme";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
}

export const AuthHeader = ({ title, subtitle, icon }: AuthHeaderProps) => {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "timing",
        duration: 1000,
        delay: 300,
      }}
      style={styles.headerContainer}
    >
      {icon}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    color: lightTheme.colors.text,
    marginTop: 24,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: lightTheme.colors.textSecondary,
    letterSpacing: 0.25,
    textAlign: "center",
    maxWidth: 280,
  },
});
