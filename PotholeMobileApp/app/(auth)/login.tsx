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
import RadarLoader from "../component/radar-loader";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { lightTheme } from "../theme"; // Now using the updated light theme

// Necessary for Google authentication on web
WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);

  // Google Authentication Hook
  const [request, response, promptGoogleLogin] = Google.useAuthRequest({
    clientId: "YOUR_GOOGLE_WEB_CLIENT_ID",
    iosClientId: "YOUR_GOOGLE_IOS_CLIENT_ID",
    androidClientId: "YOUR_GOOGLE_ANDROID_CLIENT_ID",
  });

  useEffect(() => {
    if (response?.type === "success") {
      router.replace("/home");
    }
  }, [response]);

  const handleLogin = () => {
    if (email === "test@example.com" && password === "password") {
      router.replace("/home");
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <PaperProvider theme={lightTheme}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <RadarLoader size={150} />
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Login to continue</Text>

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
              colors: {
                primary: lightTheme.colors.primary,
                text: lightTheme.colors.text,
                background: lightTheme.colors.surface,
              },
            }}
          />
          <TextInput
            label="Password"
            mode="outlined"
            placeholder="Enter your password"
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
              colors: {
                primary: lightTheme.colors.primary,
                text: lightTheme.colors.text,
                background: lightTheme.colors.surface,
              },
            }}
          />
          
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            labelStyle={styles.buttonText}
          >
            Login
          </Button>

          <Button
            mode="outlined"
            icon={() => (
              <Image
                source={require("../assets/google-logo.jpeg")}
                style={styles.googleLogo}
              />
            )}
            style={styles.socialButton}
            labelStyle={styles.socialText}
            onPress={() => promptGoogleLogin()}
            disabled={!request}
          >
            Continue with Google
          </Button>

          <Button onPress={() => router.push("/register")} uppercase={false}>
            Don't have an account?{" "}
            <Text style={styles.registerText}>Register</Text>
          </Button>
        </View>
      </TouchableWithoutFeedback>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: lightTheme.colors.background,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: lightTheme.colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: lightTheme.colors.textSecondary,
    marginBottom: 24,
  },
  input: {
    width: "100%",
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 10,
    marginBottom: 12,
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
    color: lightTheme.colors.text,
  },
  registerText: {
    color: lightTheme.colors.primary,
    fontSize: 16,
  },
});

export default LoginScreen;