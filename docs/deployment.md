# KhanaScene — Build & Deployment Guide (Windows + EAS)

## 1. Building on Windows without a Mac

Because the primary development environment is Windows:
- **Android**: Can be tested in Expo Go, built locally with Android Studio / Android SDK (`npx expo run:android`), or built in the cloud via EAS Build.
- **iOS**: Built in the cloud on macOS infrastructure using **Expo Application Services (EAS Build)**.

## 2. Provisional App Identifiers

Configured in `app.json`:
- **App Name**: `KhanaScene`
- **Slug**: `khanascene`
- **URL Scheme**: `khanascene://`
- **Android Package**: `pk.khanascene.app`
- **iOS Bundle Identifier**: `pk.khanascene.app`

## 3. EAS Build Profiles (`eas.json`)

- `development`: Creates a development client binary (`developmentClient: true`) for internal testing on physical Android devices or iPhones.
- `preview`: Creates an internal distribution APK (Android) or ad-hoc/simulator build (iOS) for QA testing.
- `production`: Creates signed store-ready Android App Bundles (`.aab`) and iOS App Store archives (`.ipa`) with auto-incrementing build numbers.

## 4. Key EAS Commands

Always invoke EAS CLI via `npx eas-cli@latest`:

```bash
# 1. Log in to your Expo account
npx eas-cli@latest login

# 2. Link the project to your EAS account
npx eas-cli@latest project:init

# 3. Build Android Development APK/Client in the cloud
npx eas-cli@latest build --platform android --profile development

# 4. Build Android Preview APK (installable directly on any Android phone)
npx eas-cli@latest build --platform android --profile preview

# 5. Build iOS Development / Preview / Production binary in the cloud
# (Requires an active Apple Developer Program membership for physical device signing & TestFlight)
npx eas-cli@latest build --platform ios --profile preview
npx eas-cli@latest build --platform ios --profile production

# 6. Submit to Google Play / Apple App Store
npx eas-cli@latest submit --platform android
npx eas-cli@latest submit --platform ios
```

## 5. iOS Cloud Build Prerequisites

To run a signed iOS build on EAS for physical iPhones or TestFlight:
1. Active **Apple Developer Program** account.
2. Run `npx eas-cli@latest credentials` or `npx eas-cli@latest build --platform ios` and sign in with your Apple ID when prompted so EAS can manage provisioning profiles and distribution certificates automatically in the cloud.
3. No local Mac is required for building or submitting to TestFlight via `eas submit --platform ios`.
