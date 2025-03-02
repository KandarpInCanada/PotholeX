"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";

// Initialize WebBrowser for Google Auth
WebBrowser.maybeCompleteAuthSession();

// Get Google client IDs from app config
const GOOGLE_WEB_CLIENT_ID =
  Constants.expoConfig?.extra?.googleWebClientId || "";
const GOOGLE_ANDROID_CLIENT_ID =
  Constants.expoConfig?.extra?.googleAndroidClientId || "";
const GOOGLE_IOS_CLIENT_ID =
  Constants.expoConfig?.extra?.googleIosClientId || "";

type User = {
  id: string;
  email: string;
  name?: string;
  phone?: string; // Add optional phone
  profilePic?: string; // Add optional profilePic
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error?: { message: string } }>;
  signUp: (
    email: string,
    password: string,
    metadata?: { name?: string }
  ) => Promise<{ error?: { message: string } }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // Set up Google Auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    ...(GOOGLE_IOS_CLIENT_ID ? { iosClientId: GOOGLE_IOS_CLIENT_ID } : {}),
    ...(GOOGLE_ANDROID_CLIENT_ID
      ? { androidClientId: GOOGLE_ANDROID_CLIENT_ID }
      : {}),
  });

  // Handle Google Auth response
  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;

      if (authentication?.accessToken) {
        handleGoogleLogin(authentication.accessToken);
      }
    }
  }, [response]);

  // Check if user is already logged in
  useEffect(() => {
    checkUserSession();
  }, []);

  // Check for existing user session
  const checkUserSession = async () => {
    try {
      // This would typically be a call to your backend or auth service
      // For demo purposes, we'll check localStorage/AsyncStorage

      // Simulate checking for a session
      setTimeout(() => {
        // For demo, we're not setting a user, just ending the loading state
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to check user session:", error);
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async (accessToken: string) => {
    try {
      // Fetch user info from Google
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const userInfo = await response.json();

      // Here you would typically:
      // 1. Send this token to your backend
      // 2. Verify the token
      // 3. Create or fetch the user
      // 4. Return a session

      // For demo purposes, we'll just set the user directly
      setUser({
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
      });
    } catch (error) {
      console.error("Google login failed:", error);
      throw new Error("Google authentication failed");
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      // This would be your actual authentication logic
      // For demo purposes, we'll simulate a successful login

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Validate credentials (this is just a demo)
      if (email === "demo@example.com" && password === "password") {
        setUser({
          id: "user-123",
          email: email,
          name: "Demo User",
        });
        return {};
      }

      return {
        error: {
          message: "Invalid email or password",
        },
      };
    } catch (error) {
      console.error("Sign in failed:", error);
      return {
        error: {
          message: "Authentication failed",
        },
      };
    }
  };

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    metadata?: { name?: string }
  ) => {
    try {
      // This would be your actual registration logic
      // For demo purposes, we'll simulate a successful registration

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you would create the user in your backend
      // For demo, we'll just return success
      return {};
    } catch (error) {
      console.error("Sign up failed:", error);
      return {
        error: {
          message: "Registration failed",
        },
      };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // This would be your actual sign out logic
      // For demo purposes, we'll just clear the user
      setUser(null);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error("Google sign in failed:", error);
      throw new Error("Google authentication failed");
    }
  };

  // Create the context value
  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
