import { create } from 'zustand';
import { APP_CONFIG } from '@/config';

interface ComparisonState {
  selectedPlaceIds: string[];
  toggleComparisonPlace: (placeId: string) => { added: boolean; limitReached: boolean };
  removeComparisonPlace: (placeId: string) => void;
  clearComparison: () => void;
}

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  selectedPlaceIds: [],
  toggleComparisonPlace: (placeId) => {
    const current = get().selectedPlaceIds;
    if (current.includes(placeId)) {
      set({ selectedPlaceIds: current.filter((id) => id !== placeId) });
      return { added: false, limitReached: false };
    }
    if (current.length >= APP_CONFIG.maxComparisonItems) {
      return { added: false, limitReached: true };
    }
    set({ selectedPlaceIds: [...current, placeId] });
    return { added: true, limitReached: false };
  },
  removeComparisonPlace: (placeId) =>
    set((state) => ({
      selectedPlaceIds: state.selectedPlaceIds.filter((id) => id !== placeId),
    })),
  clearComparison: () => set({ selectedPlaceIds: [] }),
}));
