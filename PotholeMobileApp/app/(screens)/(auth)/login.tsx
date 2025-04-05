"use client";

import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Portal } from "react-native-paper";
import { useAuth } from "../../../context/auth-context";
import { useFormState } from "../../hooks/use-form-state";
import { AuthContainer } from "../../components/auth-components/auth-container";
import { AuthHeader } from "../../components/auth-components/auth-header";
import { AuthForm } from "../../components/auth-components/auth-form";
import { AuthInput } from "../../components/auth-components/auth-input";
import AuthButton from "../../components/auth-components/auth-button";
import { AuthDivider } from "../../components/auth-components/auth-divider";
import { GoogleButton } from "../../components/auth-components/google-button";
import { AuthFooter } from "../../components/auth-components/auth-footer";
import { AuthDialog } from "../../components/auth-components/auth-dialog";
import NewRadarLoader from "../../components/auth-components/radar-loader";

const LoginScreen = () => {
  // Initialize router for navigation
  const router = useRouter();

  // Destructure authentication-related functions and states from custom auth context
  const {
    signIn,
    user,
    signInWithGoogle,
    googleAuthLoading,
    googleError,
    isAdmin,
    refreshAdminStatus,
  } = useAuth();

  // Use custom form state hook to manage input values and secure text entries
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

  // State management for loading, error handling, and error visibility
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);

  // Initialize secure text entry for password field on component mount
  useEffect(() => {
    initSecureTextEntry("password", true);
  }, [initSecureTextEntry]);

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (user) {
      // Check if user is admin and redirect accordingly
      if (isAdmin) {
        router.replace("(screens)/(admin)/portal");
      } else {
        router.replace("(screens)/(dashboard)/home");
      }
    }
  }, [user, isAdmin, router]);

  // Handle Google authentication errors
  useEffect(() => {
    if (googleError) {
      setError(googleError);
      setShowError(true);
    }
  }, [googleError]);

  // Handle email/password login
  const handleLogin = async () => {
    // Validate input fields
    if (!values.email || !values.password) {
      setError("Please enter your credentials");
      setShowError(true);
      return;
    }

    // Set loading state and attempt sign-in
    setLoading(true);
    try {
      const { error: signInError } = await signIn(
        values.email,
        values.password
      );

      // Handle sign-in errors
      if (signInError) {
        setError(signInError.message || "Authentication failed");
        setShowError(true);
      } else {
        // Successfully signed in, refresh admin status before navigation
        await refreshAdminStatus();
      }
    } catch (err) {
      // Catch any unexpected errors during sign-in
      setError("Authentication failed");
      setShowError(true);
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = () => {
    console.log("Google sign in button pressed");
    signInWithGoogle();
  };

  return (
    <AuthContainer>
      {/* Header with welcome message and radar loader */}
      <AuthHeader
        title="Welcome Back"
        subtitle="Sign in to your account"
        icon={<NewRadarLoader />}
      />

      {/* Login form with email and password inputs */}
      <AuthForm>
        <View style={styles.inputContainer}>
          {/* Email input field */}
          <AuthInput
            label="Email"
            value={values.email}
            onChangeText={handleChange("email")}
            keyboardType="email-address"
            icon="email"
          />

          {/* Password input field with toggle for secure text entry */}
          <AuthInput
            label="Password"
            value={values.password}
            onChangeText={handleChange("password")}
            secureTextEntry={secureTextEntries.password}
            toggleSecureEntry={toggleSecureEntry("password")}
            icon="lock"
          />
        </View>

        {/* Login button with loading state */}
        <AuthButton onPress={handleLogin} loading={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </AuthButton>

        {/* Divider between email and Google sign-in */}
        <AuthDivider />

        {/* Google Sign-In button */}
        <GoogleButton
          onPress={handleGoogleSignIn}
          disabled={loading}
          loading={googleAuthLoading}
        />
      </AuthForm>

      {/* Footer with link to registration page */}
      <AuthFooter
        text="Don't have an account?"
        linkText="Sign up"
        onPress={() => router.replace("/register")}
      />

      {/* Error dialog portal for displaying authentication errors */}
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

// Styles for the login screen
const styles = StyleSheet.create({
  // Add bottom margin to input container
  inputContainer: {
    marginBottom: 24,
  },
});

export default LoginScreen;
