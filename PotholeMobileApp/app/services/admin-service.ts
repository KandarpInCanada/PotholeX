import { supabase, createAdminClient } from "../../lib/supabase"

/**
 * Checks if a user has admin privileges
 * @param userId The user ID to check
 * @returns Boolean indicating if the user is an admin
 */
export const checkAdminStatus = async (userId: string): Promise<boolean> => {
  try {
    console.log("Checking admin status for user:", userId)
    const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", userId)

    if (error) {
      console.error("Error in checkAdminStatus query:", error)
      throw error
    }

    // Check if any data was returned and if the first row has is_admin set to true
    console.log("Admin status data:", data)
    return data && data.length > 0 && data[0]?.is_admin === true
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

/**
 * Grants admin privileges to a user (should only be callable by existing admins)
 * @param userId The user ID to grant admin privileges to
 * @param serviceKey Optional service key for admin operations
 * @returns Success status
 */
export const grantAdminPrivileges = async (userId: string, serviceKey?: string): Promise<boolean> => {
  try {
    // Use admin client if service key is provided
    const client = serviceKey ? createAdminClient(serviceKey) : supabase

    const { error } = await client.from("profiles").update({ is_admin: true }).eq("id", userId)

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
 * @param serviceKey Optional service key for admin operations
 * @returns Success status
 */
export const revokeAdminPrivileges = async (userId: string, serviceKey?: string): Promise<boolean> => {
  try {
    // Use admin client if service key is provided
    const client = serviceKey ? createAdminClient(serviceKey) : supabase

    const { error } = await client.from("profiles").update({ is_admin: false }).eq("id", userId)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error revoking admin privileges:", error)
    return false
  }
}

export default {
  checkAdminStatus,
  grantAdminPrivileges,
  revokeAdminPrivileges,
}
