"use client"

import { useState, useEffect } from "react"
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useRouter } from "expo-router"
import { Text, TextInput, Button, PaperProvider } from "react-native-paper"
import { LinearGradient } from "expo-linear-gradient"
import { MotiView } from "moti"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import Svg, { Defs, Pattern, Rect, Circle } from "react-native-svg"
import * as Google from "expo-auth-session/providers/google"
import * as WebBrowser from "expo-web-browser"
import { lightTheme } from "../theme"

const { width, height } = Dimensions.get("window")

WebBrowser.maybeCompleteAuthSession()

const BackgroundPattern = () => (
  <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
    <Defs>
      <Pattern id="pattern" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(45)">
        <Circle cx="30" cy="30" r="1.5" fill="rgba(66, 133, 244, 0.1)" />
      </Pattern>
    </Defs>
    <Rect width="100%" height="100%" fill="url(#pattern)" />
  </Svg>
)

const RegisterScreen = () => {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [secureText, setSecureText] = useState(true)
  const [loading, setLoading] = useState(false)

  const [request, response, promptGoogleSignUp] = Google.useAuthRequest({
    clientId: "YOUR_GOOGLE_WEB_CLIENT_ID",
    iosClientId: "YOUR_GOOGLE_IOS_CLIENT_ID",
    androidClientId: "YOUR_GOOGLE_ANDROID_CLIENT_ID",
  })

  useEffect(() => {
    if (response?.type === "success") {
      handleSuccessfulRegister()
    }
  }, [response])

  const handleSuccessfulRegister = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      router.replace("/(dashboard)/Home")
    } catch (err) {
      alert("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!name.trim() || !email.includes("@") || password.length < 6) {
      alert("Please enter valid details.")
      return
    }

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      router.replace("/(dashboard)/Home")
    } catch (err) {
      alert("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PaperProvider theme={lightTheme}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <BackgroundPattern />
        <LinearGradient
          colors={["rgba(66, 133, 244, 0.08)", "rgba(52, 168, 83, 0.05)", "transparent"]}
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join us to get started!</Text>
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
                  label="Full Name"
                  mode="outlined"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  left={<TextInput.Icon icon="account" color="#4285F4" />}
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
                onPress={handleRegister}
                style={styles.registerButton}
                contentStyle={styles.registerButtonContent}
                labelStyle={styles.registerButtonText}
                loading={loading}
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </View>

              <Button
                mode="outlined"
                onPress={() => promptGoogleSignUp()}
                disabled={!request || loading}
                style={styles.googleButton}
                contentStyle={styles.googleButtonContent}
                labelStyle={styles.googleButtonText}
                icon={() => <MaterialCommunityIcons name="google" size={24} color="#34A853" />}
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
                onPress={() => router.replace("/Login")}
                uppercase={false}
                style={styles.loginButton}
                labelStyle={styles.loginButtonText}
              >
                Already have an account? <Text style={styles.loginButtonTextHighlight}>Sign in</Text>
              </Button>
            </MotiView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </PaperProvider>
  )
}

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
  registerButton: {
    height: 56,
    backgroundColor: lightTheme.colors.buttonBackground,
    borderRadius: 28,
    marginTop: 8,
  },
  registerButtonContent: {
    height: 56,
  },
  registerButtonText: {
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
  loginButton: {
    opacity: 0.9,
  },
  loginButtonText: {
    fontSize: 14,
    color: lightTheme.colors.textSecondary,
    letterSpacing: 0.25,
  },
  loginButtonTextHighlight: {
    color: lightTheme.colors.primary,
    fontWeight: "600",
  },
})

export default RegisterScreen

