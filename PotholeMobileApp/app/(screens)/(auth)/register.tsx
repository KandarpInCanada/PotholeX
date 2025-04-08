"use client";

import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Portal } from "react-native-paper";
import { useAuth } from "../../../context/auth-context";
import useFormState from "../../hooks/use-form-state";
import AuthContainer from "../../components/auth-components/auth-container";
import AuthHeader from "../../components/auth-components/auth-header";
import AuthForm from "../../components/auth-components/auth-form";
import AuthInput from "../../components/auth-components/auth-input";
import AuthButton from "../../components/auth-components/auth-button";
import AuthDivider from "../../components/auth-components/auth-divider";
import GoogleButton from "../../components/auth-components/google-button";
import AuthFooter from "../../components/auth-components/auth-footer";
import AuthDialog from "../../components/auth-components/auth-dialog";
import { checkAdminStatus } from "../../services/admin-service"; // Import directly

const RegisterScreen = () => {
  // Initialize router for navigation between screens
  const router = useRouter();

  // Destructure authentication-related functions and states from custom auth context
  const { signUp, user, signInWithGoogle, googleAuthLoading, googleError } =
    useAuth();

  // Use custom form state hook to manage input values and secure text entries
  const {
    values,
    handleChange,
    secureTextEntries,
    toggleSecureEntry,
    initSecureTextEntry,
  } = useFormState({
    name: "",
    email: "",
    password: "",
  });

  // State management for loading, error handling, and dialog visibility
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize secure text entry for password field on component mount
  useEffect(() => {
    initSecureTextEntry("password", true);
  }, [initSecureTextEntry]);

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    const checkUserStatus = async () => {
      if (user) {
        try {
          // Check admin status directly
          const isAdmin = await checkAdminStatus(user.id);
          if (isAdmin) {
            router.replace("(screens)/(admin)/portal");
          } else {
            router.replace("(screens)/(dashboard)/home");
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          router.replace("(screens)/(dashboard)/home"); // Default to user dashboard on error
        }
      }
    };

    checkUserStatus();
  }, [user, router]);

  // Handle Google authentication errors
  useEffect(() => {
    if (googleError) {
      setError(googleError);
      setShowError(true);
    }
  }, [googleError]);

  // Handle user registration
  const handleRegister = async () => {
    // Basic form validation
    // Check if name is not empty, email contains '@', and password is at least 6 characters
    if (
      !values.name.trim() ||
      !values.email.includes("@") ||
      values.password.length < 6
    ) {
      setError(
        "Please enter valid details. Password must be at least 6 characters."
      );
      setShowError(true);
      return;
    }

    // Set loading state while registration is in progress
    setLoading(true);
    try {
      // Attempt to sign up with email, password, and additional user info
      const { error: signUpError } = await signUp(
        values.email,
        values.password,
        { name: values.name }
      );

      // Handle registration errors
      if (signUpError) {
        setError(signUpError.message || "Registration failed");
        setShowError(true);
      } else {
        // Show success dialog if registration is successful
        setShowSuccess(true);
      }
    } catch (err) {
      // Catch any unexpected errors during registration
      setError("Registration failed");
      setShowError(true);
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = () => {
    signInWithGoogle();
  };

  return (
    <AuthContainer>
      {/* Header with title and subtitle */}
      <AuthHeader title="Create Account" subtitle="Join us to get started!" />

      {/* Registration form */}
      <AuthForm>
        <View style={styles.inputContainer}>
          {/* Full Name input field */}
          <AuthInput
            label="Full Name"
            value={values.name}
            onChangeText={handleChange("name")}
            icon="account"
            autoCapitalize="words"
          />

          {/* Email input field */}
          <AuthInput
            label="Email"
            value={values.email}
            onChangeText={handleChange("email")}
            keyboardType="email-address"
            icon="email"
          />

          {/* Password input field with secure text entry toggle */}
          <AuthInput
            label="Password"
            value={values.password}
            onChangeText={handleChange("password")}
            secureTextEntry={secureTextEntries.password}
            toggleSecureEntry={toggleSecureEntry("password")}
            icon="lock"
          />
        </View>

        {/* Create Account button with loading state */}
        <AuthButton onPress={handleRegister} loading={loading}>
          {loading ? "Creating account..." : "Create Account"}
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

      {/* Footer with link to login page */}
      <AuthFooter
        text="Already have an account?"
        linkText="Sign in"
        onPress={() => router.push("(screens)/(auth)/login")}
      />

      {/* Portal for displaying dialogs */}
      <Portal>
        {/* Error dialog */}
        <AuthDialog
          visible={showError}
          onDismiss={() => setShowError(false)}
          title="Error"
          content={error}
        />

        {/* Success dialog */}
        <AuthDialog
          visible={showSuccess}
          onDismiss={() => {
            setShowSuccess(false);
            router.push("(screens)/(auth)/login");
          }}
          title="Success"
          content="Account created successfully! Please check your email to verify your account."
        />
      </Portal>
    </AuthContainer>
  );
};

// Styles for the registration screen
const styles = StyleSheet.create({
  // Add bottom margin to input container
  inputContainer: {
    marginBottom: 24,
  },
});

export default RegisterScreen;
