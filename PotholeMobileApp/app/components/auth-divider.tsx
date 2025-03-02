import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { lightTheme } from "../../app/theme";

export const AuthDivider = ({ text = "or" }: { text?: string }) => {
  return (
    <View style={styles.dividerContainer}>
      <View style={styles.divider} />
      <Text style={styles.dividerText}>{text}</Text>
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: lightTheme.colors.outline,
  },
  dividerText: {
    color: lightTheme.colors.textSecondary,
    paddingHorizontal: 16,
    fontSize: 14,
    letterSpacing: 0.25,
  },
});
