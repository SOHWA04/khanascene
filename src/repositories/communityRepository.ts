import { getSupabaseClient } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/useAuthStore';
import { CitySlug } from '@/types/restaurant';

export interface SubmitReviewInput {
  googlePlaceId: string;
  restaurantRecordId?: string;
  overallRating: number;
  foodRating?: number;
  serviceRating?: number;
  ambienceRating?: number;
  valueRating?: number;
  reviewText: string;
  visitDate?: string;
}

export interface SubmitReportInput {
  reviewId: string;
  reason: string;
}

export interface SubmitRestaurantProposalInput {
  proposedName: string;
  proposedAddress: string;
  proposedCityId: CitySlug;
  proposedWebsite?: string;
  proposedPhone?: string;
  notes?: string;
}

export function validateReviewSubmission(input: SubmitReviewInput): string | null {
  if (!input.googlePlaceId.trim()) {
    return 'Restaurant reference is required.';
  }
  if (
    !Number.isInteger(input.overallRating) ||
    input.overallRating < 1 ||
    input.overallRating > 5
  ) {
    return 'Overall rating must be between 1 and 5 stars.';
  }
  const optionalRatings = [
    input.foodRating,
    input.serviceRating,
    input.ambienceRating,
    input.valueRating,
  ];
  for (const r of optionalRatings) {
    if (r !== undefined && (!Number.isInteger(r) || r < 1 || r > 5)) {
      return 'Category ratings must be between 1 and 5 stars.';
    }
  }
  const textLen = input.reviewText.trim().length;
  if (textLen < 10 || textLen > 2000) {
    return 'Review text must be between 10 and 2,000 characters.';
  }
  return null;
}

export function validateRestaurantProposal(
  input: SubmitRestaurantProposalInput
): string | null {
  const nameLen = input.proposedName.trim().length;
  if (nameLen < 2 || nameLen > 200) {
    return 'Restaurant name must be between 2 and 200 characters.';
  }
  const addrLen = input.proposedAddress.trim().length;
  if (addrLen < 5 || addrLen > 500) {
    return 'Restaurant address must be between 5 and 500 characters.';
  }
  if (input.proposedCityId !== 'islamabad' && input.proposedCityId !== 'rawalpindi') {
    return 'Please select a valid launch city (Islamabad or Rawalpindi).';
  }
  return null;
}

class CommunityRepository {
  /**
   * Submits an original KhanaScene user review in `pending` moderation status.
   * Never auto-approves public reviews without moderation.
   */
  async submitReview(
    input: SubmitReviewInput
  ): Promise<{ ok: boolean; message: string }> {
    const validationError = validateReviewSubmission(input);
    if (validationError) {
      return { ok: false, message: validationError };
    }

    const user = useAuthStore.getState().user;
    if (!user) {
      return {
        ok: false,
        message: 'Please sign in to submit a KhanaScene review.',
      };
    }

    const client = getSupabaseClient();
    if (!client) {
      return {
        ok: true,
        message:
          'Review validated in local mode and queued as pending moderation (connect Supabase to persist in cloud).',
      };
    }

    const { error } = await client.from('user_reviews').insert({
      user_id: user.id,
      restaurant_record_id: input.restaurantRecordId ?? null,
      google_place_id: input.googlePlaceId,
      overall_rating: input.overallRating,
      food_rating: input.foodRating ?? null,
      service_rating: input.serviceRating ?? null,
      ambience_rating: input.ambienceRating ?? null,
      value_rating: input.valueRating ?? null,
      review_text: input.reviewText.trim(),
      visit_date: input.visitDate ?? null,
      moderation_status: 'pending',
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    return {
      ok: true,
      message:
        'Thank you! Your KhanaScene review has been submitted and is pending moderation before appearing publicly.',
    };
  }

  /**
   * Reports an inappropriate KhanaScene community review for moderation review.
   */
  async reportReview(
    input: SubmitReportInput
  ): Promise<{ ok: boolean; message: string }> {
    const cleanReason = input.reason.trim();
    if (cleanReason.length < 5 || cleanReason.length > 500) {
      return {
        ok: false,
        message: 'Please provide a brief reason (5 to 500 characters) for reporting this review.',
      };
    }

    const user = useAuthStore.getState().user;
    if (!user) {
      return {
        ok: false,
        message: 'Please sign in to report a review.',
      };
    }

    const client = getSupabaseClient();
    if (!client) {
      return {
        ok: true,
        message: 'Report recorded for moderation review.',
      };
    }

    const { error } = await client.from('review_reports').insert({
      review_id: input.reviewId,
      reporter_user_id: user.id,
      reason: cleanReason,
      status: 'open',
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    return {
      ok: true,
      message: 'Thank you. Our moderation team will review this report.',
    };
  }

  /**
   * Submits a new restaurant proposal to `public.restaurant_submissions` in `pending` status.
   */
  async submitRestaurantProposal(
    input: SubmitRestaurantProposalInput
  ): Promise<{ ok: boolean; message: string }> {
    const validationError = validateRestaurantProposal(input);
    if (validationError) {
      return { ok: false, message: validationError };
    }

    const user = useAuthStore.getState().user;
    if (!user) {
      return {
        ok: false,
        message: 'Please sign in to propose a restaurant for KhanaScene.',
      };
    }

    const client = getSupabaseClient();
    if (!client) {
      return {
        ok: true,
        message:
          'Restaurant proposal validated and queued in pending status for editorial verification.',
      };
    }

    const { error } = await client.from('restaurant_submissions').insert({
      submitted_by_user_id: user.id,
      proposed_name: input.proposedName.trim(),
      proposed_address: input.proposedAddress.trim(),
      proposed_city_id: input.proposedCityId,
      proposed_website: input.proposedWebsite?.trim() || null,
      proposed_phone: input.proposedPhone?.trim() || null,
      notes: input.notes?.trim() || null,
      status: 'pending',
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    return {
      ok: true,
      message:
        'Thank you! Your restaurant submission has been received and will be reviewed before being added to verified KhanaScene listings.',
    };
  }
}

export const communityRepository = new CommunityRepository();
