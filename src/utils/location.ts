import * as Location from 'expo-location';
import { usePreferencesStore } from '@/stores/usePreferencesStore';

/**
 * Requests foreground location permission ONLY when the user explicitly selects
 * a location-dependent feature ("Near Me" filter or "Nearest" sort).
 * If denied, manual city and area selection remain fully functional.
 */
export async function requestOnDemandUserLocation(): Promise<{
  granted: boolean;
  coords: { latitude: number; longitude: number } | null;
  errorMessage?: string;
}> {
  const setLocationState = usePreferencesStore.getState().setLocationState;

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationState(false, null);
      return {
        granted: false,
        coords: null,
        errorMessage:
          'Location permission was not granted. You can still browse all restaurants using city and neighbourhood filters.',
      };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    setLocationState(true, coords);
    return { granted: true, coords };
  } catch {
    setLocationState(false, null);
    return {
      granted: false,
      coords: null,
      errorMessage:
        'Could not determine your device location. Showing results for your selected city.',
    };
  }
}
