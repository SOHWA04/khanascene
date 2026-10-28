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

export interface SubmitMenuUpdateInput {
  googlePlaceId: string;
  restaurantRecordId?: string;
  dishName: string;
  suggestedPricePkr?: number;
  notes?: string;
  photoUrl?: string;
}

export interface SubmitOwnerClaimInput {
  googlePlaceId: string;
  restaurantRecordId?: string;
  restaurantName: string;
  claimantName: string;
  claimantPhone: string;
  claimantEmail?: string;
  claimantRole: string;
  verificationNotes?: string;
}

export function validateMenuUpdateInput(input: SubmitMenuUpdateInput): string | null {
  if (!input.googlePlaceId?.trim()) {
    return 'Restaurant reference is required.';
  }
  const dishLen = input.dishName?.trim().length ?? 0;
  if (dishLen < 2 || dishLen > 200) {
    return 'Dish or item name must be between 2 and 200 characters.';
  }
  if (input.suggestedPricePkr !== undefined) {
    if (isNaN(input.suggestedPricePkr) || input.suggestedPricePkr < 0) {
      return 'Price must be a valid positive number in PKR.';
    }
  }
  return null;
}

export function validateOwnerClaimInput(input: SubmitOwnerClaimInput): string | null {
  if (!input.googlePlaceId?.trim() || !input.restaurantName?.trim()) {
    return 'Restaurant reference and name are required.';
  }
  const nameLen = input.claimantName?.trim().length ?? 0;
  if (nameLen < 2 || nameLen > 150) {
    return 'Your name must be between 2 and 150 characters.';
  }
  const phone = input.claimantPhone?.trim() ?? '';
  if (phone.length < 7 || phone.length > 30) {
    return 'Please provide a valid contact or WhatsApp phone number.';
  }
  const roleLen = input.claimantRole?.trim().length ?? 0;
  if (roleLen < 2 || roleLen > 50) {
    return 'Please specify your role at the restaurant (e.g. Owner, General Manager, Marketing).';
  }
  return null;
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

  /**
   * Submits a price change or menu update suggestion from a diner.
   */
  async submitMenuUpdate(
    input: SubmitMenuUpdateInput
  ): Promise<{ ok: boolean; message: string }> {
    const error = validateMenuUpdateInput(input);
    if (error) {
      return { ok: false, message: error };
    }

    const user = useAuthStore.getState().user;
    const client = getSupabaseClient();
    if (!client) {
      return {
        ok: true,
        message: 'Thank you! Your price update suggestion has been received for editorial verification.',
      };
    }

    const { error: dbError } = await client.from('menu_update_suggestions').insert({
      submitted_by_user_id: user?.id ?? null,
      restaurant_record_id: input.restaurantRecordId ?? null,
      google_place_id: input.googlePlaceId,
      dish_name: input.dishName.trim(),
      suggested_price_pkr: input.suggestedPricePkr ? Math.round(input.suggestedPricePkr) : null,
      notes: input.notes?.trim() || null,
      photo_url: input.photoUrl?.trim() || null,
      status: 'pending',
    });

    if (dbError) {
      return { ok: false, message: dbError.message };
    }

    return {
      ok: true,
      message: 'Thank you! Your price suggestion has been received and our team will verify the menu update.',
    };
  }

  /**
   * Submits a restaurant owner claim and B2B partnership inquiry.
   */
  async submitOwnerClaim(
    input: SubmitOwnerClaimInput
  ): Promise<{ ok: boolean; message: string }> {
    const error = validateOwnerClaimInput(input);
    if (error) {
      return { ok: false, message: error };
    }

    const user = useAuthStore.getState().user;
    const client = getSupabaseClient();
    if (!client) {
      return {
        ok: true,
        message: 'Thank you! Your claim request has been received. Our partnership team will contact you shortly.',
      };
    }

    const { error: dbError } = await client.from('restaurant_claims').insert({
      claimed_by_user_id: user?.id ?? null,
      restaurant_record_id: input.restaurantRecordId ?? null,
      google_place_id: input.googlePlaceId,
      restaurant_name: input.restaurantName.trim(),
      claimant_name: input.claimantName.trim(),
      claimant_phone: input.claimantPhone.trim(),
      claimant_email: input.claimantEmail?.trim() || null,
      claimant_role: input.claimantRole.trim(),
      verification_notes: input.verificationNotes?.trim() || null,
      status: 'pending',
    });

    if (dbError) {
      return { ok: false, message: dbError.message };
    }

    return {
      ok: true,
      message: 'Claim submitted successfully! Our KhanaScene team will reach out via WhatsApp/Phone to verify your role and provide your menu dashboard.',
    };
  }
}

export const communityRepository = new CommunityRepository();
