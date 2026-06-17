# EmoPulse iOS Readiness Handoff

## Files Changed
- `app.json`
- `eas.json`
- `config.ts`
- `src/api/engineClient.ts`
- `src/api/ingestClient.ts`
- `src/api/passwordReset.ts`
- `src/features/teams/TeamsScreen.tsx`
- `src/features/users/AccountScreen.tsx`
- `src/features/users/ForgotPasswordScreen.tsx`
- `src/features/users/LoginScreen.tsx`
- `src/features/users/ProfileScreen.tsx`
- `src/features/users/SignupScreen.tsx`
- `src/navigation/AppNavigator.tsx`
- `src/navigation/RootNavigator.tsx`
- `src/navigation/types.ts`

## What Changed
- Verified production API base is `https://api.emopulse.ai`.
- Added EAS build config for preview and production builds.
- Set final Android package/versionCode while keeping Google Play on hold.
- Kept iOS bundle ID as `com.emopulse.app`, version `1.0.0`, build number `1.0.0`.
- Added iOS transport security config and image picker permission text.
- Enabled camera/photo avatar flows with microphone disabled.
- Added Forgot Password request flow on mobile login.
- Removed in-app reset-token completion because reset is handled by web page at `https://emopulse.ai/reset-password/?token=...`.
- Updated navigation for Forgot Password.
- Improved Teams page visuals.
- Fixed existing signup TypeScript argument error.

## Commands Run
- `rg ...` repository audits for URLs, reset flow, beta/placeholder text, and risky language.
- `node` smoke test for `GET https://api.emopulse.ai/health`.
- `node` smoke test for `POST https://api.emopulse.ai/mobile/forgot-password`.
- `node` checks for guessed privacy/terms/support URLs.
- `npx tsc --noEmit`.
- `npx expo config --type public`.
- `npx eas build --platform ios --profile production`.

## Build/Test Results
- TypeScript: PASS.
- Expo config: PASS.
- API health: PASS.
- Forgot-password API: PASS, generic response confirmed.
- iOS EAS production build: BLOCKED because Expo/EAS login is required.

## Remaining Blockers
- Need Expo login or `EXPO_TOKEN` before EAS iOS build can start.
- Need Apple Developer/App Store Connect access for signing and TestFlight upload.
- Public Privacy Policy, Terms, and Support URLs appear missing/404.
- Visible production-readiness concerns remain:
  - `Beta Feedback`.
  - `Emotional Pulse Beta`.
  - Several `Coming Soon` screens/features.
- Internal code/API naming still uses `bet` in some places; visible UI mostly uses Coins, but App Store copy/screens should avoid gambling or real-money implications.

## Exact Next Step Needed
Run:

```powershell
npx eas login
```

Then run:

```powershell
npx eas build --platform ios --profile production
```

After the build starts, provide Apple Developer credentials/access when EAS asks for iOS signing and App Store Connect setup.
