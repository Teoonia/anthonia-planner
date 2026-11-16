# Weekly Board

Anthonia's personal planner: a day plan that flows around classes and the commute,
a weekly board, win streaks, and phone alerts.

- **Website**: built by Netlify from this repo (`npm run build` → `dist`).
- **Android app**: built by GitHub Actions on every push to `main`.
  Download `weekly-board.apk` from the latest **Release** on your phone and open it.
- **Data**: Firebase Auth (email/password) + Firestore under `users/{uid}`.
  Security rules are in `firestore.rules` (paste into Firestore → Rules → Publish).
- **Firebase config**: `src/firebase-config.js`.

## What the Android app adds
- Full-screen alert when each block starts (also over other apps once "Appear on top" is allowed)
- A pinned "Now / Next" notification that stays after the alert is closed
- A home-screen widget with what's on now and the next 3 tasks
- Alarms that survive restarts; turn on everything under Setup → Phone alerts

## Parla! Italian coach (`/parla/`)
A separate app that lives in `public/parla/` and is served at `<site>/parla/`.
Italian lessons A1→B1, AI conversation partner (text or voice-only), live helper that
listens to people (e.g. the cashier) and answers out loud, spaced-repetition words,
and a timed weekly test.

- Open `<site>/parla/` on the phone → browser menu → **Add to Home Screen** to install it.
- Speaking uses the browser's speech recognition (Chrome on Android, Safari on iPhone).
- The AI coach needs a key: Settings ⚙️ → paste a free Gemini key from
  https://aistudio.google.com/apikey (or a Claude API key). It is saved only on that phone.
- Progress is saved on the device (localStorage).
