import { RestaurantDiscoveryItem } from './restaurant';

export type PollStatus = 'active' | 'closed';

export interface GroupPoll {
  id: string;
  title: string;
  creatorName: string;
  status: PollStatus;
  candidatePlaceIds: string[];
  winnerPlaceId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface PollVote {
  id: string;
  pollId: string;
  voterName: string;
  selectedPlaceId: string;
  createdAt: string;
}

export interface PollTallyItem {
  placeId: string;
  restaurant: RestaurantDiscoveryItem;
  voteCount: number;
  percentage: number;
  voters: string[];
}

export interface GroupPollWithDetails {
  poll: GroupPoll;
  candidates: RestaurantDiscoveryItem[];
  votes: PollVote[];
  tallies: PollTallyItem[];
  totalVotes: number;
  winningCandidate?: RestaurantDiscoveryItem | null;
}
