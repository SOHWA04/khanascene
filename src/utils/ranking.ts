/**
 * Deterministic, non-AI ranking and formatting helpers for KhanaScene.
 *
 * Principle:
 * - Never combine Google ratings and KhanaScene ratings into one synthetic number.
 * - Use Bayesian-adjusted scoring strictly on compatible ratings from the same source and scale.
 */

import { GooglePriceLevel } from '@/types/restaurant';

export interface BayesianScoreParams {
  /** R: The restaurant's average KhanaScene rating (1.0 to 5.0) */
  averageRating: number;
  /** v: Number of eligible KhanaScene ratings */
  reviewCount: number;
  /** m: Configurable minimum-review threshold (default 5) */
  minimumReviewsThreshold?: number;
  /** C: Overall average across the KhanaScene review dataset (default 3.8) */
  datasetMeanRating?: number;
}

/**
 * Calculates the Bayesian-adjusted score:
 * Adjusted score = (v / (v + m)) * R + (m / (v + m)) * C
 */
export function calculateBayesianScore({
  averageRating,
  reviewCount,
  minimumReviewsThreshold = 5,
  datasetMeanRating = 3.8,
}: BayesianScoreParams): number {
  if (reviewCount <= 0 || averageRating <= 0) {
    return 0;
  }
  const v = reviewCount;
  const m = Math.max(1, minimumReviewsThreshold);
  const R = Math.min(5, Math.max(1, averageRating));
  const C = Math.min(5, Math.max(1, datasetMeanRating));

  const adjusted = (v / (v + m)) * R + (m / (v + m)) * C;
  return Math.round(adjusted * 100) / 100;
}

/**
 * Formats Google PriceLevel into honest, non-fabricated labels.
 */
export function formatGooglePriceLevel(priceLevel?: GooglePriceLevel): string {
  switch (priceLevel) {
    case 'PRICE_LEVEL_FREE':
      return 'Free';
    case 'PRICE_LEVEL_INEXPENSIVE':
      return 'Rs • Budget Friendly';
    case 'PRICE_LEVEL_MODERATE':
      return 'Rs Rs • Moderate';
    case 'PRICE_LEVEL_EXPENSIVE':
      return 'Rs Rs Rs • Fine Dining';
    case 'PRICE_LEVEL_VERY_EXPENSIVE':
      return 'Rs Rs Rs Rs • Luxury';
    default:
      return 'Price level unavailable';
  }
}

/**
 * Formats a verified PKR price range from KhanaScene-owned menu records.
 */
export function formatPkrRange(minPkr?: number, maxPkr?: number): string {
  if (minPkr == null && maxPkr == null) {
    return 'Price range unavailable';
  }
  if (minPkr != null && maxPkr != null) {
    return `Rs ${minPkr.toLocaleString('en-PK')} – Rs ${maxPkr.toLocaleString('en-PK')}`;
  }
  if (minPkr != null) {
    return `From Rs ${minPkr.toLocaleString('en-PK')}`;
  }
  return `Up to Rs ${maxPkr!.toLocaleString('en-PK')}`;
}
