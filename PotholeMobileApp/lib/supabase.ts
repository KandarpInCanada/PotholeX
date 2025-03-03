import "react-native-url-polyfill/auto"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"

// Replace with your Supabase URL and anon key
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Report status types
export enum ReportStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  IN_PROGRESS = 'in_progress',
  FIXED = 'fixed',
  REJECTED = 'rejected',
}

// Add Profile interface
export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Severity types
export enum SeverityLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  DANGER = 'Danger',
}


// Update PotholeReport interface
export interface PotholeReport {
  id?: string;
  user_id?: string;
  images: string[];
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  category: string;
  severity: SeverityLevel;
  road_condition: string;
  status: ReportStatus;
  created_at?: string;
  updated_at?: string;
  likes?: number;
  comments?: number;
  profiles?: Profile; // Add profiles relationship
}
