# QR Point — Claude Instructions

## Project

QR Point is a React Native / Expo SDK 54 mobile app for iOS and Android. Users can create fully customizable QR codes, scan them, and manage a history — designed for App Store publication as a Freemium product.

**Core value:** Ein QR-Code in unter 30 Sekunden erstellen, der sofort professionell aussieht und geteilt werden kann.

## Stack

- **Framework:** Expo SDK 54, React Native 0.81.5, Expo Router ~6, TypeScript strict
- **QR rendering:** WebView + `qr-code-styling` CDN (requires internet; bundling deferred to Phase 4)
- **Camera:** `expo-camera` v17 — use `CameraView` + `useCameraPermissions`, NOT the legacy `Camera` component
- **Storage:** `@react-native-async-storage/async-storage`
- **File system:** Import from `expo-file-system/legacy` (not `expo-file-system`) for `documentDirectory` + `EncodingType`
- **Image picker:** `expo-image-picker`

## Design System

- **Primary:** Indigo `#4648d4`
- **Surface:** `#faf8ff`
- **Font:** Inter (via `useFonts`)
- **Radius:** 16px cards, 12px smaller elements
- Design tokens live in `constants/Theme.ts`

## Key Files

- `constants/Theme.ts` — COLORS, SPACING, RADIUS, TYPOGRAPHY tokens
- `constants/QRTypes.ts` — QRType union, QRCodeConfig, QRHistoryItem, buildQRContent()
- `hooks/useQRHistory.ts` — AsyncStorage-backed history hook
- `app/(tabs)/_layout.tsx` — 4-tab layout (Dashboard, Scannen, Erstellen, Verlauf)
- `app/(tabs)/index.tsx` — Dashboard
- `app/(tabs)/create.tsx` — QR editor with WebView live preview
- `app/(tabs)/scan.tsx` — Camera scanner
- `app/(tabs)/history.tsx` — History list

## GSD Workflow

Planning artifacts live in `.planning/`. Start phases with `/gsd-plan-phase <n>`.

Current phase: **1 — Core Functionality** (complete free-tier feature set)

Roadmap: `.planning/ROADMAP.md` | Requirements: `.planning/REQUIREMENTS.md` | State: `.planning/STATE.md`

## Constraints

- Expo **Managed Workflow** — no bare native modules without EAS Build
- QR generation needs internet (CDN); flag this if working on offline support
- Apple/Google take 30% on IAP; RevenueCat integration deferred to Phase 3
- No backend, no cloud sync — everything is local (DSGVO-friendly)
