# KhanaScene — API Configuration & Policy Compliance

## 1. Google Places API (New) Configuration

KhanaScene uses **Google Places API (New)** (`https://places.googleapis.com/v1/places:...`) via a controlled backend proxy (`supabase/functions/places-proxy`).

### Required Google Cloud Setup

1. Create or select a Google Cloud Project with billing enabled and budget alerts configured.
2. Enable **Places API (New)** in Google Cloud Console.
3. Create a restricted Server API Key for the Supabase Edge Function:
   - Restrict API key to **Places API (New)** only.
   - Store the key in Supabase secrets:
     ```bash
     supabase secrets set GOOGLE_PLACES_API_KEY=your_restricted_server_key
     ```

### Field Mask Discipline (Cost Control)

Google Places API (New) bills per request based on the highest SKU triggered by the `X-Goog-FieldMask` header. Our backend proxy enforces strict field masks:

- **Search List Requests (`places:searchText` / `places:searchNearby`)**:
  - FieldMask: `places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.primaryTypeDisplayName,places.currentOpeningHours.openNow,places.location,places.googleMapsUri,places.photos`
- **Restaurant Detail Requests (`places/{placeId}`)**:
  - Adds `regularOpeningHours`, `nationalPhoneNumber`, `websiteUri`, `reviews`, and `googleMapsLinks` only when a user opens a dedicated restaurant detail page.

### Google Maps Platform Policy Compliance

1. **No Permanent Caching of Restricted Content**:
   - Do not copy Google Places listings, ratings, reviews, or photos into Supabase tables.
   - Only `google_place_id` may be stored persistently in `saved_places` and `user_reviews`.
2. **Mandatory Attribution**:
   - Every screen showing Google Places data displays clear **Google Maps** attribution.
   - Google ratings and review counts are explicitly labelled (`Google Rating`).
   - Individual Google reviews display author attribution (`authorAttribution.displayName`, avatar/profile URI where provided), relative time, and a direct link to the review on Google Maps (`googleMapsUri`).
3. **Zero Fabrication**:
   - Missing ratings, prices, opening hours, or reviews are honestly shown as unavailable rather than replaced with guessed values.

## 2. Development Mock Mode (`EXPO_PUBLIC_DATA_MODE=mock`)

To prevent accidental API charges during UI development and automated Jest testing:
- When `EXPO_PUBLIC_DATA_MODE=mock` (or when Supabase/Google credentials are not yet configured), the app uses clearly marked local development fixtures for Islamabad and Rawalpindi.
- A visible badge in development mode indicates when sample/fixture data is active so developers never confuse mock fixtures with live production API responses.
