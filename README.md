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
