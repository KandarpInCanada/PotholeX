import type React from "react";
import { StyleSheet, Alert } from "react-native";
import { Button } from "react-native-paper";
import { lightTheme } from "../../../theme";

interface LogoutButtonProps {
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  onLogout,
  isLoggingOut,
}) => {
  const handleLogoutPress = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: onLogout,
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Button
      mode="outlined"
      onPress={handleLogoutPress}
      style={styles.logoutButton}
      icon="logout"
      textColor={lightTheme.colors.error}
      buttonColor="transparent"
      loading={isLoggingOut}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? "Logging out..." : "Logout"}
    </Button>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    marginBottom: 24,
    borderColor: lightTheme.colors.error,
    borderWidth: 1.5,
  },
});

export default LogoutButton;
