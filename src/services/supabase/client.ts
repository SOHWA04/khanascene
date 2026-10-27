import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { APP_CONFIG } from '@/config';

/**
 * Checks whether a real Supabase URL and anon key have been configured in `.env.local`.
 * Never uses a service-role key on the client.
 */
export function isSupabaseConfigured(): boolean {
  const url = APP_CONFIG.supabaseUrl;
  const key = APP_CONFIG.supabaseAnonKey;
  return (
    Boolean(url) &&
    Boolean(key) &&
    !url.includes('your-project-ref.supabase.co') &&
    key !== 'your-public-anon-key'
  );
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      APP_CONFIG.supabaseUrl,
      APP_CONFIG.supabaseAnonKey,
      {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      }
    );
  }
  return supabaseInstance;
}
