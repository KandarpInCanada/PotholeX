import { StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import { lightTheme } from "../../../app/theme";

interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  toggleSecureEntry?: () => void;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  icon: string;
}

export const AuthInput = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  toggleSecureEntry,
  keyboardType = "default",
  autoCapitalize = "none",
  icon,
}: AuthInputProps) => {
  return (
    <TextInput
      label={label}
      mode="outlined"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      style={styles.input}
      left={<TextInput.Icon icon={icon} color="#4285F4" />}
      right={
        toggleSecureEntry && secureTextEntry !== undefined ? (
          <TextInput.Icon
            icon={secureTextEntry ? "eye-off" : "eye"}
            color="#4285F4"
            onPress={toggleSecureEntry}
          />
        ) : null
      }
      theme={{
        colors: {
          primary: "#4285F4",
          text: "#0F172A",
          placeholder: "#64748B",
          background: "transparent",
          onSurfaceVariant: "#475569",
          disabled: "#334155",
        },
      }}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 16,
    backgroundColor: lightTheme.colors.surface,
    height: 56,
    fontSize: 16,
    borderRadius: 12,
  },
});
