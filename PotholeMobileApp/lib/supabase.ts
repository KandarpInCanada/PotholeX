/**
 * Supabase Client Module
 *
 * This module initializes and exports the Supabase client for database operations.
 * It also defines core interfaces and enums used throughout the application.
 *
 * The module provides:
 * - Standard client for authenticated user operations
 * - Admin client factory for privileged operations
 * - Type definitions for database entities
 */

import "react-native-url-polyfill/auto"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from "@env"

const supabaseUrl = EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = EXPO_PUBLIC_SUPABASE_ANON_KEY

/**
 * Primary Supabase client instance
 *
 * Configured with:
 * - AsyncStorage for session persistence
 * - Automatic token refresh
 * - Session persistence enabled
 * - URL detection disabled (not needed in React Native)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

/**
 * Creates a Supabase client with admin privileges
 *
 * SECURITY WARNING: This should ONLY be used server-side or in secure environments.
 * The service role key grants full database access and should never be exposed
 * in client-side code or included in app bundles.
 *
 * This client is configured with:
 * - Token refresh disabled (not needed for service role)
 * - Session persistence disabled (stateless operation)
 *
 * @param {string} serviceKey - The Supabase service role key
 * @returns {SupabaseClient} A Supabase client with admin privileges
 */
export const createAdminClient = (serviceKey: string) => {
  if (!serviceKey) {
    console.error("No service key provided for admin client")
    // Return regular client as fallback
    return supabase
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Enum defining all possible pothole report statuses
 *
 * These status values are used in the database and throughout the application
 * to track the lifecycle of a pothole report.
 */
// Report status types
export enum ReportStatus {
  SUBMITTED = "submitted",
  IN_PROGRESS = "in_progress",
  FIXED = "fixed",
  REJECTED = "rejected",
}

/**
 * Interface representing a user profile in the database
 *
 * Maps to the 'profiles' table structure and includes all user attributes
 * that may be accessed throughout the application.
 */
// Add Profile interface
export interface Profile {
  id: string
  username: string
  full_name?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
  is_admin?: boolean
}

/**
 * Enum defining pothole severity levels
 *
 * These values represent the assessed danger level of reported potholes
 * and affect prioritization and display throughout the application.
 */
// Severity types
export enum SeverityLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  DANGER = "Danger",
}

/**
 * Interface representing a pothole report in the database
 *
 * Maps to the 'reports' table structure and includes all report attributes.
 * This interface is used for type safety when working with report data
 * throughout the application.
 *
 * Note: The optional fields (marked with ?) are typically populated by the
 * database or may be absent in new report creation.
 */
// Update PotholeReport interface
export interface PotholeReport {
  id?: string
  user_id?: string
  images: string[]
  location: string
  latitude: number
  longitude: number
  description: string
  category: string
  severity: SeverityLevel
  road_condition: string
  status: ReportStatus
  created_at?: string
  updated_at?: string
  likes?: number
  comments?: number
  admin_notes?: string
  profiles?: Profile
}
