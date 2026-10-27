import {
  communityRepository,
  validateRestaurantProposal,
  validateReviewSubmission,
} from '@/repositories/communityRepository';
import { useAuthStore } from '@/stores/useAuthStore';

describe('Phase 6 & 7 — Community Reviews, Reporting & Restaurant Proposals', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isInitializing: false,
      isSubmitting: false,
      authError: null,
    });
  });

  it('validates review ratings (1..5) and review text length (10..2000 chars)', () => {
    expect(
      validateReviewSubmission({
        googlePlaceId: 'dev-place-isb-monal-ridge',
        overallRating: 6,
        reviewText: 'Great food and service in F-7!',
      })
    ).toContain('between 1 and 5 stars');

    expect(
      validateReviewSubmission({
        googlePlaceId: 'dev-place-isb-monal-ridge',
        overallRating: 5,
        reviewText: 'Too short',
      })
    ).toContain('between 10 and 2,000 characters');

    expect(
      validateReviewSubmission({
        googlePlaceId: 'dev-place-isb-monal-ridge',
        overallRating: 5,
        foodRating: 5,
        serviceRating: 4,
        reviewText: 'Authentic Kabuli Pulao and fast service in F-7 Markaz.',
      })
    ).toBeNull();
  });

  it('requires authentication before submitting a review or restaurant proposal', async () => {
    const revRes = await communityRepository.submitReview({
      googlePlaceId: 'dev-place-isb-monal-ridge',
      overallRating: 5,
      reviewText: 'Authentic Kabuli Pulao and fast service in F-7 Markaz.',
    });
    expect(revRes.ok).toBe(false);
    expect(revRes.message).toContain('sign in');

    // Simulate signed-in user in local mode
    useAuthStore.setState({
      user: {
        id: 'user-123',
        email: 'tester@khanascene.pk',
        displayName: 'Tester',
        preferredCityId: 'islamabad',
        preferredLanguage: 'en',
      },
    });

    const authedRevRes = await communityRepository.submitReview({
      googlePlaceId: 'dev-place-isb-monal-ridge',
      overallRating: 5,
      reviewText: 'Authentic Kabuli Pulao and fast service in F-7 Markaz.',
    });
    expect(authedRevRes.ok).toBe(true);
    expect(authedRevRes.message).toContain('pending moderation');
  });

  it('validates restaurant proposals for Islamabad and Rawalpindi', () => {
    expect(
      validateRestaurantProposal({
        proposedName: 'A',
        proposedAddress: 'F-11 Markaz, Islamabad',
        proposedCityId: 'islamabad',
      })
    ).toContain('between 2 and 200 characters');

    expect(
      validateRestaurantProposal({
        proposedName: 'Dera Restaurant',
        proposedAddress: 'F-11 Markaz, Islamabad',
        proposedCityId: 'islamabad',
      })
    ).toBeNull();
  });
});
