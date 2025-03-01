"use client";

import { useState, useEffect } from "react";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Text,
  TextInput,
  Button,
  PaperProvider,
  Portal,
  Dialog,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Defs, Pattern, Rect, Circle } from "react-native-svg";
import NewRadarLoader from "../animation/RadarLoader";
import { lightTheme } from "../theme";
import { useAuth } from "../../context/auth-context";

const BackgroundPattern = () => (
  <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
    <Defs>
      <Pattern
        id="pattern"
        patternUnits="userSpaceOnUse"
        width="60"
        height="60"
        patternTransform="rotate(45)"
      >
        <Circle cx="30" cy="30" r="1.5" fill="rgba(66, 133, 244, 0.1)" />
      </Pattern>
    </Defs>
    <Rect width="100%" height="100%" fill="url(#pattern)" />
  </Svg>
);

const LoginScreen = () => {
  const router = useRouter();
  const { signIn, signInWithGoogle, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.replace("/(dashboard)/Home");
    }
  }, [user, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your credentials");
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(signInError.message || "Authentication failed");
        setShowError(true);
      }
    } catch (err) {
      setError("Authentication failed");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      setError("Google authentication failed");
      setShowError(true);
    }
  };

  return (
    <PaperProvider theme={lightTheme}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
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
              <NewRadarLoader />
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>
            </MotiView>
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: "timing",
                duration: 1000,
                delay: 500,
              }}
              style={styles.formContainer}
            >
              <View style={styles.inputContainer}>
                <TextInput
                  label="Email"
                  mode="outlined"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  left={<TextInput.Icon icon="email" color="#4285F4" />}
                  theme={{
                    colors: {
                      primary: "#4285F4",
                      text: "#FFFFFF",
                      placeholder: "rgba(255, 255, 255, 0.6)",
                      background: "transparent",
                    },
                  }}
                />
                <TextInput
                  label="Password"
                  mode="outlined"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secureText}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock" color="#4285F4" />}
                  right={
                    <TextInput.Icon
                      icon={secureText ? "eye-off" : "eye"}
                      color="#4285F4"
                      onPress={() => setSecureText(!secureText)}
                    />
                  }
                  theme={{
                    colors: {
                      primary: "#4285F4",
                      text: "#FFFFFF",
                      placeholder: "rgba(255, 255, 255, 0.6)",
                      background: "transparent",
                    },
                  }}
                />
              </View>
              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.loginButton}
                contentStyle={styles.loginButtonContent}
                labelStyle={styles.loginButtonText}
                loading={loading}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </View>
              <Button
                mode="outlined"
                onPress={handleGoogleLogin}
                disabled={loading}
                style={styles.googleButton}
                contentStyle={styles.googleButtonContent}
                labelStyle={styles.googleButtonText}
                icon={() => (
                  <MaterialCommunityIcons
                    name="google"
                    size={24}
                    color="#673AB7"
                  />
                )}
              >
                Continue with Google
              </Button>
            </MotiView>
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                type: "timing",
                duration: 1000,
                delay: 700,
              }}
              style={styles.footerContainer}
            >
              <Button
                onPress={() => router.replace("/Register")}
                uppercase={false}
                style={styles.registerButton}
                labelStyle={styles.registerButtonText}
              >
                Don't have an account?{" "}
                <Text style={styles.registerButtonTextHighlight}>Sign up</Text>
              </Button>
            </MotiView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <Portal>
        <Dialog
          visible={showError}
          onDismiss={() => setShowError(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Error</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogContent}>{error}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowError(false)} textColor="#4285F4">
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </PaperProvider>
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
  formContainer: {
    width: "100%",
    maxWidth: 360,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: lightTheme.colors.surface,
    height: 56,
    fontSize: 16,
    borderRadius: 12,
  },
  loginButton: {
    height: 56,
    backgroundColor: lightTheme.colors.buttonBackground,
    borderRadius: 28,
    marginTop: 8,
  },
  loginButtonContent: {
    height: 56,
  },
  loginButtonText: {
    fontSize: 16,
    letterSpacing: 0.5,
    fontWeight: "600",
    color: lightTheme.colors.buttonText,
  },
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
  googleButton: {
    borderColor: lightTheme.colors.outline,
    borderWidth: 2,
    borderRadius: 28,
    height: 56,
  },
  googleButtonContent: {
    height: 56,
  },
  googleButtonText: {
    color: lightTheme.colors.text,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  footerContainer: {
    marginTop: 32,
  },
  registerButton: {
    opacity: 0.9,
  },
  registerButtonText: {
    fontSize: 14,
    color: lightTheme.colors.textSecondary,
    letterSpacing: 0.25,
  },
  registerButtonTextHighlight: {
    color: lightTheme.colors.primary,
    fontWeight: "600",
  },
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

export default LoginScreen;
