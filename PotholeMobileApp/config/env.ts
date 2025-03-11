import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_STORAGE_BUCKET_NAME } from "@env";

// Supabase Configuration
export const SUPABASE_URL = EXPO_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = EXPO_PUBLIC_SUPABASE_ANON_KEY || "";
// Storage Configuration
export const STORAGE_BUCKET_NAME = EXPO_PUBLIC_STORAGE_BUCKET_NAME || "";
// API Configuration
export const API_TIMEOUT = 30000; // 30 seconds