# KhanaScene — AI Agent Guide (AGENTS.md)

This document is the single source of truth for AI agents (Antigravity, OpenAI Codex, Claude Code, Cursor, Copilot) working on **KhanaScene**. Read this before making changes to understand the architecture, active features, strict guidelines, and commands.

---

## 1. Project Overview

**KhanaScene** (*“Khana kahan? Scene yahan.”*) is a cross-platform mobile application (iOS & Android) with first-class Web support (`react-native-web`), built for restaurant discovery, group decision-making, and dining utilities in **Islamabad** and **Rawalpindi**, Pakistan.

- **Production Web URL**: `https://khanascene.netlify.app`
- **GitHub Repository**: `https://github.com/SOHWA04/khanascene.git` (Default branch: `master`)
- **Backend / Database**: Supabase PostgreSQL (`iqeijeblasptjnhuevqf.supabase.co`) with Row Level Security (RLS) & Edge Functions
- **Design Language**: Pakistani Emerald (`#0E382C`, `#173D32`), Warm Amber/Gold (`#B45309`, `#F59E0B`), and crisp slate neutrals

---

## 2. Tech Stack & Dependencies

- **Mobile Framework**: React Native `0.88.0` + Expo SDK `58.0.20` + TypeScript `~6.0.3`
- **Navigation**: Expo Router `~58.0.27` (`src/app/`)
- **State Management**: Zustand `^5.0.16` (`src/stores/`)
- **Server State & Caching**: TanStack React Query `^5.104.5`
- **Database Client**: `@supabase/supabase-js` `^2.118.0`
- **Device & Native APIs**: `expo-location`, `expo-notifications`, `expo-clipboard`, `@react-native-async-storage/async-storage`
- **Web Platform**: `react-native-web` `~0.21.4` (Hosted on Netlify via `netlify.toml`)
- **Testing**: Jest `~30.5.2` + `jest-expo` + React Native Testing Library (12 test suites, 54 unit tests)

---

## 3. Core Subsystems & Directory Structure

```text
src/
├── app/                              # Expo Router Screens (Routes ONLY)
│   ├── (tabs)/                       # 4 Main Tabs: Explore, Search, Saved, Profile
│   ├── poll/[pollId].tsx             # Live Group Voting Poll Room
│   ├── restaurant/[placeId].tsx      # Restaurant Detail Page (Menus, Deals, Parking)
│   ├── compare.tsx                   # 3-Way Side-by-Side Comparison
│   ├── roulette.tsx                  # Random Scene Decider Wheel
│   └── auth/                         # Sign-In & Sign-Up
├── components/                       # Reusable UI Components
│   ├── CreateGroupPollModal.tsx      # Modal to shortlist 2-5 spots and launch poll
│   ├── GroupPollTrayBar.tsx          # Floating bottom pill bar when spots are picked
│   ├── EasyBillSplitterModal.tsx     # Student bill splitter with Easypaisa/banks
│   ├── BillEstimatorModal.tsx        # Dine-in menu price calculator & card discount
│   ├── RouletteModal.tsx             # Interactive spin wheel modal
│   └── RestaurantCard.tsx            # Unified card with poll, compare, & saved actions
├── repositories/                     # Data Access Layer (Supabase + Local Storage)
│   ├── pollRepository.ts             # Group polls, votes upsert, tallies, close poll
│   ├── restaurantRepository.ts       # Curated + Google Places deduplication
│   ├── cardDealsRepository.ts        # Bank discounts (HBL, Meezan, Alfalah, etc.)
│   └── reviewRepository.ts           # Bayesian user reviews
├── stores/                           # Zustand Global State
│   ├── usePollStore.ts               # Shortlisted candidate spots (max 5 spots)
│   ├── usePaymentAccountsStore.ts    # User's saved Easypaisa, JazzCash, SadaPay, Banks
│   ├── useContriSplitsStore.ts       # Live friend debt tracker (Paid vs Pending)
│   └── usePreferencesStore.ts        # City (Islamabad/Rawalpindi), Area, Diet
├── services/
│   └── notificationService.ts        # Local scheduled push notifications (expo-notifications)
└── theme/                            # Colors, Typography, Radii, Shadows
```

---

## 4. Key Features & How They Work

### 4.1. 4–5 Restaurant Live Group Voting Poll Room
- **Location**: `src/app/poll/[pollId].tsx`, `src/repositories/pollRepository.ts`, `src/stores/usePollStore.ts`
- **Workflow**:
  1. Users shortlist 2 to 5 restaurants across Explore, Search, or Compare using the `💬` button.
  2. Floating `GroupPollTrayBar` slides up with candidate count and `Launch Poll 🚀`.
  3. Creates a record in Supabase `group_polls` table and redirects to `/poll/[pollId]`.
  4. Friends open the live room, enter their name, and tap `Vote for this Spot`.
  5. Live percentage bars update automatically; voter chips render below each spot showing **who voted for what** (`Hamza (Organizer)`, `Saad`, `Fatima`).
  6. Organizer taps `End Voting & Crown Winner 🏆` to lock votes and transition to Google Maps directions or Split Bill handoff.
- **WhatsApp Share URL**: Uses `getPollShareUrl()` which detects `EXPO_PUBLIC_APP_URL` (`https://khanascene.netlify.app`) or public window origin. Emojis use clean Unicode without variation selectors (`\uFE0F` / keycaps) to prevent diamond glyph (``) corruptions.

### 4.2. Easy Bill Splitter ("Contri Splitter")
- **Location**: `src/components/EasyBillSplitterModal.tsx`, `src/stores/usePaymentAccountsStore.ts`, `src/stores/useContriSplitsStore.ts`
- **Workflow**:
  1. Enter total amount (PKR) and number of friends (quick chips: 2, 3, 4, 5, 6, 8, 10).
  2. Instantly computes per-person share rounded up.
  3. Connect & save digital wallets: **Easypaisa**, **JazzCash**, **SadaPay**, **NayaPay**, or **Pakistani Bank / Raast** accounts.
  4. Track friends' payment status (`Paid` vs `Pending`).
  5. Tap `Nudge` next to any pending friend to open WhatsApp with a prefilled polite reminder containing the exact amount and account details.
  6. Schedule notification reminders (`expo-notifications`) in 1 hr, 3 hrs, or tonight.

### 4.3. Dual-Mode Storage Architecture
Every major feature operates in a seamless dual-mode:
1. **Supabase PostgreSQL Layer**: When online, persists to `group_polls`, `poll_votes`, `restaurants`, `reviews`, and `user_favorites` with Row Level Security (RLS).
2. **Local AsyncStorage Fallback**: If Supabase is unreachable or in mock mode, automatically caches and serves data locally so the app never crashes or hangs.

---

## 5. Strict Development Rules (MUST FOLLOW)

### 5.1. Expo & React Native APIs
- **Never trust outdated training data**: APIs change with every Expo SDK release.
- **Package Installation**: ALWAYS use `npx expo install <package>` instead of `npm install` or `yarn add`. This ensures SDK 58 compatible versions.
- **Native Directories**: `ios/` and `android/` are generated via Continuous Native Generation (CNG). NEVER edit them by hand; configure `app.json` instead.

### 5.2. React 19 Strict Rules
- **No Synchronous `setState` in `useEffect`**: Under React 19 / Expo SDK 58 strict linting, calling `setState` inside an effect causes cascading re-render warnings. Always derive values using `useMemo` or guard with conditions.
- **Routes Separation**: `src/app/` is strictly for Expo Router screens and layouts. Non-route components, stores, hooks, and repositories MUST live in `src/components/`, `src/stores/`, `src/repositories/`, etc.

### 5.3. Pre-Commit Verification Order
Before declaring any task complete or committing code, run this verification pipeline:
```bash
npm run lint          # Must exit 0 (0 errors, 0 warnings)
npx tsc --noEmit      # Must exit 0 (TypeScript typecheck)
npm test              # All 12 test suites and 54 tests must pass
```

---

## 6. Commands Reference

```bash
# Start development server
npx expo start --web          # Web preview on http://localhost:8081
npm run android               # Android emulator / connected device
npm run ios                   # iOS simulator (macOS only)

# Quality Checks
npm run lint                  # Run expo lint (ESLint 9)
npx tsc --noEmit              # TypeScript type checking
npm test                      # Run Jest test suite

# Web Build & Netlify
npx expo export -p web        # Export production static site to dist/
# Deploys automatically to https://khanascene.netlify.app via Netlify Drop / GitHub
```
