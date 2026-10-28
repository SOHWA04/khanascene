import {
  communityRepository,
  validateMenuUpdateInput,
  validateOwnerClaimInput,
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

  it('validates menu update suggestions from diners', async () => {
    expect(
      validateMenuUpdateInput({
        googlePlaceId: 'dev-place-isb-monal-ridge',
        dishName: '',
      })
    ).toContain('between 2 and 200 characters');

    expect(
      validateMenuUpdateInput({
        googlePlaceId: 'dev-place-isb-monal-ridge',
        dishName: 'Special Mutton Karahi',
        suggestedPricePkr: -100,
      })
    ).toContain('positive number');

    expect(
      validateMenuUpdateInput({
        googlePlaceId: 'dev-place-isb-monal-ridge',
        dishName: 'Special Mutton Karahi',
        suggestedPricePkr: 2650,
      })
    ).toBeNull();

    const result = await communityRepository.submitMenuUpdate({
      googlePlaceId: 'dev-place-isb-monal-ridge',
      dishName: 'Special Mutton Karahi',
      suggestedPricePkr: 2650,
      notes: 'Price increased on recent dine-in bill',
    });
    expect(result.ok).toBe(true);
    expect(result.message).toContain('price update suggestion has been received');
  });

  it('validates restaurant owner claim submissions and contact information', async () => {
    expect(
      validateOwnerClaimInput({
        googlePlaceId: 'dev-place-isb-monal-ridge',
        restaurantName: 'Kabul Restaurant',
        claimantName: 'A',
        claimantPhone: '0300-1234567',
        claimantRole: 'Owner',
      })
    ).toContain('between 2 and 150 characters');

    expect(
      validateOwnerClaimInput({
        googlePlaceId: 'dev-place-isb-monal-ridge',
        restaurantName: 'Kabul Restaurant',
        claimantName: 'Asim Chaudhry',
        claimantPhone: '123',
        claimantRole: 'Owner',
      })
    ).toContain('contact or WhatsApp phone number');

    expect(
      validateOwnerClaimInput({
        googlePlaceId: 'dev-place-isb-monal-ridge',
        restaurantName: 'Kabul Restaurant',
        claimantName: 'Asim Chaudhry',
        claimantPhone: '0300-1234567',
        claimantRole: 'General Manager',
        verificationNotes: 'Want to update official menu and add weekend brunch specials',
      })
    ).toBeNull();

    const claimResult = await communityRepository.submitOwnerClaim({
      googlePlaceId: 'dev-place-isb-monal-ridge',
      restaurantName: 'Kabul Restaurant',
      claimantName: 'Asim Chaudhry',
      claimantPhone: '0300-1234567',
      claimantRole: 'General Manager',
    });
    expect(claimResult.ok).toBe(true);
    expect(claimResult.message).toContain('claim request has been received');
  });
});
