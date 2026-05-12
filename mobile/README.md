# HoneyDew Mobile

React Native (Expo) app for iOS and Android — demand-side home services on the RSE marketplace.

## Setup

```bash
cd mobile
npm install
```

Set your HoneyDew server URL in `src/api.js`:
```js
export const API_BASE = 'https://your-honeydew-server.com';
```

## Run

```bash
# Start dev server (scan QR code with Expo Go)
npm start

# iOS simulator
npm run ios

# Android emulator
npm run android
```

## Build for release

Uses [EAS Build](https://docs.expo.dev/build/introduction/). Set up your account once:

```bash
npm install -g eas-cli
eas login
eas build:configure
```

Then build:

```bash
# iOS (.ipa)
npm run build:ios

# Android (.apk / .aab)
npm run build:android
```

## Screens

| Screen | Description |
|--------|-------------|
| `AuthScreen` | Sign in / create account |
| `DashboardScreen` | Open requests, active jobs, rating flow |
| `PostJobScreen` | Category picker, description, photo upload, address, budget |
| `JobDetailScreen` | Full job view, provider info, complete & rate |

## Structure

```
mobile/
├── App.js                    Entry point + navigation
├── app.json                  Expo config (bundle IDs, permissions)
├── babel.config.js
├── package.json
├── assets/                   App icon + splash (add before publishing)
└── src/
    ├── api.js                HoneyDew API client (cookie-based session)
    ├── theme.js              Colors, radius, shadow
    ├── screens/
    │   ├── AuthScreen.js
    │   ├── DashboardScreen.js
    │   ├── PostJobScreen.js
    │   └── JobDetailScreen.js
    └── components/
        ├── JobCard.js
        └── StarRating.js
```
