# KhanaScene — Architecture Overview

## 1. Product Purpose

**KhanaScene** (“Khana kahan? Scene yahan.”) is a restaurant discovery, rating comparison, and dining guide built for Pakistan, starting with **Islamabad** and **Rawalpindi**.

It is strictly a discovery and comparison guide — **not** a food delivery platform, reservation system, or AI chatbot.

## 2. Core Architectural Principles

1. **Strict Separation of Data Sources**
   - **Google Places API (New)**: Used for live place search, ratings, review counts, permitted place reviews, opening status, and Google Maps attribution links.
   - **KhanaScene Owned Data (Supabase PostgreSQL)**: Cities, neighbourhoods/areas, cuisine definitions, curated "KhanaScene Picks", verified menu items & PKR prices, and original KhanaScene user reviews.
   - **Zero Unauthorised Caching**: Google Places content (names, ratings, reviews, photos) is never permanently stored in Supabase. Only `google_place_id` references are stored in `saved_places` or linked to `user_reviews` where permitted by Google Maps Platform Terms.
2. **Backend-Controled API Security**
   - Privileged Google Places API keys never ship inside the mobile client (`EXPO_PUBLIC_*`).
   - All Google Places Web Service calls pass through a controlled **Supabase Edge Function** (`places-proxy`) that validates parameters, enforces rate limits, applies strict minimal FieldMasks, and strips unused payload data.
3. **Guest-First Experience**
   - All discovery, search, filtering, cuisine browsing, and side-by-side comparison features work without an account.
   - Guest favourites are stored locally on the device (`AsyncStorage` storing permitted `placeId` references) and can be synchronised to Supabase when a user signs in.
4. **Deterministic, Transparent Ranking (No AI)**
   - Google ratings and review counts are always displayed as returned and clearly labelled as Google data.
   - KhanaScene user reviews use a deterministic Bayesian-adjusted ranking formula:
     $$\text{Adjusted Score} = \frac{v}{v + m} R + \frac{m}{v + m} C$$
   - Google ratings and KhanaScene ratings are never merged into a single synthetic score.

## 3. Directory Structure

Per Expo SDK 58 and project conventions, routes reside in `src/app/` and non-route application code resides in `src/`:

```text
src/
  app/                      # Expo Router screens and layouts
    _layout.tsx             # Root Stack navigator, providers & splash handling
    (tabs)/                 # 4 primary bottom tabs
      _layout.tsx           # Tab bar layout (Explore, Search, Saved, Profile)
      index.tsx             # Screen 2: Explore Home Screen
      search.tsx            # Screen 3: Search & Filters
      saved.tsx             # Screen 7: Saved Restaurants
      profile.tsx           # Screen 8: Profile & Settings
    restaurant/
      [placeId].tsx         # Screen 4: Restaurant Detail Page
    compare.tsx             # Screen 5: Side-by-Side Restaurant Comparison (up to 3)
    cuisines.tsx            # Screen 6: Cuisine & Category Discovery
    map.tsx                 # Screen 9: Map & External Directions View
    auth/
      sign-in.tsx           # Email Sign-In
      sign-up.tsx           # Email Sign-Up
  components/               # Reusable UI components (Cards, Badges, Attribution, States)
  features/                 # Feature-scoped modules
    explore/
    search/
    restaurants/
    comparison/
    favourites/
    profile/
    authentication/
    reviews/
  services/
    google-places/          # Client interface to Supabase Edge Function / dev mock mode
    supabase/               # Supabase client & auth helpers
  repositories/             # Data access layer combining Supabase + Places cleanly
  hooks/                    # Custom React & TanStack Query hooks
  stores/                   # Zustand stores (city/area selection, comparison tray, saved places)
  types/                    # Strict TypeScript domain & API interfaces
  theme/                    # KhanaScene brand palette, typography, spacing
  utils/                    # Formatting, Bayesian ranking, distance & price helpers
  config/                   # Environment config, initial cities (Islamabad/Rawalpindi), cuisines
supabase/
  migrations/               # Version-controlled PostgreSQL schema & RLS policies
  functions/                # Supabase Edge Functions (Google Places proxy, account deletion)
tests/
  unit/                     # Pure logic tests (ranking, filters, search query parsing)
  components/               # React Native Testing Library component tests
  integration/              # Repository & flow integration tests
docs/
  setup.md
  architecture.md
  api-configuration.md
  deployment.md
```

## 4. State Management Strategy

- **Zustand (`src/stores/`)**:
  - `usePreferencesStore`: Active city (`Islamabad` or `Rawalpindi`), selected neighbourhood/area, location permission status.
  - `useComparisonStore`: Up to 3 selected restaurant references for side-by-side comparison.
  - `useSavedStore`: Guest local saved `placeId` list and sync state with Supabase `saved_places`.
- **TanStack Query (`@tanstack/react-query`)**:
  - Manages request lifecycles, in-memory session caching (respecting policy rules), retries, and deduplication for search and detail queries.
