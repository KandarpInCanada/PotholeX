import { StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AuthButton from "../components/auth-button";

interface GoogleButtonProps {
  onPress: () => void;
  disabled?: boolean;
  text?: string;
}

export const GoogleButton = ({
  onPress,
  disabled = false,
  text = "Continue with Google",
}: GoogleButtonProps) => {
  return (
    <AuthButton
      mode="outlined"
      onPress={onPress}
      disabled={disabled}
      style={styles.googleButton}
      icon={() => (
        <MaterialCommunityIcons name="google" size={24} color="#4285F4" />
      )}
    >
      {text}
    </AuthButton>
  );
};

const styles = StyleSheet.create({
  googleButton: {
    borderColor: "#DADCE0",
  },
});
