# KhanaScene — Privacy Policy, Terms & App Store / Play Store Disclosures

**Effective Date:** October 2026  
**Product:** KhanaScene (“Khana kahan? Scene yahan.”)  
**Initial Launch Market:** Islamabad & Rawalpindi, Pakistan

---

## 1. Public Privacy Policy

### 1.1 Overview
KhanaScene is a restaurant discovery, rating comparison, and dining guide for Pakistan. Users can browse, search, filter, and compare restaurants as guests without creating an account.

### 1.2 Information We Collect
1. **Optional Account Information**:
   - If you choose to create an account via Supabase Auth, we store your email address, display name, and preferred city (`Islamabad` or `Rawalpindi`).
2. **Location Information (On-Demand Only)**:
   - KhanaScene requests foreground device location permission **only** when you explicitly tap **"Near Me"**, **"Sort by Nearest"**, or **"Enable Device Location"**.
   - We do **not** track continuous background location or retain historical location logs.
   - If you decline location access, all restaurant discovery features remain usable via manual city and neighbourhood selection.
3. **Saved Places (Favourites)**:
   - Guest users: Saved place references (`placeId`) are stored locally on your device using `AsyncStorage`.
   - Signed-in users: Saved place references (`google_place_id` / `restaurant_record_id`) are synchronised to `public.saved_places` in Supabase PostgreSQL.
4. **User-Generated Reviews & Restaurant Proposals**:
   - When signed in, you may submit original KhanaScene restaurant reviews (`public.user_reviews`), review reports (`public.review_reports`), or restaurant proposals (`public.restaurant_submissions`). All submissions undergo moderation before public display.
5. **Google Places API Data**:
   - Live restaurant ratings, review counts, opening hours, and review snippets are retrieved from **Google Places API (New)** and attributed to **Google Maps**. Restricted Google content is never permanently copied into our database.

### 1.3 Third-Party Processors
- **Supabase**: Authentication, PostgreSQL database hosting, and Edge Functions.
- **Google Maps Platform (Google Places API New & Google Maps URLs)**: Restaurant search, place details, and external map directions.

### 1.4 Data Retention & Account Deletion
- You can permanently delete your KhanaScene account and all associated personal data (profile, saved places, reviews, reports, and submissions) at any time directly inside the app:
  - Navigate to **Profile -> KhanaScene Account -> Delete Account -> Confirm Delete**.
  - Account deletion immediately invokes our server-side deletion routine (`delete_my_account` / `delete-account` Edge Function), cascading deletion across all user tables.
- You may also request assistance or data deletion via email at `support@khanascene.pk`.

---

## 2. Google Play Store & Apple App Store Listing Metadata

- **App Name**: KhanaScene
- **Subtitle / Short Description**: Pakistan's restaurant discovery & comparison guide (`Khana kahan? Scene yahan.`)
- **Primary Category**: Food & Drink / Travel & Local
- **Target Age Rating**: 4+ / Everyone
- **Account Requirement Disclosure**: No account required for core browsing, searching, filtering, or restaurant comparison. Optional email sign-in is used only for cloud-synced favourites and submitting community reviews.
- **In-App Account Deletion**: Implemented in-app under `Profile -> Delete Account`.
- **Permissions Justification**:
  - `ACCESS_COARSE_LOCATION` / `ACCESS_FINE_LOCATION` / `NSLocationWhenInUseUsageDescription`: Used strictly when the user selects "Near Me" or sorts restaurants by distance in Islamabad and Rawalpindi.
