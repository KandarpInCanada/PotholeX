"use client";

import type React from "react";
import { createContext, useState, useEffect, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { AppState } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  googleAuthLoading: boolean;
  googleError: string | null;
  signUp: (
    email: string,
    password: string,
    metadata?: { [key: string]: any }
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Handle deep links for auth redirects
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      console.log("Deep link received:", event.url);
      if (event.url.includes("auth/callback")) {
        // Extract the auth code and state from the URL
        const params = new URL(event.url).searchParams;
        const code = params.get("code");
        const state = params.get("state");

        if (code && state) {
          try {
            // Exchange the code for a session
            const { data, error } = await supabase.auth.exchangeCodeForSession(
              code
            );
            if (error) {
              console.error("Error exchanging code for session:", error);
              setGoogleError(error.message);
            } else {
              console.log("Successfully authenticated with Google");
            }
          } catch (err) {
            console.error("Error in OAuth callback:", err);
            setGoogleError("Failed to complete authentication");
          } finally {
            setGoogleAuthLoading(false);
          }
        }
      }
    };

    // Set up deep link listener
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Check if app was opened via a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    // Set up a listener for app state changes to handle token refresh
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Set up a listener for auth state changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Clean up subscriptions
    return () => {
      subscription.remove();
      authSubscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    metadata?: { [key: string]: any }
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      setGoogleError(null);
      setGoogleAuthLoading(true);

      // Get the URL for your app's scheme
      const redirectUrl = Linking.createURL("auth/callback");

      console.log("Redirect URL:", redirectUrl);

      // Start the OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error("OAuth initialization error:", error);
        setGoogleError(error.message);
        setGoogleAuthLoading(false);
        return;
      }

      if (!data?.url) {
        console.error("No OAuth URL returned");
        setGoogleError("Failed to start authentication");
        setGoogleAuthLoading(false);
        return;
      }

      console.log("Opening browser for OAuth...");

      // Open the browser for authentication
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      if (result.type === "success") {
        console.log("Auth session completed successfully");
        // The deep link handler will process the result
      } else {
        console.log("Auth session was dismissed", result.type);
        setGoogleError("Authentication was cancelled");
        setGoogleAuthLoading(false);
      }
    } catch (error) {
      console.error("Google auth error:", error);
      setGoogleError("Failed to authenticate with Google");
      setGoogleAuthLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: Linking.createURL("auth/reset-password"),
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        googleAuthLoading,
        googleError,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
