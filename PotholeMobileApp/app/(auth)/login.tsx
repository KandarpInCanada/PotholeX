"use client";

import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Portal } from "react-native-paper";
import { useAuth } from "../../context/auth-context";
import { useGoogleAuth } from "../services/google-auth";
import { useFormState } from "../hooks/use-form-state";
import { AuthContainer } from "../components/auth-components/auth-container";
import { AuthHeader } from "../components/auth-components/auth-header";
import { AuthForm } from "../components/auth-components/auth-form";
import { AuthInput } from "../components/auth-components/auth-input";
import AuthButton from "../components/auth-components/auth-button";
import { AuthDivider } from "../components/auth-components/auth-divider";
import { GoogleButton } from "../components/auth-components/google-button";
import { AuthFooter } from "../components/auth-components/auth-footer";
import { AuthDialog } from "../components/auth-components/auth-dialog";
import NewRadarLoader from "../components/auth-components/radar-loader";

const LoginScreen = () => {
  const router = useRouter();
  const { signIn, user } = useAuth();
  const { signInWithGoogle, googleUser, googleError, googleAuthLoading } =
    useGoogleAuth();
  const {
    values,
    handleChange,
    secureTextEntries,
    toggleSecureEntry,
    initSecureTextEntry,
  } = useFormState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  useEffect(() => {
    initSecureTextEntry("password", true);
  }, [initSecureTextEntry]);

  useEffect(() => {
    if (user) {
      router.replace("/(dashboard)/home");
    }
  }, [user, router]);

  useEffect(() => {
    if (googleUser) {
      console.log("Google user authenticated:", googleUser);
    }
    if (googleError) {
      setError(googleError);
      setShowError(true);
    }
  }, [googleUser, googleError]);

  const handleLogin = async () => {
    if (!values.email || !values.password) {
      setError("Please enter your credentials");
      setShowError(true);
      return;
    }
    setLoading(true);
    try {
      const { error: signInError } = await signIn(
        values.email,
        values.password
      );
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

  return (
    <AuthContainer>
      <AuthHeader
        title="Welcome Back"
        subtitle="Sign in to your account"
        icon={<NewRadarLoader />}
      />
      <AuthForm>
        <View style={styles.inputContainer}>
          <AuthInput
            label="Email"
            value={values.email}
            onChangeText={handleChange("email")}
            keyboardType="email-address"
            icon="email"
          />
          <AuthInput
            label="Password"
            value={values.password}
            onChangeText={handleChange("password")}
            secureTextEntry={secureTextEntries.password}
            toggleSecureEntry={toggleSecureEntry("password")}
            icon="lock"
          />
        </View>
        <AuthButton onPress={handleLogin} loading={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </AuthButton>
        <AuthDivider />
        <GoogleButton
          onPress={signInWithGoogle}
          disabled={loading || googleAuthLoading}
        />
      </AuthForm>
      <AuthFooter
        text="Don't have an account?"
        linkText="Sign up"
        onPress={() => router.replace("/register")}
      />
      <Portal>
        <AuthDialog
          visible={showError}
          onDismiss={() => setShowError(false)}
          title="Error"
          content={error}
        />
      </Portal>
    </AuthContainer>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 24,
  },
});

export default LoginScreen;
