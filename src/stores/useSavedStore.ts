import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabaseClient } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/useAuthStore';

const GUEST_SAVED_STORAGE_KEY = 'khanascene.guest.savedPlaceIds.v1';

interface SavedPlacesState {
  /**
   * Permitted Google Place IDs saved by the user.
   * Per Google Maps Platform policy, we store only the Place ID reference,
   * never permanently caching restricted place content.
   */
  savedPlaceIds: string[];
  isHydrated: boolean;
  isSyncingCloud: boolean;
  hydrateSavedPlaces: () => Promise<void>;
  syncWithCloudForUser: (userId: string) => Promise<void>;
  toggleSavedPlace: (placeId: string) => Promise<boolean>;
  isPlaceSaved: (placeId: string) => boolean;
}

export const useSavedStore = create<SavedPlacesState>((set, get) => ({
  savedPlaceIds: [],
  isHydrated: false,
  isSyncingCloud: false,

  hydrateSavedPlaces: async () => {
    try {
      const raw = await AsyncStorage.getItem(GUEST_SAVED_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          set({ savedPlaceIds: parsed, isHydrated: true });
          return;
        }
      }
      set({ isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },

  syncWithCloudForUser: async (userId: string) => {
    const client = getSupabaseClient();
    if (!client || !userId) return;

    set({ isSyncingCloud: true });
    try {
      const localIds = get().savedPlaceIds;

      // 1. Upload any guest favourites to `saved_places` (idempotent on (user_id, google_place_id))
      if (localIds.length > 0) {
        const upsertRows = localIds.map((googlePlaceId) => ({
          user_id: userId,
          google_place_id: googlePlaceId,
        }));
        await client
          .from('saved_places')
          .upsert(upsertRows, { onConflict: 'user_id,google_place_id' });
      }

      // 2. Pull the merged list of saved_places for this user
      const { data } = await client
        .from('saved_places')
        .select('google_place_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data) {
        const mergedIds = Array.from(
          new Set([
            ...data.map((row: { google_place_id: string }) => row.google_place_id),
            ...localIds,
          ])
        );
        set({ savedPlaceIds: mergedIds, isSyncingCloud: false });
        await AsyncStorage.setItem(GUEST_SAVED_STORAGE_KEY, JSON.stringify(mergedIds));
        return;
      }
      set({ isSyncingCloud: false });
    } catch {
      set({ isSyncingCloud: false });
    }
  },

  toggleSavedPlace: async (placeId: string) => {
    const current = get().savedPlaceIds;
    const exists = current.includes(placeId);
    const updated = exists
      ? current.filter((id) => id !== placeId)
      : [placeId, ...current];
    set({ savedPlaceIds: updated });

    try {
      await AsyncStorage.setItem(GUEST_SAVED_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Keep in-memory state if local storage write fails
    }

    // If user is signed in and Supabase is configured, sync with `saved_places`
    const currentUser = useAuthStore.getState().user;
    const client = getSupabaseClient();
    if (currentUser && client) {
      try {
        if (exists) {
          await client
            .from('saved_places')
            .delete()
            .eq('user_id', currentUser.id)
            .eq('google_place_id', placeId);
        } else {
          await client.from('saved_places').upsert(
            {
              user_id: currentUser.id,
              google_place_id: placeId,
            },
            { onConflict: 'user_id,google_place_id' }
          );
        }
      } catch {
        // Local state remains preserved even if offline
      }
    }

    return !exists;
  },

  isPlaceSaved: (placeId: string) => get().savedPlaceIds.includes(placeId),
}));
