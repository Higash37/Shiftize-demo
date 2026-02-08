import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = process.env['EXPO_PUBLIC_SUPABASE_URL'] || "";
const SUPABASE_ANON_KEY = process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'] || "";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error(
        "Supabase URL and Anon Key must be set via EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY"
      );
    }
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        // React Native環境ではAsyncStorageでセッション永続化
        storage: Platform.OS !== "web" ? AsyncStorage : undefined,
        // React Native環境ではURL検出を無効化
        detectSessionInUrl: Platform.OS === "web",
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }
  return supabaseInstance;
}
