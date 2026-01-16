import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL as string) || (globalThis as any).expo?.extra?.supabaseUrl || (require("expo-constants").default.expoConfig?.extra?.supabaseUrl);
const supabaseAnonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string) || (globalThis as any).expo?.extra?.supabaseAnonKey || (require("expo-constants").default.expoConfig?.extra?.supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key not configured. Set in app.json extra or EXPO_PUBLIC_ env vars.");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});


