import { supabase, type Profile } from "../../lib/supabase"
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from "@env"
// Get user profile
export const getUserProfile = async (): Promise<(Profile & { email: string }) | null> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Auth error:", authError)
      return null
    }

    // First check if profile exists
    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id)

    if (error) {
      console.error("Error fetching profile:", error)
      return null
    }

    // If no profile exists, create a new one
    if (!data || data.length === 0) {
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

      // Try to create the profile using RPC instead of direct insert
      // This can bypass RLS if you have a server function set up
      const { error: insertError } = await supabase.rpc("create_user_profile", newProfile)

      if (insertError) {
        console.error("Error creating profile:", insertError)
        // Fall back to returning what we have even if we couldn't save it
        return { ...newProfile, email: user.email || "" }
      }

      return { ...newProfile, email: user.email || "" }
    }

    // Profile exists, return it
    const profile = data[0]
    return {
      ...profile,
      username: profile.username || user.email?.split("@")[0] || "user",
      full_name: profile.full_name || user.user_metadata?.name || profile.username || "User",
      email: user.email || "",
    }
  } catch (error) {
    console.error("Unexpected error in getUserProfile:", error)
    return null
  }
}

// Update user profile
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

// Upload profile avatar
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
