import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_SAVED_STORAGE_KEY = 'khanascene.guest.savedPlaceIds.v1';

interface SavedPlacesState {
  /**
   * Permitted Google Place IDs saved by the user.
   * Per Google Maps Platform policy, we store only the Place ID reference,
   * never permanently caching restricted place content.
   */
  savedPlaceIds: string[];
  isHydrated: boolean;
  hydrateSavedPlaces: () => Promise<void>;
  toggleSavedPlace: (placeId: string) => Promise<boolean>;
  isPlaceSaved: (placeId: string) => boolean;
}

export const useSavedStore = create<SavedPlacesState>((set, get) => ({
  savedPlaceIds: [],
  isHydrated: false,
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
    return !exists;
  },
  isPlaceSaved: (placeId: string) => get().savedPlaceIds.includes(placeId),
}));
