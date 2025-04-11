/**
 * Profile Service
 *
 * Manages all user profile-related operations including:
 * - Retrieving user profiles from Supabase
 * - Creating new profiles for first-time users
 * - Updating existing user profiles
 * - Handling profile avatar uploads to Supabase storage
 *
 * This service acts as an abstraction layer between the UI components
 * and the Supabase backend for all profile-related operations.
 */

import { supabase, type Profile } from "../../lib/supabase"
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from "@env"
import AsyncStorage from "@react-native-async-storage/async-storage"

/**
 * Retrieves the current user's profile from Supabase
 *
 * This function:
 * 1. Gets the authenticated user from Supabase auth
 * 2. Handles authentication errors by clearing stale sessions
 * 3. Fetches the user's profile from the profiles table
 * 4. Creates a new profile if one doesn't exist
 * 5. Returns the profile with default values for missing fields
 *
 * @returns The user profile with email or null if not authenticated/error
 */
export const getUserProfile = async (): Promise<(Profile & { email: string }) | null> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("Auth error:", authError)

      try {
        await supabase.auth.signOut()
        await AsyncStorage.removeItem("supabase.auth.token")
        console.log("Cleared stale session data due to auth error")
      } catch (clearError) {
        console.error("Error clearing session data:", clearError)
      }

      return null
    }

    if (!user) {
      console.log("No user found in session")
      return null
    }

    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (error) {
      if (error.code === "PGRST116") {
        const username = user.email?.split("@")[0] || "user"
        const fullName = user.user_metadata?.name || username

        const newProfile = {
          id: user.id,
          username: username,
          full_name: fullName,
          avatar_url: user.user_metadata?.avatar_url || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        console.log("Creating new profile:", newProfile)

        const { error: insertError } = await supabase.from("profiles").insert(newProfile)

        if (insertError) {
          console.error("Error creating profile:", insertError)
          return null
        }

        return { ...newProfile, email: user.email || "" }
      }

      console.error("Error fetching profile:", error)

      if (error.code === "23503" || error.message?.includes("foreign key constraint")) {
        console.error("User does not exist in auth system but has a token. Signing out.")
        await supabase.auth.signOut()
        return null
      }

      return null
    }

    const profile = {
      ...data,
      username: data.username || user.email?.split("@")[0] || "user",
      full_name: data.full_name || user.user_metadata?.name || data.username || "User",
      email: user.email || "",
    }

    console.log("Fetched profile:", profile)

    return profile
  } catch (error) {
    console.error("Unexpected error in getUserProfile:", error)
    return null
  }
}

/**
 * Updates the current user's profile in Supabase
 *
 * @param profileData - Partial profile data to update
 * @returns Boolean indicating success or failure
 */
export const updateUserProfile = async (profileData: Partial<Profile>): Promise<boolean> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Auth error:", authError)
      return false
    }

    const updates = {
      ...profileData,
      id: user.id,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id)

    if (error) {
      console.error("Error updating profile:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Unexpected error in updateUserProfile:", error)
    return false
  }
}

/**
 * Uploads a profile avatar image to Supabase storage
 *
 * This function:
 * 1. Determines the file extension from the URI
 * 2. Creates a unique file path in the avatars bucket
 * 3. Uploads the image using FormData (compatible with React Native)
 * 4. Returns the public URL of the uploaded image
 *
 * @param uri - Local URI of the image to upload
 * @param userId - User ID to associate with the avatar
 * @returns Public URL of the uploaded avatar or null if upload failed
 */
export const uploadProfileAvatar = async (uri: string, userId: string): Promise<string | null> => {
  try {
    const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg"
    const filePath = `avatars/${userId}.${fileExt}`

    const formData = new FormData()
    formData.append("file", {
      uri,
      name: `avatar.${fileExt}`,
      type: `image/${fileExt}`,
    } as any)

    const supabaseUrl = EXPO_PUBLIC_SUPABASE_URL
    const supabaseKey = EXPO_PUBLIC_SUPABASE_ANON_KEY
    const bucketName = "avatars"

    const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/${bucketName}/${filePath}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        "x-upsert": "true",
      },
      body: formData,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`)
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`
    return publicUrl
  } catch (error) {
    console.error("Error uploading avatar:", error)
    return null
  }
}

export default {
  getUserProfile,
  updateUserProfile,
  uploadProfileAvatar,
}
