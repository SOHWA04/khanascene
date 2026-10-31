# KhanaScene

**“Khana kahan? Scene yahan.”**  
*Pakistan's restaurant discovery, group decision & dining utility guide.*

[![Live Web App](https://img.shields.io/badge/Live%20App-khanascene.netlify.app-0E382C?style=for-the-badge&logo=netlify)](https://khanascene.netlify.app)
[![Tests](https://img.shields.io/badge/Tests-54%20passed-22c55e?style=for-the-badge)](https://github.com/SOHWA04/khanascene)
[![Expo](https://img.shields.io/badge/Expo%20SDK-58.0-black?style=for-the-badge&logo=expo)](https://expo.dev)

KhanaScene is a cross-platform mobile application (Android & iOS) with first-class web compatibility (`react-native-web`), built for discovering, filtering, voting on, and splitting bills at restaurants in **Islamabad** and **Rawalpindi**, Pakistan.

---

## 🌟 Key Features

1. **🗳️ 4–5 Spot Live Group Voting Poll ("Scene Decider")**:
   - Shortlist 2 to 5 restaurants from Explore or Search.
   - Dedicated live room (`/poll/[id]`) with real-time percentage tallies.
   - **Voter transparency**: Pill chips display *who voted for which spot* (`Hamza (Organizer)`, `Saad`, `Fatima`).
   - 1-tap WhatsApp sharing with clean formatting and clickable links.
   - Organizer crowning action: **"End Voting & Crown Winner 🏆"** with Google Maps directions & Bill Split handoff.
2. **🧾 Easy Bill Splitter ("Contri Splitter")**:
   - Divide bills instantly by amount and friends count (`Rs 1,200/person`).
   - Saved Pakistani digital wallets: **Easypaisa**, **JazzCash**, **SadaPay**, **NayaPay**, and **Pakistani Banks / Raast**.
   - Live friend debt tracker (`Paid` vs `Pending`) with 1-tap WhatsApp nudges and push notification reminders.
3. **🎡 Khana Roulette**:
   - Interactive randomized scene decider wheel with budget and distance filters.
4. **💳 Bank Card Discounts & Parking Reality**:
   - Up-to-date card discount listings (HBL, Meezan, Alfalah, Bank Alfalah, etc.) and real-world parking tags (Valet, Easy Street, Congested).
5. **⚖️ 3-Way Side-by-Side Comparison**:
   - Compare up to 3 restaurants simultaneously across ratings, estimated bill, cuisine, and facilities.

---

## 🛠️ Tech Stack

- **Mobile Framework**: React Native `0.88` + Expo SDK `58` + TypeScript
- **Navigation**: Expo Router (`src/app/`)
- **State & Caching**: Zustand (`src/stores/`) + TanStack Query (`@tanstack/react-query`)
- **Backend & Database**: Supabase PostgreSQL (with RLS), Supabase Auth, and Edge Functions
- **Hosting**: Netlify (`https://khanascene.netlify.app`) with SPA rewrite rules
- **Testing**: Jest + `jest-expo` + React Native Testing Library (12 test suites, 54 tests passing)

---

## 🚀 Quick Start

```bash
# 1. Install SDK-compatible dependencies
npm install

# 2. Start Expo Development Server
npx expo start --web          # Open in browser on http://localhost:8081
npm run android               # Open in Android emulator / connected device
npm run ios                   # Open in iOS simulator (macOS only)

# 3. Quality Verification Pipeline
npm run lint                  # Run ESLint (0 errors/warnings)
npx tsc --noEmit              # TypeScript type checking
npm test                      # Run 54 Jest tests
```

---

## 📚 Documentation & AI Guides

- **AI Agent Instructions (Antigravity & Codex)**: [`AGENTS.md`](AGENTS.md)
- **Claude Code Guide**: [`CLAUDE.md`](CLAUDE.md)
- **Architecture Overview**: [`docs/architecture.md`](docs/architecture.md)
- **Setup Guide**: [`docs/setup.md`](docs/setup.md)
- **API Configuration & $0.00/Month Strategy**: [`docs/api-configuration.md`](docs/api-configuration.md)
- **Deployment & EAS Guide**: [`docs/deployment.md`](docs/deployment.md)
