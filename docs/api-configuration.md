# KhanaScene — API Configuration, Policy Compliance & Zero-Cost Strategy

## 1. The 3-Layer "Zero-Cost Until Revenue" Strategy ($0.00/Month Guarantee)

KhanaScene is architected so that operating costs remain **$0.00/month** until the product generates revenue, while remaining 100% compliant with Google Maps Platform and Supabase policies.

### Layer 1: Supabase-First Discovery ($0/month)
- **Home Screen ("Explore") & Category Browsing = 100% Supabase**:
  - `Explore by Cuisine`, `KhanaScene Picks`, `Budget-Friendly Restaurants`, and default city lists (`Islamabad` and `Rawalpindi`) are served from KhanaScene's own **Supabase PostgreSQL** database (`restaurant_records`, `restaurant_menus`, `menu_items`, `user_reviews`).
  - No background Google Places API requests are fired when a user simply opens the app.
- **Search Queries Hit Supabase First**:
  - Standard search queries check KhanaScene's verified database first.
  - Live Google Places API calls are only made when needed and only while the monthly free-tier budget has remaining capacity.

### Layer 2: Dual Hard Circuit Breakers on Google Places API (Guaranteed $0.00 Bill)
Google Maps Platform provides free monthly usage allowances per SKU (`10,000/mo` for Essentials, `5,000/mo` for Pro, and `1,000/mo` for Enterprise fields like ratings/reviews/hours). To make it mathematically impossible to exceed the free tier:

1. **Database Circuit Breaker (`public.api_usage_counters` + `increment_api_usage_if_within_limit` RPC)**:
   - Every request to our `places-proxy` Supabase Edge Function atomically checks and increments the current month's (`YYYY-MM`) counter in PostgreSQL **before** calling Google:
     - `places_text_search_enterprise`: Hard-capped at **850 requests/month** (well below Google's 1,000 free monthly cap).
     - `places_details_enterprise`: Hard-capped at **850 requests/month** (well below Google's 1,000 free monthly cap).
   - The instant the counter reaches `850` in any calendar month, the database RPC returns `allowed = false`, the Edge Function returns `quotaExceeded: true` without calling Google, and the mobile app seamlessly falls back to KhanaScene's Supabase records + free Google Maps deep links.
2. **Google Cloud Console Hard Daily Quota Cap**:
   - In Google Cloud Console $\rightarrow$ *APIs & Services* $\rightarrow$ *Places API (New)* $\rightarrow$ *Quotas*, set the daily request limit to **28 requests/day** ($28 \times 31 = 868 < 1,000$ free monthly allowance). Even if an external script or bug occurs, Google's gateway rejects request #29 at $0.00 cost.

### Layer 3: Unlimited Free Google Maps Deep Links ($0 Forever)
- Standard **Google Maps URLs** (`https://www.google.com/maps/search/?api=1&query=...` and `https://www.google.com/maps/dir/?api=1&destination=...`) require **no API key** and are **100% free and unlimited forever**.
- Whenever a user taps **Directions**, **View on Google Maps**, or **View All Google Reviews** (or when the monthly free Places API allowance is paused), KhanaScene opens the official Google Maps destination directly on the user's device at zero cost.

### Monthly Operating Cost Summary

| Service | Tier Used | Hard Cap Enforced | Monthly Cost |
|---|---|---|---|
| **Supabase (DB, Auth, Edge Functions)** | Free Tier | Hard-capped by Supabase Free Plan | **$0.00** |
| **Google Maps Links & Directions** | Google Maps URLs | Unlimited & Free by Google policy | **$0.00** |
| **Google Places API (New)** | Free Monthly Allowance | Hard-stopped at **850/mo** in DB + Google Quota Cap | **$0.00** |
| **Expo / EAS Builds** | Free Plan | 30 free cloud builds/month | **$0.00** |
| **Total Monthly Operating Cost** | | | **$0.00 / month** |

> **Scaling Up After Revenue**: Once KhanaScene generates revenue, you can raise `monthly_hard_limit` in `public.api_usage_counters` via a single SQL update without redeploying the mobile app.

---

## 2. Google Places API (New) Technical Configuration

KhanaScene uses **Google Places API (New)** (`https://places.googleapis.com/v1/places:...`) via a controlled backend proxy (`supabase/functions/places-proxy`).

### Required Google Cloud Setup (When Enabling Live Mode)

1. Create or select a Google Cloud Project.
2. Enable **Places API (New)** in Google Cloud Console.
3. Under **APIs & Services -> Places API (New) -> Quotas**, set the daily request limit to `28 requests/day` to lock usage inside the free tier.
4. Create a restricted Server API Key for the Supabase Edge Function:
   - Restrict API key to **Places API (New)** only.
   - Store the key in Supabase secrets:
     ```bash
     supabase secrets set GOOGLE_PLACES_API_KEY=your_restricted_server_key
     ```

### Field Mask Discipline (Cost Control)

Google Places API (New) bills per request based on the highest SKU triggered by the `X-Goog-FieldMask` header. Our backend proxy enforces strict field masks:

- **Search List Requests (`places:searchText`)**:
  - FieldMask: `places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.primaryTypeDisplayName,places.currentOpeningHours.openNow,places.location,places.googleMapsUri`
- **Restaurant Detail Requests (`places/{placeId}`)**:
  - FieldMask: `id,displayName,formattedAddress,shortFormattedAddress,rating,userRatingCount,priceLevel,primaryTypeDisplayName,currentOpeningHours.openNow,regularOpeningHours.weekdayDescriptions,nationalPhoneNumber,websiteUri,location,googleMapsUri,reviews`

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

## 3. Development Mock Mode (`EXPO_PUBLIC_DATA_MODE=mock`)

To prevent any API usage during local UI development and automated Jest testing:
- When `EXPO_PUBLIC_DATA_MODE=mock` (the default), the app uses clearly marked local development fixtures for Islamabad and Rawalpindi.
- A visible badge (`DEV FIXTURE`) indicates when sample/fixture data is active so developers never confuse mock fixtures with live production API responses.
