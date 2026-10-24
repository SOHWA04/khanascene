# KhanaScene — Development Setup Guide

## 1. Prerequisites (Windows Development Environment)

- **Node.js**: v20 LTS or newer (verified: `v26.7.0`)
- **npm**: v10+ (verified: `11.19.0`)
- **Git**: v2.40+ (verified: `2.56.0.windows.2`)
- **Java JDK**: OpenJDK 17 (verified: `17.0.20`)
- **Android SDK**: Installed at `%LOCALAPPDATA%\Android\Sdk` with `platform-tools` (`adb`) and an Android Virtual Device (`Pixel_9_Pro`).
- **EAS CLI**: Installed globally (`eas-cli/25.3.0`)
- **Supabase CLI**: Installed globally (`2.116.0`)

### Android Environment Variables on Windows

Ensure `ANDROID_HOME` and `platform-tools` are configured in your Windows user environment variables so `npx expo run:android` and `adb` work seamlessly from any terminal:

```powershell
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
```

And add `%LOCALAPPDATA%\Android\Sdk\platform-tools` and `%LOCALAPPDATA%\Android\Sdk\emulator` to your User `PATH`.

## 2. Installing Dependencies

Always use `npx expo install` when adding packages so Expo resolves SDK 58-compatible versions:

```bash
npm install
# To add a new package:
npx expo install <package-name>
```

## 3. Environment Variables

Copy `.env.example` to `.env.local` in the project root:

```bash
cp .env.example .env.local
```

### Public Client Variables (`EXPO_PUBLIC_*`)

Only non-secret configuration values may be prefixed with `EXPO_PUBLIC_`:

- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase publishable/anonymous key (protected by Row Level Security).
- `EXPO_PUBLIC_DATA_MODE`: Set to `mock` during local UI development/testing to avoid consuming paid Google Places API quota, or `live` when connected to the configured Supabase Edge Function.
- `EXPO_PUBLIC_DEFAULT_CITY`: Defaults to `islamabad`.

> **IMPORTANT SECURITY RULE:** Never place `GOOGLE_PLACES_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` inside `.env.local` with an `EXPO_PUBLIC_` prefix. Those secrets belong strictly in Supabase Edge Function secrets (`supabase secrets set`).

## 4. Running the Application

```bash
# Start the Expo development server (for Expo Go or development build)
npx expo start

# Typecheck TypeScript
npx tsc --noEmit

# Run ESLint
npx expo lint

# Run automated unit and component tests
npm test
```

## 5. Running on Android (Windows)

1. **Expo Go (Quick UI Preview)**:
   Run `npx expo start` and scan the QR code with Expo Go on a physical Android phone, or press `a` with the Android Emulator running.
2. **Android Development Build**:
   - Local build (requires Android SDK & `ANDROID_HOME` configured):
     ```bash
     npx expo run:android
     ```
   - Cloud build via EAS:
     ```bash
     npx eas-cli@latest build --platform android --profile development
     ```
