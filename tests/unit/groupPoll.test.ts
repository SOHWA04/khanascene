import { pollRepository } from '@/repositories/pollRepository';
import { usePollStore, MAX_POLL_CANDIDATES } from '@/stores/usePollStore';

describe('Group Voting Poll ("Scene Decider")', () => {
  beforeEach(() => {
    usePollStore.getState().clearCandidates();
  });

  it('manages candidate shortlist with up to 5 restaurants', () => {
    const store = usePollStore.getState();

    expect(store.addCandidate('place-1')).toBe(true);
    expect(store.addCandidate('place-2')).toBe(true);
    expect(store.addCandidate('place-3')).toBe(true);
    expect(store.addCandidate('place-4')).toBe(true);
    expect(store.addCandidate('place-5')).toBe(true);

    // 6th candidate exceeds limit of 5
    expect(store.addCandidate('place-6')).toBe(false);
    expect(usePollStore.getState().candidatePlaceIds.length).toBe(MAX_POLL_CANDIDATES);

    // Toggle removes if already present
    store.toggleCandidate('place-1');
    expect(usePollStore.getState().candidatePlaceIds.includes('place-1')).toBe(false);
    expect(usePollStore.getState().candidatePlaceIds.length).toBe(4);
  });

  it('creates a group poll, records votes from friends, and tallies correctly', async () => {
    const candidateIds = [
      'ks-curated-cheezious-f7',
      'ks-curated-the-monal-restaurant-margalla',
      'ks-curated-savour-foods-blue-area',
    ];

    const poll = await pollRepository.createPoll({
      title: 'Friday Hostel Scene 🍕',
      creatorName: 'Ali',
      candidatePlaceIds: candidateIds,
    });

    expect(poll.id).toBeDefined();
    expect(poll.title).toBe('Friday Hostel Scene 🍕');
    expect(poll.status).toBe('active');
    expect(poll.candidatePlaceIds.length).toBe(3);

    // Friend 1 votes for Cheezious
    await pollRepository.castVote({
      pollId: poll.id,
      voterName: 'Ali',
      selectedPlaceId: 'ks-curated-cheezious-f7',
    });

    // Friend 2 votes for Cheezious
    await pollRepository.castVote({
      pollId: poll.id,
      voterName: 'Saad',
      selectedPlaceId: 'ks-curated-cheezious-f7',
    });

    // Friend 3 votes for Monal
    await pollRepository.castVote({
      pollId: poll.id,
      voterName: 'Hamza',
      selectedPlaceId: 'ks-curated-the-monal-restaurant-margalla',
    });

    // Retrieve details & tallies
    const details = await pollRepository.getPollWithDetails(poll.id);
    expect(details).not.toBeNull();
    if (!details) return;

    expect(details.totalVotes).toBe(3);

    const cheeziousTally = details.tallies.find((t) => t.placeId === 'ks-curated-cheezious-f7');
    expect(cheeziousTally?.voteCount).toBe(2);
    expect(cheeziousTally?.percentage).toBe(67); // 2/3 = 67%
    expect(cheeziousTally?.voters).toContain('Ali');
    expect(cheeziousTally?.voters).toContain('Saad');

    const monalTally = details.tallies.find(
      (t) => t.placeId === 'ks-curated-the-monal-restaurant-margalla'
    );
    expect(monalTally?.voteCount).toBe(1);
    expect(monalTally?.percentage).toBe(33); // 1/3 = 33%
    expect(monalTally?.voters).toContain('Hamza');

    // Winning candidate is the current leader
    expect(details.winningCandidate?.placeId).toBe('ks-curated-cheezious-f7');

    // Close poll and lock in winner
    await pollRepository.closePoll(poll.id, 'ks-curated-cheezious-f7');
    const closedDetails = await pollRepository.getPollWithDetails(poll.id);
    expect(closedDetails?.poll.status).toBe('closed');
    expect(closedDetails?.poll.winnerPlaceId).toBe('ks-curated-cheezious-f7');
  });
});
