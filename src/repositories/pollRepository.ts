import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabaseClient } from '@/services/supabase/client';
import { GroupPoll, GroupPollWithDetails, PollTallyItem, PollVote } from '@/types/poll';
import { restaurantRepository } from '@/repositories/restaurantRepository';
import { RestaurantDiscoveryItem } from '@/types/restaurant';

const LOCAL_POLLS_KEY = 'khanascene.localPolls.v1';
const LOCAL_VOTES_KEY = 'khanascene.localVotes.v1';

export class PollRepository {
  /**
   * Creates a new group voting poll with 2 to 5 candidates.
   */
  async createPoll(params: {
    title: string;
    creatorName: string;
    candidatePlaceIds: string[];
  }): Promise<GroupPoll> {
    const { title, creatorName, candidatePlaceIds } = params;
    const client = getSupabaseClient();

    const newPoll: GroupPoll = {
      id: `poll-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim().length > 0 ? title.trim() : 'KhanaScene Group Poll',
      creatorName: creatorName.trim().length > 0 ? creatorName.trim() : 'Organizer',
      status: 'active',
      candidatePlaceIds,
      winnerPlaceId: null,
      createdAt: new Date().toISOString(),
    };

    if (client) {
      try {
        const { data, error } = await client
          .from('group_polls')
          .insert({
            title: newPoll.title,
            creator_name: newPoll.creatorName,
            status: newPoll.status,
            candidate_place_ids: newPoll.candidatePlaceIds,
          })
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            title: data.title,
            creatorName: data.creator_name,
            status: data.status,
            candidatePlaceIds: data.candidate_place_ids,
            winnerPlaceId: data.winner_place_id,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (err) {
        console.warn('Supabase createPoll error, falling back to local cache:', err);
      }
    }

    // Local fallback
    await this.saveLocalPoll(newPoll);
    return newPoll;
  }

  /**
   * Retrieves a poll with all candidate restaurants, votes, and live tallies.
   */
  async getPollWithDetails(pollId: string): Promise<GroupPollWithDetails | null> {
    const client = getSupabaseClient();
    let poll: GroupPoll | null = null;
    let votes: PollVote[] = [];

    if (client) {
      try {
        const { data: pollData, error: pollError } = await client
          .from('group_polls')
          .select('*')
          .eq('id', pollId)
          .maybeSingle();

        if (!pollError && pollData) {
          poll = {
            id: pollData.id,
            title: pollData.title,
            creatorName: pollData.creator_name,
            status: pollData.status,
            candidatePlaceIds: pollData.candidate_place_ids,
            winnerPlaceId: pollData.winner_place_id,
            createdAt: pollData.created_at,
            updatedAt: pollData.updated_at,
          };

          const { data: votesData } = await client
            .from('poll_votes')
            .select('*')
            .eq('poll_id', pollId);

          if (votesData) {
            votes = votesData.map((v) => ({
              id: v.id,
              pollId: v.poll_id,
              voterName: v.voter_name,
              selectedPlaceId: v.selected_place_id,
              createdAt: v.created_at,
            }));
          }
        }
      } catch (err) {
        console.warn('Supabase getPoll error, falling back to local storage:', err);
      }
    }

    // Local fallback if Supabase did not return poll
    if (!poll) {
      poll = await this.getLocalPoll(pollId);
      votes = await this.getLocalVotes(pollId);
    }

    // Interactive Demo fallback for test & preview links
    if (!poll && (pollId.toLowerCase().includes('demo') || pollId.toLowerCase().includes('sample') || pollId.toLowerCase().includes('test'))) {
      const isWinnerDemo = pollId.toLowerCase().includes('winner');
      poll = {
        id: pollId,
        title: 'Friday Night Group Scene 🍕',
        creatorName: 'Hamza',
        status: isWinnerDemo ? 'closed' : 'active',
        winnerPlaceId: isWinnerDemo ? 'ks-curated-cheezious-f7' : undefined,
        candidatePlaceIds: [
          'ks-curated-cheezious-f7',
          'ks-curated-the-monal-restaurant-margalla',
          'ks-curated-savour-foods-blue-area',
          'ks-curated-howdy-f7',
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      votes = [
        {
          id: 'v-1',
          pollId,
          voterName: 'Hamza (Organizer)',
          selectedPlaceId: 'ks-curated-cheezious-f7',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'v-2',
          pollId,
          voterName: 'Saad',
          selectedPlaceId: 'ks-curated-cheezious-f7',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'v-3',
          pollId,
          voterName: 'Fatima',
          selectedPlaceId: 'ks-curated-the-monal-restaurant-margalla',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'v-4',
          pollId,
          voterName: 'Bilal',
          selectedPlaceId: 'ks-curated-savour-foods-blue-area',
          createdAt: new Date().toISOString(),
        },
      ];
    }

    if (!poll) return null;

    // Fetch candidate restaurant details
    const candidatePromises = poll.candidatePlaceIds.map(async (placeId) => {
      try {
        const item = await restaurantRepository.getRestaurantByPlaceId(placeId);
        if (item) return item;
      } catch {}

      const cleanName = placeId
        .replace(/^ks-(curated-)?/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      return {
        placeId,
        googleData: {
          placeId,
          name: cleanName,
          formattedAddress: 'Islamabad / Rawalpindi',
          primaryCategory: 'Restaurant',
          googleRating: 4.5,
          userRatingCount: 150,
          googleMapsUri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanName)}`,
        },
      } as unknown as RestaurantDiscoveryItem;
    });

    const candidateResults = await Promise.all(candidatePromises);
    const validCandidates = candidateResults.filter((c): c is RestaurantDiscoveryItem => c !== null);

    // Compute tallies
    const totalVotes = votes.length;
    const tallies: PollTallyItem[] = validCandidates.map((candidate) => {
      const candidateVotes = votes.filter((v) => v.selectedPlaceId === candidate.placeId);
      const voteCount = candidateVotes.length;
      const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
      const voters = candidateVotes.map((v) => v.voterName);

      return {
        placeId: candidate.placeId,
        restaurant: candidate,
        voteCount,
        percentage,
        voters,
      };
    });

    // Sort tallies by vote count descending
    tallies.sort((a, b) => b.voteCount - a.voteCount);

    const winningCandidate =
      poll.winnerPlaceId
        ? validCandidates.find((c) => c.placeId === poll?.winnerPlaceId) ?? null
        : tallies.length > 0 && totalVotes > 0
        ? tallies[0].restaurant
        : null;

    return {
      poll,
      candidates: validCandidates,
      votes,
      tallies,
      totalVotes,
      winningCandidate,
    };
  }

  /**
   * Casts a vote from a friend or changes an existing vote.
   */
  async castVote(params: {
    pollId: string;
    voterName: string;
    selectedPlaceId: string;
  }): Promise<PollVote> {
    const { pollId, voterName, selectedPlaceId } = params;
    const client = getSupabaseClient();
    const cleanName = voterName.trim().length > 0 ? voterName.trim() : 'Anonymous Foodie';

    const newVote: PollVote = {
      id: `vote-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pollId,
      voterName: cleanName,
      selectedPlaceId,
      createdAt: new Date().toISOString(),
    };

    if (client) {
      try {
        const { data, error } = await client
          .from('poll_votes')
          .upsert(
            {
              poll_id: pollId,
              voter_name: cleanName,
              selected_place_id: selectedPlaceId,
            },
            { onConflict: 'poll_id,voter_name' }
          )
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            pollId: data.poll_id,
            voterName: data.voter_name,
            selectedPlaceId: data.selected_place_id,
            createdAt: data.created_at,
          };
        }
      } catch (err) {
        console.warn('Supabase castVote error, falling back to local:', err);
      }
    }

    await this.saveLocalVote(newVote);
    return newVote;
  }

  /**
   * Closes a poll and locks in the final winner.
   */
  async closePoll(pollId: string, winnerPlaceId?: string): Promise<boolean> {
    const client = getSupabaseClient();

    if (client) {
      try {
        const { error } = await client
          .from('group_polls')
          .update({
            status: 'closed',
            winner_place_id: winnerPlaceId ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pollId);

        if (!error) return true;
      } catch (err) {
        console.warn('Supabase closePoll error, updating local:', err);
      }
    }

    const poll = await this.getLocalPoll(pollId);
    if (poll) {
      poll.status = 'closed';
      poll.winnerPlaceId = winnerPlaceId ?? null;
      await this.saveLocalPoll(poll);
      return true;
    }
    return false;
  }

  // Local storage helpers
  private async getLocalPoll(pollId: string): Promise<GroupPoll | null> {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_POLLS_KEY);
      if (!raw) return null;
      const list: GroupPoll[] = JSON.parse(raw);
      return list.find((p) => p.id === pollId) ?? null;
    } catch {
      return null;
    }
  }

  private async saveLocalPoll(poll: GroupPoll): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_POLLS_KEY);
      const list: GroupPoll[] = raw ? JSON.parse(raw) : [];
      const updated = [poll, ...list.filter((p) => p.id !== poll.id)];
      await AsyncStorage.setItem(LOCAL_POLLS_KEY, JSON.stringify(updated));
    } catch {}
  }

  private async getLocalVotes(pollId: string): Promise<PollVote[]> {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_VOTES_KEY);
      if (!raw) return [];
      const list: PollVote[] = JSON.parse(raw);
      return list.filter((v) => v.pollId === pollId);
    } catch {
      return [];
    }
  }

  private async saveLocalVote(vote: PollVote): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_VOTES_KEY);
      const list: PollVote[] = raw ? JSON.parse(raw) : [];
      // Replace existing vote by same voter if any
      const filtered = list.filter(
        (v) => !(v.pollId === vote.pollId && v.voterName.toLowerCase() === vote.voterName.toLowerCase())
      );
      filtered.push(vote);
      await AsyncStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify(filtered));
    } catch {}
  }
}

export const pollRepository = new PollRepository();
