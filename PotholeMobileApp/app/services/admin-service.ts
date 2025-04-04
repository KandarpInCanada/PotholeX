import { supabase } from "../../lib/supabase"

/**
 * Checks if a user has admin privileges
 * @param userId The user ID to check
 * @returns Boolean indicating if the user is an admin
 */
export const checkAdminStatus = async (userId: string): Promise<boolean> => {
  try {
    console.log("Checking admin status for user:", userId)
    const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", userId).single()

    if (error) {
      console.error("Error in checkAdminStatus query:", error)
      throw error
    }

    console.log("Admin status data:", data)
    return data?.is_admin || false
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

/**
 * Grants admin privileges to a user (should only be callable by existing admins)
 * @param userId The user ID to grant admin privileges to
 * @returns Success status
 */
export const grantAdminPrivileges = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("profiles").update({ is_admin: true }).eq("id", userId)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error granting admin privileges:", error)
    return false
  }
}

/**
 * Revokes admin privileges from a user (should only be callable by existing admins)
 * @param userId The user ID to revoke admin privileges from
 * @returns Success status
 */
export const revokeAdminPrivileges = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("profiles").update({ is_admin: false }).eq("id", userId)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error revoking admin privileges:", error)
    return false
  }
}

