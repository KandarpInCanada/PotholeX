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

  // Parse hash fragment from URL
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

  // Handle deep links for auth redirects
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      console.log("Deep link received:", event.url);

      // Prevent handling the same auth event multiple times
      if (authEventHandled) {
        console.log("Auth event already handled, skipping");
        return;
      }

      if (event.url.includes("auth/callback")) {
        setAuthEventHandled(true);
        console.log("Processing auth callback URL:", event.url);

        try {
          // First try to extract code from query params
          const urlObj = new URL(event.url);
          const code = urlObj.searchParams.get("code");

          if (code) {
            console.log(
              "Auth code found in query params, exchanging for session"
            );
            // Exchange the code for a session
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

                // Check admin status
                if (data.session.user) {
                  const adminStatus = await checkAdminStatus(
                    data.session.user.id
                  );
                  setIsAdmin(adminStatus);
                }
              }
            }
          }
          // If no code in query params, check for access_token in hash fragment
          else if (event.url.includes("#")) {
            console.log("No code found, checking for hash fragment");
            const hashParams = parseHashFragment(event.url);

            if (hashParams && hashParams.access_token) {
              console.log("Access token found in hash fragment");

              // Set the session directly with the token
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

                  // Check admin status
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
          // Reset the flag after a delay to allow for future auth attempts
          setTimeout(() => setAuthEventHandled(false), 5000);
        }
      }
    };

    // Set up deep link listener
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Check if app was opened via a deep link
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

  // Improve the auth state change handler to better handle errors
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

    // Set up a listener for auth state changes
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

    // Clean up subscriptions
    return () => {
      subscription.remove();
      authSubscription.unsubscribe();
    };
  }, []);

  // Add a new useEffect to handle app state changes and properly sign out when the app is closed
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      // When app moves to background or inactive state
      if (nextAppState === "background" || nextAppState === "inactive") {
        console.log("App moving to background, cleaning up session...");

        // Store a timestamp to track how long the app has been in background
        await AsyncStorage.setItem(
          "app_background_time",
          Date.now().toString()
        );
      }
      // When app comes back to foreground
      else if (nextAppState === "active") {
        try {
          // Check if we have a stored timestamp
          const backgroundTimeStr = await AsyncStorage.getItem(
            "app_background_time"
          );
          if (backgroundTimeStr) {
            const backgroundTime = Number.parseInt(backgroundTimeStr);
            const currentTime = Date.now();
            const timeInBackground = currentTime - backgroundTime;

            // If app was in background for more than 30 minutes (1800000 ms), sign out
            if (timeInBackground > 1800000) {
              console.log("App was in background for too long, signing out...");
              await signOut();
            }

            // Clear the timestamp
            await AsyncStorage.removeItem("app_background_time");
          }
        } catch (error) {
          console.error("Error handling app state change:", error);
        }
      }
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // Add a useEffect to check admin status when user changes
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

  // Add new useEffect for push notification registration
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

  // Improve the signIn function to check admin status after successful login
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If login was successful, immediately check admin status
      if (!error) {
        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Check and update admin status
          const adminStatus = await checkAdminStatus(user.id);
          setIsAdmin(adminStatus);
          console.log("User logged in, admin status:", adminStatus);

          // Add a small delay to ensure state is updated
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata?: { [key: string]: any }
  ) => {
    try {
      // Get the URL for your app's scheme
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

  const signInWithGoogle = async () => {
    try {
      setGoogleError(null);
      setGoogleAuthLoading(true);
      setAuthEventHandled(false);

      // Get the URL for your app's scheme
      const redirectUrl = Linking.createURL("auth/callback");

      // Log the redirect URL for debugging
      console.log("Google auth redirect URL:", redirectUrl);

      // Start the OAuth flow
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

      // Open the browser for authentication
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

        // Manually handle the URL if the deep link handler doesn't catch it
        if (result.url) {
          try {
            // First check for code in query params
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

                // Check admin status
                if (data.session?.user) {
                  const adminStatus = await checkAdminStatus(
                    data.session.user.id
                  );
                  setIsAdmin(adminStatus);
                }
              }
            }
            // If no code, check for hash fragment with access_token
            else if (result.url.includes("#")) {
              console.log(
                "No code found in WebBrowser result, checking hash fragment"
              );
              const hashParams = parseHashFragment(result.url);

              if (hashParams && hashParams.access_token) {
                console.log("Access token found in hash fragment");

                // Set the session directly with the token
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

                    // Check admin status
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

  // Improve the signOut function to be more thorough
  const signOut = async () => {
    console.log("Signing out user...");
    try {
      // Clear any app-specific data from AsyncStorage
      const keysToRemove = [
        "hasSeenOnboarding",
        "userSettings",
        "recentReports",
        "last_activity_time",
        "app_background_time",
        "supabase.auth.token",
        // Add any other keys that should be cleared on logout
      ];

      await Promise.all([
        // Sign out from Supabase
        supabase.auth.signOut(),
        // Clear AsyncStorage items
        ...keysToRemove.map((key) => AsyncStorage.removeItem(key)),
      ]);

      // Reset auth state
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setAuthEventHandled(false);

      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error during sign out:", error);

      // Force reset auth state even if there's an error
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setAuthEventHandled(false);

      throw error; // Re-throw to handle in the UI
    }
  };

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

  // Add a function to refresh admin status
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

  // Add expoPushToken to the context value
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
