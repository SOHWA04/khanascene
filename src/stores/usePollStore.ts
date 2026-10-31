import { create } from 'zustand';

interface PollDraftState {
  candidatePlaceIds: string[];
  addCandidate: (placeId: string) => boolean;
  removeCandidate: (placeId: string) => void;
  toggleCandidate: (placeId: string) => void;
  clearCandidates: () => void;
  isCandidateSelected: (placeId: string) => boolean;
}

export const MAX_POLL_CANDIDATES = 5;

export const usePollStore = create<PollDraftState>((set, get) => ({
  candidatePlaceIds: [],

  addCandidate: (placeId: string) => {
    const current = get().candidatePlaceIds;
    if (current.includes(placeId)) return true;
    if (current.length >= MAX_POLL_CANDIDATES) return false;
    set({ candidatePlaceIds: [...current, placeId] });
    return true;
  },

  removeCandidate: (placeId: string) => {
    set({ candidatePlaceIds: get().candidatePlaceIds.filter((id) => id !== placeId) });
  },

  toggleCandidate: (placeId: string) => {
    const current = get().candidatePlaceIds;
    if (current.includes(placeId)) {
      set({ candidatePlaceIds: current.filter((id) => id !== placeId) });
    } else {
      if (current.length < MAX_POLL_CANDIDATES) {
        set({ candidatePlaceIds: [...current, placeId] });
      }
    }
  },

  clearCandidates: () => {
    set({ candidatePlaceIds: [] });
  },

  isCandidateSelected: (placeId: string) => {
    return get().candidatePlaceIds.includes(placeId);
  },
}));
