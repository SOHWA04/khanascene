# KhanaScene — Claude Code Configuration (CLAUDE.md)

Welcome to **KhanaScene** (*“Khana kahan? Scene yahan.”*), a cross-platform mobile & web restaurant discovery and dining companion app for **Islamabad** and **Rawalpindi**, Pakistan.

---

## 1. Quick Project Context

- **Platform**: Expo SDK `58.0.20` + React Native `0.88.0` + React `19.3.0` + TypeScript `~6.0.3`
- **Routing**: Expo Router `~58.0.27` (`src/app/` directory)
- **Live Production Web**: `https://khanascene.netlify.app`
- **GitHub**: `https://github.com/SOHWA04/khanascene.git` (Branch: `master`)
- **Backend**: Supabase (`iqeijeblasptjnhuevqf.supabase.co`) PostgreSQL + RLS + Edge Functions

---

## 2. Essential Commands

```bash
# Development
npx expo start --web          # Start web dev server on http://localhost:8081
npm run android               # Run on Android emulator / device
npm run ios                   # Run on iOS simulator

# Verification (ALWAYS run all 3 before declaring a task done)
npm run lint                  # ESLint 9 via expo lint (0 warnings/errors required)
npx tsc --noEmit              # TypeScript type check (0 errors required)
npm test                      # Jest unit & integration tests (54/54 tests passing)

# Installing Dependencies
npx expo install <package>    # ALWAYS use this instead of bare npm/yarn install!

# Production Web Export
npx expo export -p web        # Exports static SPA to dist/
```

---

## 3. Architecture & File Layout

- **`src/app/`**: Expo Router screens ONLY.
  - `(tabs)/index.tsx`: Explore home screen (Hero carousel, Khana Roulette, quick filters, curated picks).
  - `(tabs)/search.tsx`: Search, cuisine tags, sector filters, card deals, and parking reality.
  - `poll/[pollId].tsx`: **Live Group Voting Poll Room** (real-time percentage tallies, voter transparency chips, winner crowning, WhatsApp share).
  - `restaurant/[placeId].tsx`: Detail page with verified menus, price estimator, and parking reality.
  - `compare.tsx`: 3-way side-by-side comparison screen.
  - `roulette.tsx`: Interactive randomized restaurant decider wheel.
- **`src/components/`**: Reusable UI components.
  - `CreateGroupPollModal.tsx`: Shortlist 2–5 restaurants and launch live poll.
  - `GroupPollTrayBar.tsx`: Floating pill bar showing selected candidates.
  - `EasyBillSplitterModal.tsx`: Instant bill division + Easypaisa/JazzCash/SadaPay/NayaPay/Bank connection + debt tracker.
  - `BillEstimatorModal.tsx`: Dine-in menu price calculator & bank card discount engine.
  - `RestaurantCard.tsx`: Standard card with poll shortlist, compare, and saved actions.
- **`src/repositories/`**: Dual-mode data access layer (Supabase PostgreSQL + `AsyncStorage` local fallback).
  - `pollRepository.ts`: CRUD for group polls, vote upserting, tallies, and poll closing.
  - `restaurantRepository.ts`: Deduplication between Google Places API and curated spots.
  - `cardDealsRepository.ts`: Pakistani bank card discounts (Meezan, HBL, Alfalah, etc.).
- **`src/stores/`**: Zustand state management.
  - `usePollStore.ts`: Shortlist candidate management (max 5 spots).
  - `usePaymentAccountsStore.ts`: User's saved payment wallets.
  - `useContriSplitsStore.ts`: Real-time friend payment status (`Paid` vs `Pending`).
- **`supabase/migrations/`**: SQL migrations with RLS policies (`20261031000003_group_voting_polls.sql`).

---

## 4. Critical Guidelines for Claude

1. **Expo SDK 58 Breaking Changes**: Do not rely on training memory for Expo APIs. If unsure, check `https://docs.expo.dev/versions/v58.0.0/`.
2. **React 19 Hooks Rule**: Never call `setState` synchronously within a `useEffect` body without guard conditions. Derive computed state using `useMemo` to prevent cascading render warnings.
3. **WhatsApp Emojis**: When formatting WhatsApp messages, do not use compound emojis with variation selectors (`\uFE0F` or keycaps like `1️⃣` or `🗳️`) as they corrupt into `` on WhatsApp Web. Use clean standard Unicode (`1.`, `2.`, `*KhanaScene:*`, `•`).
4. **Preserve Comments & Links**: Preserve existing docstrings, and always use clickable `file://` links for file paths and code symbols.
