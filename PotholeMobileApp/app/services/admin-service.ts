/**
 * Admin Service
 *
 * Provides functionality for admin-related operations including:
 * - Checking if a user has admin privileges
 * - Granting admin privileges to users
 * - Revoking admin privileges from users
 *
 * This service handles the security-sensitive operations related to
 * admin access and should be used with appropriate authorization checks.
 */

import { supabase, createAdminClient } from "../../lib/supabase"

/**
 * Checks if a user has admin privileges
 *
 * Queries the profiles table to determine if the specified user
 * has the is_admin flag set to true.
 *
 * @param userId - The user ID to check for admin status
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

    console.log("Admin status data:", data)
    return data && data.length > 0 && data[0]?.is_admin === true
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

/**
 * Grants admin privileges to a user
 *
 * Updates the profiles table to set the is_admin flag to true for the
 * specified user. This operation should only be performed by existing admins
 * or through a secure service key.
 *
 * @param userId - The user ID to grant admin privileges to
 * @param serviceKey - Optional service key for admin operations
 * @returns Boolean indicating success or failure
 */
export const grantAdminPrivileges = async (userId: string, serviceKey?: string): Promise<boolean> => {
  try {
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
 * Revokes admin privileges from a user
 *
 * Updates the profiles table to set the is_admin flag to false for the
 * specified user. This operation should only be performed by existing admins
 * or through a secure service key.
 *
 * @param userId - The user ID to revoke admin privileges from
 * @param serviceKey - Optional service key for admin operations
 * @returns Boolean indicating success or failure
 */
export const revokeAdminPrivileges = async (userId: string, serviceKey?: string): Promise<boolean> => {
  try {
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
