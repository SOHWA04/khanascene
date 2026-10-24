import { create } from 'zustand';
import { APP_CONFIG, INITIAL_CITIES } from '@/config';
import { CitySlug } from '@/types/restaurant';

interface PreferencesState {
  selectedCity: CitySlug;
  selectedAreaId: string | null;
  locationPermissionGranted: boolean;
  userCoordinates: { latitude: number; longitude: number } | null;
  setCity: (city: CitySlug) => void;
  setArea: (areaId: string | null) => void;
  setLocationState: (
    granted: boolean,
    coords?: { latitude: number; longitude: number } | null
  ) => void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  selectedCity: APP_CONFIG.defaultCity,
  selectedAreaId: null,
  locationPermissionGranted: false,
  userCoordinates: null,
  setCity: (city) =>
    set(() => ({
      selectedCity: INITIAL_CITIES[city] ? city : 'islamabad',
      selectedAreaId: null,
    })),
  setArea: (areaId) => set(() => ({ selectedAreaId: areaId })),
  setLocationState: (granted, coords = null) =>
    set(() => ({
      locationPermissionGranted: granted,
      userCoordinates: coords,
    })),
}));
