import "react-native-url-polyfill/auto"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from "@env"

// Replace with your Supabase URL and anon key
const supabaseUrl = EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = EXPO_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

/**
 * Creates a Supabase client with admin privileges.
 * IMPORTANT: This should ONLY be used server-side or in secure environments.
 * DO NOT expose the service role key in client-side code.
 *
 * @param serviceKey The Supabase service role key
 * @returns A Supabase client with admin privileges
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

// Report status types
export enum ReportStatus {
  SUBMITTED = "submitted",
  IN_PROGRESS = "in_progress",
  FIXED = "fixed",
  REJECTED = "rejected",
}

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

// Severity types
export enum SeverityLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  DANGER = "Danger",
}

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
  profiles?: Profile // Add profiles relationship
}

