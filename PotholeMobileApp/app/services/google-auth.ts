"use client"

import * as Google from "expo-auth-session/providers/google"
import * as WebBrowser from "expo-web-browser"
import { useEffect, useState } from "react"
import Constants from "expo-constants"

// Register for a web client ID on Google Cloud Console
// and add it to your app.json or app.config.js
const GOOGLE_WEB_CLIENT_ID = Constants.expoConfig?.extra?.googleWebClientId || ""
const GOOGLE_ANDROID_CLIENT_ID = Constants.expoConfig?.extra?.googleAndroidClientId || ""
const GOOGLE_IOS_CLIENT_ID = Constants.expoConfig?.extra?.googleIosClientId || ""

WebBrowser.maybeCompleteAuthSession()

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [error, setError] = useState<string | null>(null)

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    ...(GOOGLE_IOS_CLIENT_ID ? { iosClientId: GOOGLE_IOS_CLIENT_ID } : {}),
    ...(GOOGLE_ANDROID_CLIENT_ID ? { androidClientId: GOOGLE_ANDROID_CLIENT_ID } : {}),
  })

  useEffect(() => {
    if (response?.type === "success") {
      setLoading(true)
      const { authentication } = response

      // You would typically send this token to your backend
      // to validate and create a session
      if (authentication?.accessToken) {
        getUserInfo(authentication.accessToken)
      }
    } else if (response?.type === "error") {
      setError(response.error?.message || "Google authentication failed")
    }
  }, [response])

  const getUserInfo = async (token: string) => {
    try {
      const response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const user = await response.json()
      setUserInfo(user)
      return user
    } catch (error) {
      setError("Failed to fetch user info")
      return null
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setError(null)
    setLoading(true)
    try {
      await promptAsync()
    } catch (error) {
      setError("Google authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return {
    signInWithGoogle,
    googleAuthLoading: loading,
    googleUser: userInfo,
    googleError: error,
    googleRequest: request,
  }
}