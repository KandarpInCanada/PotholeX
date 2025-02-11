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
import theme from "../theme";

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
      router.replace("/dashboard/home");
    }
  }, [response]);

  const handleLogin = () => {
    if (email === "test@example.com" && password === "password") {
      router.replace("/dashboard/home");
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <PaperProvider theme={theme}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <RadarLoader size={200} />
          <Text style={styles.title}>PotholeX</Text>
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
            theme={{ colors: { primary: theme.colors.primary, text: theme.colors.text } }}
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
            theme={{ colors: { primary: theme.colors.primary, text: theme.colors.text } }}
          />
          <Button mode="contained" onPress={handleLogin} style={styles.button}>
            <Text style={styles.buttonText}>Login</Text>
          </Button>
          <Button
            mode="contained"
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
          <Button onPress={() => router.push("/auth/register")} uppercase={false}>
            Don't have an account? <Text style={styles.registerText}>Register</Text>
          </Button>
        </View>
      </TouchableWithoutFeedback>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.placeholder,
    marginBottom: 30,
  },
  input: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    width: "100%",
    backgroundColor: theme.colors.buttonBackground,
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: 18,
    fontWeight: "bold",
  },
  socialButton: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
  },
  googleLogo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  socialText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  registerText: {
    color: theme.colors.primary,
    fontSize: 16,
  },
});

export default LoginScreen;