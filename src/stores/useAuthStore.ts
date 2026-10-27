import { create } from 'zustand';
import { getSupabaseClient, isSupabaseConfigured } from '@/services/supabase/client';
import { CitySlug } from '@/types/restaurant';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  preferredCityId: CitySlug;
  preferredLanguage: string;
}

interface AuthState {
  user: UserProfile | null;
  isInitializing: boolean;
  isSubmitting: boolean;
  authError: string | null;
  initializeAuth: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUpWithEmail: (
    displayName: string,
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ ok: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isInitializing: true,
  isSubmitting: false,
  authError: null,

  initializeAuth: async () => {
    const client = getSupabaseClient();
    if (!client) {
      set({ isInitializing: false });
      return;
    }

    try {
      const {
        data: { session },
      } = await client.auth.getSession();

      if (session?.user) {
        const { data: profile } = await client
          .from('profiles')
          .select('display_name, preferred_city_id, preferred_language')
          .eq('id', session.user.id)
          .maybeSingle();

        set({
          user: {
            id: session.user.id,
            email: session.user.email ?? '',
            displayName:
              profile?.display_name ??
              session.user.user_metadata?.display_name ??
              session.user.email?.split('@')[0] ??
              'KhanaScene Member',
            preferredCityId: (profile?.preferred_city_id as CitySlug) ?? 'islamabad',
            preferredLanguage: profile?.preferred_language ?? 'en',
          },
          isInitializing: false,
        });
      } else {
        set({ user: null, isInitializing: false });
      }
    } catch {
      set({ user: null, isInitializing: false });
    }
  },

  signInWithEmail: async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@') || !password) {
      const msg = 'Please enter a valid email address and password.';
      set({ authError: msg });
      return { ok: false, error: msg };
    }

    const client = getSupabaseClient();
    if (!client) {
      const msg = isSupabaseConfigured()
        ? 'Could not initialize Supabase client.'
        : 'Supabase credentials are not configured in .env.local yet. Configure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable live sign-in.';
      set({ authError: msg });
      return { ok: false, error: msg };
    }

    set({ isSubmitting: true, authError: null });
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error || !data.user) {
        const msg = error?.message ?? 'Invalid email or password.';
        set({ isSubmitting: false, authError: msg });
        return { ok: false, error: msg };
      }

      await get().initializeAuth();
      set({ isSubmitting: false, authError: null });
      return { ok: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error during sign-in.';
      set({ isSubmitting: false, authError: msg });
      return { ok: false, error: msg };
    }
  },

  signUpWithEmail: async (displayName, email, password) => {
    const cleanName = displayName.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (cleanName.length < 2) {
      const msg = 'Please enter a display name (at least 2 characters).';
      set({ authError: msg });
      return { ok: false, error: msg };
    }
    if (!cleanEmail.includes('@')) {
      const msg = 'Please enter a valid email address.';
      set({ authError: msg });
      return { ok: false, error: msg };
    }
    if (password.length < 8) {
      const msg = 'Password must be at least 8 characters long.';
      set({ authError: msg });
      return { ok: false, error: msg };
    }

    const client = getSupabaseClient();
    if (!client) {
      const msg =
        'Supabase credentials are not configured in .env.local yet. Configure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to create a live account.';
      set({ authError: msg });
      return { ok: false, error: msg };
    }

    set({ isSubmitting: true, authError: null });
    try {
      const { data, error } = await client.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            display_name: cleanName,
          },
        },
      });

      if (error || !data.user) {
        const msg = error?.message ?? 'Unable to create account.';
        set({ isSubmitting: false, authError: msg });
        return { ok: false, error: msg };
      }

      await get().initializeAuth();
      set({ isSubmitting: false, authError: null });
      return { ok: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error during sign-up.';
      set({ isSubmitting: false, authError: msg });
      return { ok: false, error: msg };
    }
  },

  signOut: async () => {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut().catch(() => {});
    }
    set({ user: null, authError: null });
  },

  deleteAccount: async () => {
    const currentUser = get().user;
    if (!currentUser) {
      return { ok: false, error: 'You must be signed in to delete your account.' };
    }

    const client = getSupabaseClient();
    if (!client) {
      set({ user: null });
      return { ok: true };
    }

    set({ isSubmitting: true, authError: null });
    try {
      // Call the RLS-protected Postgres RPC `delete_my_account`
      const { error } = await client.rpc('delete_my_account');
      if (error) {
        set({ isSubmitting: false, authError: error.message });
        return { ok: false, error: error.message };
      }

      await client.auth.signOut().catch(() => {});
      set({ user: null, isSubmitting: false, authError: null });
      return { ok: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Account deletion failed.';
      set({ isSubmitting: false, authError: msg });
      return { ok: false, error: msg };
    }
  },
}));
