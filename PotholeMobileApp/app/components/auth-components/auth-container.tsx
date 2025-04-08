import type React from "react";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { lightTheme } from "../../../app/theme";
import { BackgroundPattern } from "./background-pattern";
import { LinearGradient } from "expo-linear-gradient";

interface AuthContainerProps {
  children: React.ReactNode;
}

const AuthBackground = () => {
  return (
    <View style={StyleSheet.absoluteFillObject}>
      <BackgroundPattern />
      <LinearGradient
        colors={[
          "rgba(66, 133, 244, 0.08)",
          "rgba(52, 168, 83, 0.05)",
          "transparent",
        ]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </View>
  );
};

const AuthContainer = ({ children }: AuthContainerProps) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <AuthBackground />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>{children}</View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  innerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});

export { AuthBackground };
export default AuthContainer;
