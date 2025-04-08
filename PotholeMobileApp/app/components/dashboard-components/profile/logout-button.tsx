"use client";

import type React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Dialog, Portal, Text, Divider } from "react-native-paper";
import { useState } from "react";
import { lightTheme } from "../../../theme";

interface LogoutButtonProps {
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  onLogout,
  isLoggingOut,
}) => {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  return (
    <>
      <Button
        mode="outlined"
        onPress={() => setShowLogoutDialog(true)}
        style={styles.logoutButton}
        icon="logout"
        textColor={lightTheme.colors.error}
        buttonColor="transparent"
        loading={isLoggingOut}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? "Logging out..." : "Logout"}
      </Button>

      <Portal>
        <Dialog
          visible={showLogoutDialog}
          onDismiss={() => setShowLogoutDialog(false)}
          style={styles.logoutDialog}
        >
          <Dialog.Title style={styles.logoutDialogTitle}>Logout</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.logoutDialogContent}>
              Are you sure you want to logout?
            </Text>
          </Dialog.Content>
          <Divider style={styles.dialogDivider} />
          <Dialog.Actions style={styles.logoutDialogActions}>
            <Button
              onPress={() => setShowLogoutDialog(false)}
              textColor="#007AFF"
              style={styles.dialogButton}
              labelStyle={styles.dialogButtonLabel}
              contentStyle={styles.dialogButtonContent}
            >
              Cancel
            </Button>
            <View style={styles.verticalDivider} />
            <Button
              onPress={() => {
                setShowLogoutDialog(false);
                onLogout();
              }}
              textColor="#FF3B30"
              style={styles.dialogButton}
              labelStyle={styles.dialogButtonLabel}
              contentStyle={styles.dialogButtonContent}
            >
              Logout
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    marginBottom: 40, // Increased from 24 to 40 for more space
    borderColor: lightTheme.colors.error,
    borderWidth: 1.5,
    borderRadius: 24,
  },
  logoutDialog: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    width: "70%",
    maxWidth: 270,
    alignSelf: "center",
    padding: 0,
    overflow: "hidden",
  },
  logoutDialogTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  logoutDialogContent: {
    fontSize: 13,
    color: "#000000",
    textAlign: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    lineHeight: 18,
  },
  dialogDivider: {
    height: 0.5,
    backgroundColor: "#E2E8F0",
    width: "100%",
  },
  logoutDialogActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 0,
    padding: 0,
    height: 44,
  },
  dialogButton: {
    flex: 1,
    borderRadius: 0,
    margin: 0,
    height: 44,
    justifyContent: "center",
  },
  dialogButtonLabel: {
    fontSize: 17,
    fontWeight: "400",
    margin: 0,
    padding: 0,
    textAlign: "center",
  },
  dialogButtonContent: {
    height: 44,
    paddingHorizontal: 0,
  },
  verticalDivider: {
    width: 0.5,
    height: 44,
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
  },
});

export default LogoutButton;
