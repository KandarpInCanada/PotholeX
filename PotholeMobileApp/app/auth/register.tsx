import React, { useState, useEffect } from "react";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Text, TextInput, Button, PaperProvider } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { lightTheme } from "../theme";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const RegisterScreen = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);

  const [request, response, promptGoogleSignUp] = Google.useAuthRequest({
    clientId: "YOUR_GOOGLE_WEB_CLIENT_ID",
    iosClientId: "YOUR_GOOGLE_IOS_CLIENT_ID",
    androidClientId: "YOUR_GOOGLE_ANDROID_CLIENT_ID",
  });

  useEffect(() => {
    if (response?.type === "success") {
      alert("Google Sign-Up Successful!");
      router.replace("/dashboard/home");
    }
  }, [response]);

  const handleRegister = () => {
    if (!name.trim() || !email.includes("@") || password.length < 6) {
      alert("Please enter valid details.");
      return;
    }
    alert("Registration Successful!");
    router.replace("/dashboard/home");
  };

  return (
    <PaperProvider theme={lightTheme}>
      <LinearGradient
        colors={["#F8F7FF", "#F8F7FF"]}
        style={styles.gradientBackground}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <Text style={styles.title}>Create an Account</Text>
            <Text style={styles.subtitle}>Join us to get started!</Text>

            <TextInput
              label="Full Name"
              mode="outlined"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              theme={{
                colors: { primary: lightTheme.colors.primary, text: lightTheme.colors.text },
              }}
            />
            <TextInput
              label="Email"
              mode="outlined"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              theme={{
                colors: { primary: lightTheme.colors.primary, text: lightTheme.colors.text },
              }}
            />
            <TextInput
              label="Password"
              mode="outlined"
              placeholder="Enter a strong password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureText}
              right={
                <TextInput.Icon
                  icon={secureText ? "eye-off" : "eye"}
                  onPress={() => setSecureText(!secureText)}
                />
              }
              style={styles.input}
              theme={{
                colors: { primary: lightTheme.colors.primary, text: lightTheme.colors.text },
              }}
            />

            <Button mode="contained" onPress={handleRegister} style={styles.button} labelStyle={styles.buttonText}>
              Register
            </Button>

            <Button
              mode="outlined"
              icon={() => (
                <Image source={require("../assets/google-logo.jpeg")} style={styles.googleLogo} />
              )}
              style={styles.socialButton}
              labelStyle={styles.socialText}
              onPress={() => promptGoogleSignUp()}
              disabled={!request}
            >
              Continue with Google
            </Button>

            <Button onPress={() => router.push("/auth/login")} uppercase={false}>
              Already have an account? <Text style={styles.loginText}>Login</Text>
            </Button>
          </View>
        </TouchableWithoutFeedback>
      </LinearGradient>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: lightTheme.colors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: lightTheme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    width: "100%",
    backgroundColor: lightTheme.colors.buttonBackground,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    color: lightTheme.colors.buttonText,
    fontSize: 18,
    fontWeight: "bold",
  },
  socialButton: {
    width: "100%",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: lightTheme.colors.outline,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
  },
  googleLogo: {
    width: 22,
    height: 22,
    marginRight: 8,
  },
  socialText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  loginText: {
    color: lightTheme.colors.primary,
    fontSize: 16,
  },
});

export default RegisterScreen;