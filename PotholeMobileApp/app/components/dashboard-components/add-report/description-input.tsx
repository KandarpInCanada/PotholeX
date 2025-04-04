import type React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, HelperText } from "react-native-paper";

interface DescriptionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

const DescriptionInput: React.FC<DescriptionInputProps> = ({
  value,
  onChangeText,
  error,
}) => {
  return (
    <View>
      <TextInput
        mode="outlined"
        placeholder="Describe the pothole size, depth, and any hazards..."
        value={value}
        onChangeText={onChangeText}
        multiline
        numberOfLines={4}
        style={styles.input}
        outlineStyle={styles.inputOutline}
        outlineColor={error ? "#DC2626" : "#E2E8F0"}
        activeOutlineColor="#0284c7"
        error={!!error}
        left={<TextInput.Icon icon="text-box-outline" color="#64748B" />}
        maxLength={500}
        autoCapitalize="sentences"
      />
      {error ? (
        <HelperText type="error" visible={true} style={styles.errorText}>
          {error}
        </HelperText>
      ) : (
        <HelperText type="info" visible={true} style={styles.helperText}>
          Minimum 10 characters. {value.length}/500 characters used.
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#FFFFFF",
    fontSize: 15,
    minHeight: 120,
  },
  inputOutline: {
    borderRadius: 12,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
  },
});

export default DescriptionInput;
