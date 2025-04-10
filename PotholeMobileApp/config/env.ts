import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_STORAGE_BUCKET_NAME, EXPO_PUBLIC_SUPABASE_SECRET_KEY } from "@env";

export const SUPABASE_URL = EXPO_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = EXPO_PUBLIC_SUPABASE_ANON_KEY || "";
export const STORAGE_BUCKET_NAME = EXPO_PUBLIC_STORAGE_BUCKET_NAME || "";
export const API_TIMEOUT = 30000;
export const SUPABASE_SECRET_KEY = EXPO_PUBLIC_SUPABASE_SECRET_KEY || "";