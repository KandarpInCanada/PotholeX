/**
 * Authentication Context
 *
 * This module provides comprehensive authentication state management for the application.
 * It handles user authentication, session management, and admin status verification.
 *
 * Features:
 * - Email/password authentication
 * - Google OAuth integration
 * - Session persistence and auto-refresh
 * - Deep link handling for auth redirects
 * - Admin status verification
 * - Push notification token management
 * - Automatic session timeout for security
 */

"use client";

import type React from "react";
import { createContext, useState, useEffect, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { AppState } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkAdminStatus } from "../app/services/admin-service";
import {
  registerForPushNotificationsAsync,
  savePushToken,
} from "../lib/notifications";

/**
 * Authentication context type definition
 * Provides all authentication-related state and functions
 */
type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  googleAuthLoading: boolean;
  googleError: string | null;
  isAdmin: boolean;
  expoPushToken: string | null;
  signUp: (
    email: string,
    password: string,
    metadata?: { [key: string]: any }
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshAdminStatus: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component
 *
 * Wraps the application to provide authentication context to all child components.
 * Handles authentication state management, session persistence, and auth-related operations.
 *
 * @param {React.ReactNode} children - Child components that will have access to the auth context
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [authEventHandled, setAuthEventHandled] = useState(false);

  /**
   * Parse hash fragment from URL for token-based authentication
   *
   * Extracts authentication tokens from URL hash fragments returned by OAuth providers.
   *
   * @param {string} url - The URL containing the hash fragment
   * @returns {Record<string, string> | null} - Parsed parameters or null if parsing failed
   */
  const parseHashFragment = (url: string) => {
    try {
      const hashIndex = url.indexOf("#");
      if (hashIndex === -1) return null;

      const fragment = url.substring(hashIndex + 1);
      const params = new URLSearchParams(fragment);

      const result: Record<string, string> = {};
      for (const [key, value] of params.entries()) {
        result[key] = value;
      }

      return result;
    } catch (error) {
      console.error("Error parsing hash fragment:", error);
      return null;
    }
  };

  /**
   * Handle deep links for authentication redirects
   *
   * This effect sets up listeners for deep links that contain authentication data,
   * processes the authentication data, and updates the auth state accordingly.
   */
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      console.log("Deep link received:", event.url);

      if (authEventHandled) {
        console.log("Auth event already handled, skipping");
        return;
      }

      if (event.url.includes("auth/callback")) {
        setAuthEventHandled(true);
        console.log("Processing auth callback URL:", event.url);

        try {
          const urlObj = new URL(event.url);
          const code = urlObj.searchParams.get("code");

          if (code) {
            console.log(
              "Auth code found in query params, exchanging for session"
            );
            const { data, error } = await supabase.auth.exchangeCodeForSession(
              code
            );

            if (error) {
              console.error("Error exchanging code for session:", error);
              setGoogleError(error.message);
            } else {
              console.log("Successfully authenticated with code");
              if (data.session) {
                setSession(data.session);
                setUser(data.session.user);

                if (data.session.user) {
                  const adminStatus = await checkAdminStatus(
                    data.session.user.id
                  );
                  setIsAdmin(adminStatus);
                }
              }
            }
          } else if (event.url.includes("#")) {
            console.log("No code found, checking for hash fragment");
            const hashParams = parseHashFragment(event.url);

            if (hashParams && hashParams.access_token) {
              console.log("Access token found in hash fragment");

              const { data, error } = await supabase.auth.setSession({
                access_token: hashParams.access_token,
                refresh_token: hashParams.refresh_token || "",
              });

              if (error) {
                console.error("Error setting session from hash:", error);
                setGoogleError(error.message);
              } else {
                console.log("Successfully set session from hash fragment");
                if (data.session) {
                  setSession(data.session);
                  setUser(data.session.user);

                  if (data.session.user) {
                    const adminStatus = await checkAdminStatus(
                      data.session.user.id
                    );
                    setIsAdmin(adminStatus);
                  }
                }
              }
            } else {
              console.error("No access token found in hash fragment");
              setGoogleError("Authentication failed: No access token");
            }
          } else {
            console.error("No auth code or access token found in URL");
            setGoogleError("Authentication failed: No authentication data");
          }
        } catch (err) {
          console.error("Error processing auth callback:", err);
          setGoogleError("Failed to complete authentication");
        } finally {
          setGoogleAuthLoading(false);
          setTimeout(() => setAuthEventHandled(false), 5000);
        }
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log("App opened with initial URL:", url);
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [authEventHandled]);

  /**
   * Initialize and maintain authentication state
   *
   * This effect handles:
   * - Initial session retrieval
   * - Token auto-refresh based on app state
   * - Auth state change subscription
   */
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log(
        "Initial session check:",
        session ? "Session exists" : "No session"
      );

      if (error) {
        console.error("Session error:", error);
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed, event:", event);

      if (event === "TOKEN_REFRESHED" && !session) {
        console.log("Token refresh failed, signing out");
        await signOut();
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.remove();
      authSubscription.unsubscribe();
    };
  }, []);

  /**
   * Handle app state changes for security
   *
   * This effect implements a security feature that automatically signs out
   * the user if the app has been in the background for too long (30 minutes).
   */
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        console.log("App moving to background, cleaning up session...");
        await AsyncStorage.setItem(
          "app_background_time",
          Date.now().toString()
        );
      } else if (nextAppState === "active") {
        try {
          const backgroundTimeStr = await AsyncStorage.getItem(
            "app_background_time"
          );
          if (backgroundTimeStr) {
            const backgroundTime = Number.parseInt(backgroundTimeStr);
            const currentTime = Date.now();
            const timeInBackground = currentTime - backgroundTime;

            if (timeInBackground > 1800000) {
              console.log("App was in background for too long, signing out...");
              await signOut();
            }

            await AsyncStorage.removeItem("app_background_time");
          }
        } catch (error) {
          console.error("Error handling app state change:", error);
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Check and update admin status when user changes
   *
   * This effect ensures that the admin status is always up-to-date
   * whenever the authenticated user changes.
   */
  useEffect(() => {
    const checkUserAdminStatus = async () => {
      if (user) {
        try {
          const adminStatus = await checkAdminStatus(user.id);
          console.log("Admin status check result:", adminStatus);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkUserAdminStatus();
  }, [user]);

  /**
   * Register for push notifications when user is authenticated
   *
   * This effect handles push notification registration and token storage
   * for the authenticated user.
   */
  useEffect(() => {
    const registerForPushNotifications = async () => {
      if (user) {
        try {
          const token = await registerForPushNotificationsAsync();
          if (token) {
            setExpoPushToken(token);
            await savePushToken(user.id, token);
          }
        } catch (error) {
          console.error("Error registering for push notifications:", error);
        }
      }
    };

    registerForPushNotifications();
  }, [user]);

  /**
   * Sign in with email and password
   *
   * Authenticates a user with their email and password, and updates
   * the admin status if authentication is successful.
   *
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<{error: any}>} - Object containing error if sign-in failed
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const adminStatus = await checkAdminStatus(user.id);
          setIsAdmin(adminStatus);
          console.log("User logged in, admin status:", adminStatus);

          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  /**
   * Sign up with email and password
   *
   * Creates a new user account with the provided email, password, and optional metadata.
   * Sends a confirmation email with a redirect back to the app.
   *
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @param {Object} metadata - Optional additional user data
   * @returns {Promise<{error: any}>} - Object containing error if sign-up failed
   */
  const signUp = async (
    email: string,
    password: string,
    metadata?: { [key: string]: any }
  ) => {
    try {
      const redirectUrl = Linking.createURL("auth/callback");
      console.log("Sign up redirect URL:", redirectUrl);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: redirectUrl,
        },
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  /**
   * Sign in with Google OAuth
   *
   * Initiates the Google OAuth flow, opens a browser for authentication,
   * and processes the authentication result.
   *
   * This function handles both code-based and token-based authentication flows.
   */
  const signInWithGoogle = async () => {
    try {
      setGoogleError(null);
      setGoogleAuthLoading(true);
      setAuthEventHandled(false);

      const redirectUrl = Linking.createURL("auth/callback");
      console.log("Google auth redirect URL:", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
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

      console.log("Opening browser for OAuth with URL:", data.url);

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl,
        {
          showInRecents: true,
          createTask: true,
        }
      );

      console.log("WebBrowser result:", result.type);

      if (result.type === "success") {
        console.log(
          "Auth session completed successfully with URL:",
          result.url
        );

        if (result.url) {
          try {
            const urlObj = new URL(result.url);
            const code = urlObj.searchParams.get("code");

            if (code) {
              console.log("Processing auth code from WebBrowser result");
              const { data, error } =
                await supabase.auth.exchangeCodeForSession(code);

              if (error) {
                console.error("Error exchanging code for session:", error);
                setGoogleError(error.message);
              } else {
                console.log(
                  "Successfully authenticated with Google via WebBrowser result"
                );
                setSession(data.session);
                setUser(data.session?.user ?? null);

                if (data.session?.user) {
                  const adminStatus = await checkAdminStatus(
                    data.session.user.id
                  );
                  setIsAdmin(adminStatus);
                }
              }
            } else if (result.url.includes("#")) {
              console.log(
                "No code found in WebBrowser result, checking hash fragment"
              );
              const hashParams = parseHashFragment(result.url);

              if (hashParams && hashParams.access_token) {
                console.log("Access token found in hash fragment");

                const { data, error } = await supabase.auth.setSession({
                  access_token: hashParams.access_token,
                  refresh_token: hashParams.refresh_token || "",
                });

                if (error) {
                  console.error("Error setting session from hash:", error);
                  setGoogleError(error.message);
                } else {
                  console.log("Successfully set session from hash fragment");
                  if (data.session) {
                    setSession(data.session);
                    setUser(data.session.user);

                    if (data.session.user) {
                      const adminStatus = await checkAdminStatus(
                        data.session.user.id
                      );
                      setIsAdmin(adminStatus);
                    }
                  }
                }
              } else {
                console.error("No access token found in hash fragment");
                setGoogleError("Authentication failed: No access token");
              }
            } else {
              console.error(
                "No auth code or access token found in WebBrowser result URL"
              );
              setGoogleError("Authentication failed: No authentication data");
            }
          } catch (error) {
            console.error("Error processing WebBrowser result:", error);
            setGoogleError("Failed to process authentication result");
          }
        }
      } else {
        console.log("Auth session was dismissed", result.type);
        setGoogleError("Authentication was cancelled");
      }

      setGoogleAuthLoading(false);
    } catch (error) {
      console.error("Google auth error:", error);
      setGoogleError("Failed to authenticate with Google");
      setGoogleAuthLoading(false);
    }
  };

  /**
   * Sign out the current user
   *
   * Performs a complete sign-out by:
   * 1. Signing out from Supabase
   * 2. Clearing all authentication-related data from AsyncStorage
   * 3. Resetting all auth state variables
   *
   * This function is designed to be thorough to prevent any auth state persistence issues.
   */
  const signOut = async () => {
    console.log("Signing out user...");
    try {
      const keysToRemove = [
        "hasSeenOnboarding",
        "userSettings",
        "recentReports",
        "last_activity_time",
        "app_background_time",
        "supabase.auth.token",
      ];

      await Promise.all([
        supabase.auth.signOut(),
        ...keysToRemove.map((key) => AsyncStorage.removeItem(key)),
      ]);

      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setAuthEventHandled(false);

      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error during sign out:", error);

      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setAuthEventHandled(false);

      throw error;
    }
  };

  /**
   * Reset password for a user
   *
   * Sends a password reset email to the specified email address.
   * The email contains a link that redirects back to the app.
   *
   * @param {string} email - Email address of the user
   * @returns {Promise<{error: any}>} - Object containing error if reset failed
   */
  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = Linking.createURL("auth/reset-password");
      console.log("Reset password redirect URL:", redirectUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  /**
   * Refresh the admin status of the current user
   *
   * Useful when admin status might have changed without a full auth state change,
   * such as after an admin grants or revokes admin privileges.
   *
   * @returns {Promise<boolean>} - The updated admin status
   */
  const refreshAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      return false;
    }

    try {
      const adminStatus = await checkAdminStatus(user.id);
      setIsAdmin(adminStatus);
      return adminStatus;
    } catch (error) {
      console.error("Error refreshing admin status:", error);
      return false;
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
        isAdmin,
        expoPushToken,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        refreshAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the auth context
 *
 * Provides easy access to all authentication-related state and functions.
 * Throws an error if used outside of an AuthProvider.
 *
 * @returns {AuthContextType} The auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
