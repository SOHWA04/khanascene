# KhanaScene

**“Khana kahan? Scene yahan.”**  
*Pakistan's restaurant discovery guide.*

KhanaScene is a React Native + Expo + TypeScript mobile application (Android & iOS) for discovering, filtering, and comparing restaurants in **Islamabad** and **Rawalpindi**, Pakistan.

## Key Principles

- **Accuracy over volume**: Never fabricates restaurant ratings, reviews, menus, prices, or opening hours.
- **Clear Data Separation**: Explicitly distinguishes **Google Maps / Places API (New)** data from **KhanaScene-owned** metadata and reviews.
- **Guest-First**: Browse, search, filter, and compare up to 3 restaurants side by side without needing an account.
- **Zero AI / Zero Delivery**: Deterministic ranking rules; strictly a dining discovery and comparison guide.

## Tech Stack

- **Mobile Framework**: React Native `0.88` + Expo SDK `58` + TypeScript
- **Navigation**: Expo Router (`src/app/`)
- **State & Caching**: Zustand (`src/stores/`) + TanStack Query (`@tanstack/react-query`)
- **Backend**: Supabase Auth, PostgreSQL (with RLS), and Supabase Edge Functions
- **Discovery API**: Google Places API (New) via controlled backend proxy
- **Testing**: Jest + `jest-expo` + React Native Testing Library
- **Cloud Builds**: Expo Application Services (EAS Build)

## Quick Start

```bash
# 1. Copy environment variables template
cp .env.example .env.local

# 2. Start the Expo development server
npx expo start

# 3. Run static analysis and tests
npm run typecheck
npm run lint
npm test
```

## Documentation

- [Setup Guide](docs/setup.md)
- [Architecture Overview](docs/architecture.md)
- [API Configuration, Policy Compliance & $0.00/Month Strategy](docs/api-configuration.md)
- [Privacy Policy & Store Disclosures](docs/privacy-and-store-disclosures.md)
- [Build & Deployment Guide (Windows + EAS)](docs/deployment.md)
