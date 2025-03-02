import { StyleSheet } from "react-native";
import { Text, Button, Dialog } from "react-native-paper";
import { lightTheme } from "../../app/theme";

interface AuthDialogProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  content: string;
  buttonText?: string;
}

export const AuthDialog = ({
  visible,
  onDismiss,
  title,
  content,
  buttonText = "OK",
}: AuthDialogProps) => {
  return (
    <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
      <Dialog.Title style={styles.dialogTitle}>{title}</Dialog.Title>
      <Dialog.Content>
        <Text style={styles.dialogContent}>{content}</Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss} textColor="#4285F4">
          {buttonText}
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 16,
  },
  dialogTitle: {
    color: lightTheme.colors.text,
    fontSize: 20,
    letterSpacing: 0.25,
    fontWeight: "600",
  },
  dialogContent: {
    color: lightTheme.colors.textSecondary,
    fontSize: 16,
    letterSpacing: 0.25,
    lineHeight: 24,
  },
});
