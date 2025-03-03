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

const RegisterScreen = () => {
  const router = useRouter();
  const { signUp, user } = useAuth();
  const { signInWithGoogle, googleUser, googleError, googleAuthLoading } =
    useGoogleAuth();
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleRegister = async () => {
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
    setLoading(true);
    try {
      const { error: signUpError } = await signUp(
        values.email,
        values.password,
        { name: values.name }
      );

      if (signUpError) {
        setError(signUpError.message || "Registration failed");
        setShowError(true);
      } else {
        setShowSuccess(true);
      }
    } catch (err) {
      setError("Registration failed");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthHeader title="Create Account" subtitle="Join us to get started!" />

      <AuthForm>
        <View style={styles.inputContainer}>
          <AuthInput
            label="Full Name"
            value={values.name}
            onChangeText={handleChange("name")}
            icon="account"
            autoCapitalize="words"
          />

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

        <AuthButton onPress={handleRegister} loading={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </AuthButton>

        <AuthDivider />

        <GoogleButton
          onPress={signInWithGoogle}
          disabled={loading || googleAuthLoading}
        />
      </AuthForm>

      <AuthFooter
        text="Already have an account?"
        linkText="Sign in"
        onPress={() => router.replace("/login")}
      />

      <Portal>
        <AuthDialog
          visible={showError}
          onDismiss={() => setShowError(false)}
          title="Error"
          content={error}
        />

        <AuthDialog
          visible={showSuccess}
          onDismiss={() => {
            setShowSuccess(false);
            router.replace("/login");
          }}
          title="Success"
          content="Account created successfully! Please check your email to verify your account."
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

export default RegisterScreen;
