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
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import theme from "../theme";

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
    <PaperProvider theme={theme}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Create an Account</Text>
          <TextInput
            label="Full Name"
            mode="outlined"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            theme={{ colors: { primary: theme.colors.primary, text: theme.colors.text } }}
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
            theme={{ colors: { primary: theme.colors.primary, text: theme.colors.text } }}
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
            theme={{ colors: { primary: theme.colors.primary, text: theme.colors.text } }}
          />
          <Button mode="contained" onPress={handleRegister} style={styles.button}>
            <Text style={styles.buttonText}>Register</Text>
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
            onPress={() => promptGoogleSignUp()}
            disabled={!request}
          >
            Sign Up with Google
          </Button>
          <Button onPress={() => router.push("/auth/login")} uppercase={false}>
            Already have an account? <Text style={styles.loginText}>Login</Text>
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
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 20,
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
  loginText: {
    color: theme.colors.primary,
    fontSize: 16,
  },
});

export default RegisterScreen;