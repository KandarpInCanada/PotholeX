import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { lightTheme } from "../../../theme";

export default function AppInfo() {
  return (
    <View style={styles.appInfoContainer}>
      <Text style={styles.sectionTitle}>App Information</Text>

      <TouchableOpacity style={styles.infoRow}>
        <MaterialCommunityIcons
          name="information-outline"
          size={24}
          color={lightTheme.colors.primary}
        />
        <Text style={styles.infoText}>About PotholeX</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={lightTheme.colors.textSecondary}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.infoRow}>
        <MaterialCommunityIcons
          name="shield-check-outline"
          size={24}
          color={lightTheme.colors.primary}
        />
        <Text style={styles.infoText}>Privacy Policy</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={lightTheme.colors.textSecondary}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.infoRow}>
        <MaterialCommunityIcons
          name="file-document-outline"
          size={24}
          color={lightTheme.colors.primary}
        />
        <Text style={styles.infoText}>Terms of Service</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={lightTheme.colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  appInfoContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: lightTheme.colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.outline,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: lightTheme.colors.text,
    marginLeft: 16,
  },
});
